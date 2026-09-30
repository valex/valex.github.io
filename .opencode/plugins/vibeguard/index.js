/**
 * OpenCode V2 порт плагина opencode-vibeguard (npm-версия 0.1.0 написана под V1 API
 * и не загружается в V2: "Plugin must export a default definition with an id...").
 *
 * Что делает:
 * - session hook "context"/"compaction"/"generate"/"title": перед каждым запросом к
 *   модели заменяет чувствительные строки на плейсхолдеры __VG_<CATEGORY>_<hash12>__
 *   (текст, reasoning, input/output tool-частей) — провайдер не видит реальных значений
 * - tool hook "execute.before": перед выполнением инструмента возвращает плейсхолдеры
 *   к реальным значениям, чтобы локальные инструменты работали с настоящими данными
 *
 * Отличия от V1:
 * - хук "experimental.text.complete" (восстановление плейсхолдеров в финальном тексте
 *   ответа модели) не портирован: у V2 нет надёжного эквивалента для потоковых ответов.
 *   Плейсхолдеры остаются в ответах ассистента и в БД — безопасно, утечки нет.
 * - при отсутствии конфига или enabled=false плагин no-op (как в V1)
 */

import { loadConfig } from "./config.js"
import { buildPatternSet } from "./patterns.js"
import { PlaceholderSession } from "./session.js"
import { redactText } from "./engine.js"
import { redactDeep, restoreDeep } from "./deep.js"

// Plugin.define из "@opencode/plugin" может не разрешиться для локального плагина,
// поэтому подключаем его опционально: V2-загрузчику достаточно default-экспорта
// с id и setup-функцией.
let Plugin
try {
  ;({ Plugin } = await import("@opencode/plugin"))
} catch {}

const definition = {
  id: "vibeguard",
  async setup(ctx) {
    const directory = ctx?.location?.directory
    let config = await loadConfig(directory)
    const projectDirectory = ctx?.location?.project?.directory
    if (!config.loadedFrom && projectDirectory && projectDirectory !== directory) {
      config = await loadConfig(projectDirectory)
    }
    const debug = Boolean(process.env.OPENCODE_VIBEGUARD_DEBUG) || Boolean(config.debug)

    if (debug) {
      const from = config.loadedFrom ? config.loadedFrom : "не найден (плагин no-op)"
      console.log(`[opencode-vibeguard] Конфиг: ${from} enabled=${config.enabled}`)
    }

    if (!config.enabled) return

    const patterns = buildPatternSet(config.patterns)
    const sessions = new Map()

    const getSession = (sessionID) => {
      const key = String(sessionID ?? "")
      if (!key) return null
      const existing = sessions.get(key)
      if (existing) return existing
      const created = new PlaceholderSession({
        prefix: config.prefix,
        ttlMs: config.ttlMs,
        maxMappings: config.maxMappings,
      })
      sessions.set(key, created)
      return created
    }

    // sessionID у разных hook-событий лежит в разных полях, поэтому проверяем все известные
    const resolveSessionID = (event, messages) => {
      if (typeof event?.sessionID === "string" && event.sessionID) return event.sessionID
      for (const msg of messages ?? []) {
        const sid = msg?.info?.sessionID ?? msg?.sessionID ?? msg?.parts?.[0]?.sessionID
        if (typeof sid === "string" && sid) return sid
      }
      return ""
    }

    const redactMessages = (event) => {
      const messages = event?.messages
      if (!Array.isArray(messages) || messages.length === 0) return

      const session = getSession(resolveSessionID(event, messages))
      if (!session) return
      session.cleanup()

      let changed = 0
      for (const msg of messages) {
        const parts = Array.isArray(msg?.parts) ? msg.parts : [msg]
        for (const part of parts) {
          if (!part || typeof part !== "object") continue

          // обычный текст (user/assistant) и reasoning
          if (part.type === "text" || part.type === "reasoning") {
            if (part.ignored) continue
            if (typeof part.text !== "string" || !part.text) continue
            const after = redactText(part.text, patterns, session).text
            if (after !== part.text) changed++
            part.text = after
            continue
          }

          // tool-вызовы/выводы: самый частый источник утечки (например, чтение .env)
          if (part.type === "tool") {
            const state = part.state
            if (!state || typeof state !== "object") continue

            // input дезинфицируем глубоко: реально исполненные args содержат открытый текст
            // (перед исполнением он восстанавливается tool-hook'ом), иначе он уйдёт
            // провайдеру в следующих ходах
            if (state.input && typeof state.input === "object") {
              redactDeep(state.input, patterns, session)
            }

            if (state.status === "completed" && typeof state.output === "string") {
              const after = redactText(state.output, patterns, session).text
              if (after !== state.output) changed++
              state.output = after
              continue
            }
            if (state.status === "error" && typeof state.error === "string") {
              const after = redactText(state.error, patterns, session).text
              if (after !== state.error) changed++
              state.error = after
              continue
            }
            if (state.status === "pending" && typeof state.raw === "string") {
              const after = redactText(state.raw, patterns, session).text
              if (after !== state.raw) changed++
              state.raw = after
            }
          }
        }
      }

      if (debug && changed > 0) {
        console.log(`[opencode-vibeguard] Дезинфицировано фрагментов перед запросом: ${changed}`)
      }
    }

    // Дезинфекция должна покрывать каждый вид модельного запроса (гайд миграции V1->V2)
    for (const kind of ["context", "compaction", "generate", "title"]) {
      await ctx.session.hook(kind, (event) => redactMessages(event))
    }

    // Восстановление плейсхолдеров в аргументах инструментов перед исполнением.
    // Хеш плейсхолдера зависит от секрета сессии, поэтому восстановление "чужой" сессией
    // просто оставит нераспознанные плейсхолдеры как есть — безопасно и идемпотентно.
    await ctx.tool.hook("execute.before", (event) => {
      const sid = typeof event?.sessionID === "string" ? event.sessionID : ""
      const targets = sid && sessions.has(sid) ? [sessions.get(sid)] : [...sessions.values()]
      for (const session of targets) {
        session.cleanup()
        restoreDeep(event?.input, session)
      }
    })
  },
}

export default Plugin && typeof Plugin.define === "function" ? Plugin.define(definition) : definition
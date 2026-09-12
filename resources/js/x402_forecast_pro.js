(function () {
    'use strict';

    var btn = document.getElementById('x402-try-btn');
    var out = document.getElementById('x402-try-out');
    var code = out ? out.querySelector('code') : null;
    if (!btn || !out || !code) return;

    var endpoint = 'https://stochastic.fastapicloud.dev/forecast-pro?symbol=BTCUSDT&intervals=1d';

    var acceptsExample = {
        x402Version: 2,
        error: 'Payment required',
        resource: {
            url: 'https://stochastic.fastapicloud.dev/forecast-pro',
            description: 'Extended crypto price forecast: horizon 90, drift/volatility (mu, sigma), ' +
                '50 Monte-Carlo paths, 95% prediction interval, uncertainty bounds, ' +
                'multiple timeframes in one request.',
            mimeType: 'application/json',
            serviceName: 'Stochastic Forecast Pro',
            tags: ['forecast', 'crypto', 'montecarlo']
        },
        accepts: [
            {
                scheme: 'exact',
                network: 'eip155:8453',
                asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                amount: '10000',
                payTo: '0x9e6a9F73d0f3AA7cDd7ed2F747F6a886a16e1277',
                maxTimeoutSeconds: 300,
                extra: { name: 'USDC', version: '2' }
            }
        ]
    };

    btn.addEventListener('click', function () {
        btn.disabled = true;
        var btnText = btn.textContent;
        btn.textContent = 'Requesting...';

        fetch(endpoint, { headers: { Accept: 'application/json' } })
            .then(function (res) {
                return res.text().then(function (body) {
                    var lines = [
                        'HTTP ' + res.status + ' ' + (res.status === 402 ? 'Payment Required' : res.statusText)
                    ];
                    if (body) lines.push('body: ' + body.slice(0, 200));
                    lines.push('');
                    lines.push('payment-required header (base64 JSON), decoded:');
                    lines.push(JSON.stringify(acceptsExample, null, 2));
                    code.textContent = lines.join('\n');
                });
            })
            .catch(function (err) {
                code.textContent = 'Request failed: ' + err;
            })
            .finally(function () {
                out.style.display = 'block';
                btn.disabled = false;
                btn.textContent = btnText;
            });
    });
})();

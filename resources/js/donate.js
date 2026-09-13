class Donate {
    constructor(containerId = "donate_wallets") {

        this.wallets = [
            {
                name: 'BTC (Bitcoin) — SegWit',
                address: 'bc1qnnejvwevfc34epy5ujcvk0sce3qexxvntczf5h'
            },
            {
                name: 'XMR (Monero)',
                address: '41nk3XNcXzS1uQuz5Ny5KtFKXQbYRhA8bJ1TbKLHyChENYmN5NVQaF9c1EnRy4mdqjaLEw1bJRbdKUm7Mn3NwavfQGmcPfY'
            },
            {
                name: 'LTC (Litecoin)',
                address: 'LWV5CAdA9kTZaBjyAQpjWdMRdDW9ArngFD'
            }
        ];

        this.copyIconSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"/><path d="M4.012 16.737A2 2 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></svg>';

        this.container = document.getElementById(containerId);
        if (!this.container) {
            return;
        }

        this.tooltip = document.createElement("div");
        this.tooltip.textContent = "Copied!";

        this.tooltip.style.position = 'fixed';
        this.tooltip.style.padding = '5px 10px';
        this.tooltip.style.backgroundColor = '#000';
        this.tooltip.style.color = '#fff';
        this.tooltip.style.fontSize = '14px';
        this.tooltip.style.zIndex = '9999';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.display = 'none';

        this.init();
    }

    init(){

        for (const wallet of this.wallets) {
            const heading = document.createElement("h2");
            heading.className = "h5 mt-4 mb-2";
            heading.textContent = wallet.name;

            const wrapper = document.createElement("div");
            wrapper.className = "donate-address-wrap";

            const pre = document.createElement("pre");
            pre.className = "donate-address";
            pre.title = "Click to copy";

            const code = document.createElement("code");
            code.textContent = wallet.address;
            pre.appendChild(code);

            pre.addEventListener("click", (event) => {
                this.copyToClipboard(wallet.address);
                this.showTooltip(event);
            });

            const copyButton = document.createElement("button");
            copyButton.type = "button";
            copyButton.className = "donate-copy-btn";
            copyButton.title = "Copy to clipboard";
            copyButton.setAttribute("aria-label", "Copy " + wallet.name + " address to clipboard");
            copyButton.innerHTML = this.copyIconSVG;

            copyButton.addEventListener("click", (event) => {
                this.copyToClipboard(wallet.address);
                this.showTooltip(event);
            });

            wrapper.appendChild(pre);
            wrapper.appendChild(copyButton);

            this.container.appendChild(heading);
            this.container.appendChild(wrapper);
        }

        document.body.appendChild(this.tooltip);
    }

    async copyToClipboard(text){
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
    }

    showTooltip(event){
        this.tooltip.style.left = event.clientX + "px";
        this.tooltip.style.top = event.clientY + "px";

        this.tooltip.style.display = "block";

        setTimeout(() => {
            this.tooltip.style.display = "none";
        }, 2000);
    }
}

new Donate();

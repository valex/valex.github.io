class Donate {
    constructor() {

        this.btc = 'bc1qnnejvwevfc34epy5ujcvk0sce3qexxvntczf5h';
        this.xmr = '41nk3XNcXzS1uQuz5Ny5KtFKXQbYRhA8bJ1TbKLHyChENYmN5NVQaF9c1EnRy4mdqjaLEw1bJRbdKUm7Mn3NwavfQGmcPfY';
        this.ltc = 'LWV5CAdA9kTZaBjyAQpjWdMRdDW9ArngFD';

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
        d3.select('#btc_donate').text(this.btc);
        d3.select('#xmr_donate').text(this.xmr);
        d3.select('#ltc_donate').text(this.ltc);


        const btcDonateElement = document.getElementById("btc_donate");
        const xmrDonateElement = document.getElementById("xmr_donate");
        const ltcDonateElement = document.getElementById("ltc_donate");

        document.body.appendChild(this.tooltip);

        btcDonateElement.addEventListener("click", (event) => {
            this.copyToClipboard(btcDonateElement.textContent);
            this.showTooltip(event);
        });

        xmrDonateElement.addEventListener("click", (event) => {
            this.copyToClipboard(xmrDonateElement.textContent);
            this.showTooltip(event);
        });

        ltcDonateElement.addEventListener("click", (event) => {
            this.copyToClipboard(ltcDonateElement.textContent);
            this.showTooltip(event);
        });
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

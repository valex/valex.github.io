class Donate {
    constructor() {

        this.btc = 'bc1qnnejvwevfc34epy5ujcvk0sce3qexxvntczf5h';
        this.xmr = '41nk3XNcXzS1uQuz5Ny5KtFKXQbYRhA8bJ1TbKLHyChENYmN5NVQaF9c1EnRy4mdqjaLEw1bJRbdKUm7Mn3NwavfQGmcPfY';
        this.ltc = 'LWV5CAdA9kTZaBjyAQpjWdMRdDW9ArngFD';

        this.init();
    }

    init(){
        d3.select('#btc_donate').text(this.btc);
        d3.select('#xmr_donate').text(this.xmr);
        d3.select('#ltc_donate').text(this.ltc);
    }
}

new Donate();

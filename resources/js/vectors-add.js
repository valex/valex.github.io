// VECTORS_ADD_APP = {
//     init: function(){
//         console.log('VECTORS_ADD_APP init()');
//     }
// }

(function(){

    this.init = function (){
        console.log('init()');
    };

    console.log('anon called ');
    this.init();
})()
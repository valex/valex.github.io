import ComplexNumber from './ComplexNumber.js'

class SVGComplexNumber {
    // Constructor
    constructor(real, imaginary, options={}, offsetX = 0, offsetY = 0) {
        let defaults = {
            dasharray: '',
            color: '#0000FF',
            linecap: "butt",
            width: 2,
        };

        this.number = new ComplexNumber(real, imaginary);
        this.options = Object.assign({}, defaults, options);
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    hasOption(name) {
        return name in this.options;
    }

    getOption(name) {
        if( ! this.hasOption(name))
            return null;

        return this.options[name];
    }

    get magnitude(){
        return this.number.magnitude;
    }

    get angle(){
        return this.number.angle;
    }

    get id(){
        return this.getOption('id');
    }

    get re(){
        return this.number.real;
    }

    get im(){
        return this.number.imaginary;
    }

    set re(new_re){
        this.number.real = new_re;
    }

    set im(new_im){
        this.number.imaginary = new_im;
    }

    toString(){
        return this.number.toString()
    }

    arcGenerator(scaleX, arcRadius = 1) {
        const arcPixels = scaleX(arcRadius) - scaleX(0);
        const angleRad = Math.PI / 180 * this.angle;
        
        return d3.arc()
            .innerRadius(0)
            .outerRadius(arcPixels)
            .startAngle(Math.PI/2)
            .endAngle(Math.PI/2 - angleRad);
    }
}

export default SVGComplexNumber;
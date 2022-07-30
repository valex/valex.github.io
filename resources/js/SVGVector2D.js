import Vector2D from './Vector2D'

class SVGVector2D {
    // Constructor
    constructor(x, y, options={}, offsetX = 0, offsetY = 0) {
        let defaults = {
            dasharray: '',
            color: '#0000FF',
            linecap: "butt",
            width: 2,
        };

        this.vector = new Vector2D(x,y);
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
        return this.vector.magnitude;
    }

    get angle(){
        return this.vector.angle;
    }

    get id(){
        return this.getOption('id');
    }

    get x(){
        return this.vector.x;
    }

    get y(){
        return this.vector.y;
    }

    set x(nx){
        this.vector.x = nx;
    }

    set y(ny){
        this.vector.y = ny;
    }
}

export default SVGVector2D;
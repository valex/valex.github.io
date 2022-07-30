class Vector2D {
    // Constructor
    constructor(inX, inY) {
        if (typeof inX != "number")
            throw new Error("Invalid x value.");
        if (typeof inY != "number")
            throw new Error("Invalid y value.");

        // Store the (x, y) coordinates
        this.x = inX;
        this.y = inY;
    }

    get magnitude () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    get angle () {
        if(this.x == 0)
            return 0;
            
        return (180 / Math.PI) * Math.atan(this.y / this.x);
    }
}

export default Vector2D;
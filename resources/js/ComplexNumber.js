class ComplexNumber {
    constructor(real, imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }

    add(other) {
        return new ComplexNumber(
            this.real + other.real,
            this.imaginary + other.imaginary
        );
    }

    subtract(other) {
        return new ComplexNumber(
            this.real - other.real,
            this.imaginary - other.imaginary
        );
    }

    multiply(other) {
        return new ComplexNumber(
            this.real * other.real - this.imaginary * other.imaginary,
            this.real * other.imaginary + this.imaginary * other.real
        );
    }

    conjugate() {
        return new ComplexNumber(this.real, -this.imaginary);
    }

    get magnitude () {
        return Math.sqrt(Math.pow(this.real, 2) + Math.pow(this.imaginary, 2));
    }

    get angle () {
        const RAD_TO_DEG = 180 / Math.PI;
        return RAD_TO_DEG * Math.atan2(this.imaginary, this.real);
    }

    toString() {
        const sign = this.imaginary >= 0 ? '+' : '-';

        if (this.imaginary === 0) return `${this.real}`;
        if (this.real === 0) {
            if(this.imaginary < 0){
                return `${sign}i${Math.abs(this.imaginary)}`;
            }
            return `i${this.imaginary}`;
        }

        return `${this.real} ${sign} i${Math.abs(this.imaginary)}`;
    }
}

export default ComplexNumber;
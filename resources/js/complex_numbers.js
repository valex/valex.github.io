import SVGComplexNumber from "./SVGComplexNumber.js";


class ComplexNumberVizualization{
        // Constructor
    constructor() {

        this.options = {
            elID: 'complex_number_vizualization',
            aspectRatio: 16/9,
            circlesRadius: 8,
            margins: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
            },
            smallestAxisDomain: [-5, 5],
            breakpoints: {
                extraSmall: 576
            }
        };

        this.calculations = {
            windowWidth: null,
            svgWidth: null,
            svgHeight: null,
            mainGroupWidth: null,
            mainGroupHeight: null,

            smallestAxisLabel: 'y',
        };

        this.numbers = {
            z: new SVGComplexNumber(-3.0, 2.0, {
                id: 'number_z',
                html_label: "z",
                magnitude_label: "r",
            })
        };

        this.el = null;
        this.width = null;
        this.height = null;

        this.svg = null;
        this.mainGroup = null;
        this.scaleX = null;
        this.scaleY = null;

        this.init();

    } // end constructor

    init(){
        this.calculations.windowWidth = window.innerWidth;

        if(this.calculations.windowWidth < this.options.breakpoints.extraSmall){
            this.options.aspectRatio = 4/3;
        }

        this.el = document.getElementById(this.options.elID);

        this.calculations.svgWidth = Math.floor( this.el.clientWidth - 1 );
        this.calculations.svgHeight = Math.floor( this.calculations.svgWidth / this.options.aspectRatio );

        if(this.calculations.svgWidth < this.calculations.svgHeight){
            this.calculations.smallestAxisLabel = 'x';
        }
        
        this.calculations.mainGroupWidth = this.calculations.svgWidth - this.options.margins.left - this.options.margins.right;
        this.calculations.mainGroupHeight = this.calculations.svgHeight - this.options.margins.top - this.options.margins.bottom;
        
        this.svg = d3.select(this.el)
                .append("svg")
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr("width", this.calculations.svgWidth)
                .attr("height", this.calculations.svgHeight)
                .on('click', function() {
                    console.log('onClickSvg');
                });

        this.mainGroup = this.svg.append('g')
            .attr('transform', 'translate(' + this.options.margins.left + ',' + this.options.margins.top + ')');

        // Add light gray background
        this.svg.insert('rect', ':first-child')
            .attr('width', this.calculations.svgWidth)
            .attr('height', this.calculations.svgHeight)
            .attr('fill', '#fafafa');

        if(this.calculations.smallestAxisLabel == 'y'){

            this.scaleY = d3.scaleLinear()
                .domain(this.options.smallestAxisDomain)
                .range([ this.calculations.mainGroupHeight, 0]);

            this.scaleX = d3.scaleLinear()
                .domain([
                    this.options.smallestAxisDomain[0] * (this.calculations.mainGroupWidth/this.calculations.mainGroupHeight), 
                    this.options.smallestAxisDomain[1] * (this.calculations.mainGroupWidth/this.calculations.mainGroupHeight), 
                ])
                .range([0, this.calculations.mainGroupWidth ]);
        }

        if(this.calculations.smallestAxisLabel == 'x'){
            this.scaleX = d3.scaleLinear()
                .domain(this.options.smallestAxisDomain)
                .range([0, this.calculations.mainGroupWidth ]);

            this.scaleY = d3.scaleLinear()
                .domain([
                    this.options.smallestAxisDomain[0] * (this.calculations.mainGroupHeight/this.calculations.mainGroupWidth), 
                    this.options.smallestAxisDomain[1] * (this.calculations.mainGroupHeight/this.calculations.mainGroupWidth), 
                ])
                .range([ this.calculations.mainGroupHeight, 0]);
        }

        this.initEvents();

        this.drawAxes();

        this.drawInfoBlock();

        this.drawComplexNumber(this.numbers.z);

        this.placeControls();

    } // end init()

    drawComplexNumber(svg_complex_number){

        if( ! svg_complex_number.hasOption('id'))
            return;

        let x1=svg_complex_number.offsetX;
        let y1=svg_complex_number.offsetY;
        let x2=svg_complex_number.offsetX + svg_complex_number.re;
        let y2=svg_complex_number.offsetY + svg_complex_number.im;
        let dasharray = svg_complex_number.getOption('dasharray');
        let color = svg_complex_number.getOption('color');
        let linecap = svg_complex_number.getOption('linecap');
        let width = svg_complex_number.getOption('width');
        let html_label = svg_complex_number.getOption('html_label');
        let magnitude_label = svg_complex_number.getOption('magnitude_label');
    
        if(svg_complex_number.offsetX == 0 && svg_complex_number.offsetY == 0){
            // draw x-component line
            this.mainGroup.append("line")
                .attr('id', svg_complex_number.id+'_x_component')
                .attr("x1", this.scaleX(x2))
                .attr("y1", this.scaleY(y2))
                .attr("x2", this.scaleX(x2))
                .attr("y2", this.scaleY(0))
                .attr("opacity", '0.3')
                .attr("stroke-dasharray", '5')
                .attr("stroke-width", 1)
                .attr("stroke-linecap", 'butt')
                .attr("stroke", color);

            // draw y-component line
            this.mainGroup.append("line")
                .attr('id', svg_complex_number.id+'_y_component')
                .attr("x1", this.scaleX(x2))
                .attr("y1", this.scaleY(y2))
                .attr("x2", this.scaleX(0))
                .attr("y2", this.scaleY(y2))
                .attr("opacity", '0.3')
                .attr("stroke-dasharray", '5')
                .attr("stroke-width", 1)
                .attr("stroke-linecap", 'butt')
                .attr("stroke", color);
        }
    
        // place label
        if( html_label != null ){

            if( null == svg_complex_number.getOption('html_label_min_width') || this.calculations.svgWidth >= svg_complex_number.getOption('html_label_min_width'))
            {

                const labelX = x2 + 0.4 * svg_complex_number.re / svg_complex_number.magnitude;
                const labelY = y2 + 0.4 * svg_complex_number.im / svg_complex_number.magnitude;

                this.mainGroup.append('text')
                    .html(html_label)
                    .attr('id',svg_complex_number.id+"_label")
                    .style('text-anchor', 'middle')
                    .style('alignment-baseline', 'middle')
                    .attr('fill', '#000')
                    .attr('fill-opacity', 0.7)
                    .attr('font-style','italic')
                    .attr('x',this.scaleX(labelX))
                    .attr('y',this.scaleY(labelY))
                    //.attr('dx',0)
                    //.attr('dy',-14)
                    .attr('font-size','20px');
            }
        }

        // place magnitude label
        if( magnitude_label != null ){

            this.mainGroup.append('text')
                .html(magnitude_label)
                .attr('id',svg_complex_number.id+"_magnitude_label")
                .style('text-anchor', 'middle')
                .style('alignment-baseline', 'middle')
                .attr("transform", "rotate("+(svg_complex_number.re >= 0 ?  -svg_complex_number.angle : 180-svg_complex_number.angle)+","+this.scaleX(x1+((x2-x1) / 2))+","+this.scaleY(y1+((y2-y1) / 2))+")")
                .attr('fill', color)
                .attr('fill-opacity', 0.7)
                .attr('font-style','italic')
                .attr('x',this.scaleX(x1+((x2-x1) / 2)))
                .attr('y',this.scaleY(y1+((y2-y1) / 2)))
                .attr('dx',0)
                .attr('dy',-14)
                .attr('font-size','20px');
        }
    
        // place black dot at the end of vector
        this.mainGroup.append("circle")
            .attr('id', svg_complex_number.id + '_dot')
            .attr("cx", this.scaleX(x2))
            .attr("cy", this.scaleY(y2))
            .attr("r", 3)
            .attr("fill", "black")
            .attr("stroke", "#333")
            .attr("stroke-width", 2);

        // Draw arc for angle phi
        const arcGenerator = svg_complex_number.arcGenerator(this.scaleX, 1);

        this.mainGroup.append('path')
            .attr('id', svg_complex_number.id + '_phi')
            .attr('d', arcGenerator)
            .attr('transform', `translate(${this.scaleX(0)},${this.scaleY(0)})`)
            .attr('fill', '#fff3e0')
            .attr('stroke', '#ff9800')
            .attr('stroke-width', 1);

        this.mainGroup.append('text')
                .html("&phi;")
                .attr('id',svg_complex_number.id+"_phi_label")
                .style('text-anchor', 'middle')
                .style('alignment-baseline', 'middle')
                .attr('fill', '#ff9800')
                .attr('fill-opacity', 0.7)
                .attr('font-style','italic')
                .attr('x',this.scaleX(1.2 * Math.cos(this.numbers.z.angle/2 * Math.PI / 180)))
                .attr('y',this.scaleY(1.2 * Math.sin(this.numbers.z.angle/2 * Math.PI / 180)))
                .attr('dx',0)
                .attr('dy',0)
                .attr('font-size','20px');

        // draw line
        this.mainGroup.append("line")
            .attr('id', svg_complex_number.id)
            .attr("x1", this.scaleX(x1))
            .attr("y1", this.scaleY(y1))
            .attr("x2", this.scaleX(x2))
            .attr("y2", this.scaleY(y2))
            .attr("stroke-dasharray", dasharray)
            .attr("stroke-width", width)
            .attr("stroke-linecap", linecap)
            .attr("stroke", color);

    } // end drawComplexNumber()

    update() {

        d3.select('#z_control')
            .attr("cx", this.scaleX(this.numbers.z.re))
            .attr("cy", this.scaleY(this.numbers.z.im));

        // line end point
        d3.select('#'+this.numbers.z.id)
            .attr("x2", this.scaleX(this.numbers.z.re))
            .attr("y2", this.scaleY(this.numbers.z.im));

        // dot
        d3.select('#' + this.numbers.z.id + '_dot')
            .attr("cx", this.scaleX(this.numbers.z.re))
            .attr("cy", this.scaleY(this.numbers.z.im));

        d3.select('#'+this.numbers.z.id+"_label")
            .attr('x',this.scaleX( this.numbers.z.re + 0.4 * this.numbers.z.re / this.numbers.z.magnitude))
            .attr('y',this.scaleY( this.numbers.z.im + 0.4 * this.numbers.z.im / this.numbers.z.magnitude))
             
        d3.select('#'+this.numbers.z.id+"_magnitude_label")
            .attr('x',this.scaleX( this.numbers.z.re / 2))
            .attr('y',this.scaleY( this.numbers.z.im / 2))
            .attr("transform", "rotate("+(this.numbers.z.re >= 0 ? -this.numbers.z.angle: 180-this.numbers.z.angle)+","+this.scaleX(this.numbers.z.re / 2)+","+this.scaleY(this.numbers.z.im / 2)+")")

        d3.select('#'+this.numbers.z.id+'_phi')
            .attr('d', this.numbers.z.arcGenerator(this.scaleX, 1));

        d3.select('#'+this.numbers.z.id+'_phi_label')
            .attr('x', this.scaleX(1.2 * Math.cos(this.numbers.z.angle/2 * Math.PI / 180)))
            .attr('y', this.scaleY(1.2 * Math.sin(this.numbers.z.angle/2 * Math.PI / 180)));

        d3.select('#'+this.numbers.z.id+ '_x_component')
            .attr("x1", this.scaleX(this.numbers.z.re))
            .attr("y1", this.scaleY(this.numbers.z.im))
            .attr("x2", this.scaleX(this.numbers.z.re))
            .attr("y2", this.scaleY(0))

        d3.select('#'+this.numbers.z.id+ '_y_component')
            .attr("x1", this.scaleX(this.numbers.z.re))
            .attr("y1", this.scaleY(this.numbers.z.im))
            .attr("x2", this.scaleX(0))
            .attr("y2", this.scaleY(this.numbers.z.im))

        d3.select('#z_number_algebraic')
            .html(this.z_number_algebraic());

        d3.select('#z_number_info_length')
            .html(this.z_info_length());

        d3.select('#z_number_info_phi')
            .html(this.z_info_phi());

    }// end update()

    placeControls() {

        // Draggable circles
        this.mainGroup.append('circle')
            .attr('id', 'z_control')
            .classed("draggable", true)
            .attr("cx", this.scaleX(this.numbers.z.re))
            .attr("cy", this.scaleY(this.numbers.z.im))
            .attr("r", this.options.circlesRadius)
            .call(
                d3.drag()
                    .on("start", (event) => this.dragstarted(event))
                    .on('drag', (event) => this.z_dragged(event))
                    .on("end", (event) => this.dragended(event))
            );

    } // end placeControls()

    z_dragged(event){

        let x = event.x,
            y = event.y;

        if ((x < 0) || x > this.calculations.mainGroupWidth  || (y < 0) || y > this.calculations.mainGroupHeight)
            return;

        this.numbers.z.re = this.scaleX.invert(x);
        this.numbers.z.im = this.scaleY.invert(y);

        this.update();

    } // end z_dragged()

    dragstarted(e){
        let circle = d3.select(e.sourceEvent.target).classed("dragging", true);
    }

    dragended(e){
        let circle = d3.select(e.sourceEvent.target).classed("dragging", false);
    }

    initEvents() {


    } // end initEvents()

    drawAxes(){

        let axisXGroup = this.svg.append('g')
            .attr('transform', 'translate(' + this.options.margins.left  + ',' + (this.scaleY(0) + this.options.margins.top) + ')');

        let axisX = d3.axisBottom(this.scaleX)
            .ticks( 2 * Math.abs(Math.floor(this.scaleX.invert(this.calculations.mainGroupWidth))) )
            .tickFormat(x => /[1-9]/.test(x) ? x : "");
        axisXGroup.call(axisX);

        axisXGroup.select(".domain")
            .attr("stroke","#AAAAAA")
            .attr("opacity","0.5");
        axisXGroup.selectAll(".tick line")
            .attr("stroke","#AAAAAA")
            .attr("opacity","0.5");
        axisXGroup.selectAll(".tick text")
            .attr("fill","#000000")
            .attr("opacity","0.5");

        let axisYGroup = this.svg.append('g')
            .attr('transform', 'translate(' + (this.options.margins.left + this.scaleX(0)) + ',' + this.options.margins.top + ')');

        let axisY = d3.axisLeft(this.scaleY)
            .ticks( 2 * Math.abs(Math.floor(this.scaleY.invert(this.calculations.mainGroupHeight))) )
            .tickFormat(y => /[1-9]/.test(y) ? y : "");
        axisYGroup.call(axisY);

        axisYGroup.select(".domain")
            .attr("stroke","#AAAAAA")
            .attr("opacity","0.5");
        axisYGroup.selectAll(".tick line")
            .attr("stroke","#AAAAAA")
            .attr("opacity","0.5");
        axisYGroup.selectAll(".tick text")
            .attr("fill","#000000")
            .attr("opacity","0.5");

    } // end drawAxes()

    drawInfoBlock(){

        if(this.calculations.svgWidth < 500)
            return;

        this.mainGroup.append('text')
            .attr('id', 'z_number_algebraic')
            .html(this.z_number_algebraic())
            .style('text-anchor', 'start')
            .style('alignment-baseline', 'bottom')
            .attr('fill',"#333")
            .attr('opacity', 0.7)
            .attr('x',this.options.margins.left)
            .attr('y',18)
            .attr('dx',0)
            .attr('dy',0)
            .attr('font-size','16px');

        this.mainGroup.append('text')
            .attr('id', 'z_number_info_length')
            .html(this.z_info_length())
            .style('text-anchor', 'start')
            .style('alignment-baseline', 'bottom')
            .attr('fill',"#333")
            .attr('opacity', 0.7)
            .attr('x',this.options.margins.left)
            .attr('y',44)
            .attr('dx',0)
            .attr('dy',0)
            .attr('font-size','16px');

        this.mainGroup.append('text')
            .attr('id', 'z_number_info_phi')
            .html(this.z_info_phi())
            .style('text-anchor', 'start')
            .style('alignment-baseline', 'bottom')
            .attr('fill',"#333")
            .attr('opacity', 0.7)
            .attr('x',this.options.margins.left)
            .attr('y',68)
            .attr('dx',0)
            .attr('dy',0)
            .attr('font-size','16px');

    } // end drawInfoBlock()

    z_number_algebraic() {
        const formatNum = (n) => {
            const fixed = parseFloat(n.toFixed(2));
            return Number.isInteger(fixed) ? fixed.toString() : fixed.toFixed(2);
        };

        const re = formatNum(this.numbers.z.re);
        const im = formatNum(this.numbers.z.im);
        const imRaw = this.numbers.z.im;

        const sign = imRaw >= 0 ? '+' : '-';

        if (imRaw == 0) return `z = ${re}`;
        
        if (this.numbers.z.re == 0) {
            if (imRaw < 0) return `z = -i${Math.abs(parseFloat(im))}`;
            return `z = i${im}`;
        }

        return `z = ${re} ${sign} i${Math.abs(parseFloat(im))}`;
    }

    z_info_length(){
        return "r = &vert; z &vert; = " + this.numbers.z.magnitude.toFixed(2);
    }

    z_info_phi(){
        let angle = this.numbers.z.angle;
        
        let angleDeg = angle.toFixed(2);
        let angleRad = (angle * Math.PI / 180).toFixed(2);
        
        return `&phi; = ${angleDeg}° = ${angleRad} rad`;
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ComplexNumberVizualization();
});

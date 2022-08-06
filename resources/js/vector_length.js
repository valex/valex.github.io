import SVGVector2D from './SVGVector2D.js'

class PAGE_APP {
    // Constructor
    constructor() {

        this.options = {
            elID: 'svg_chart',
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

        this.vectors = {
            a: new SVGVector2D(3.0, 3.0, {
                id: 'vector_a',
                html_label: "a&#773;",
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

        this.drawVector(this.vectors.a);

        this.placeControls();

        this.updateCalculationTable();

    } // end init()

    initEvents() {

        d3.select('#t_a_x').on('input', function(e){
            if( ! APP.isNumeric(e.target.value))
                return;

            let x = parseFloat(e.target.value);

            APP.vectors.a.x = x;
        
            APP.update()
        });

        d3.select('#t_a_y').on('input', function(e){
            if( ! APP.isNumeric(e.target.value))
                return;

            let y = parseFloat(e.target.value);

            APP.vectors.a.y = y;
        
            APP.update()
        });

    } // end initEvents()

    update() {

        d3.select('#a_control')
            .attr("cx", this.scaleX(this.vectors.a.x))
            .attr("cy", this.scaleY(this.vectors.a.y));

        d3.select('#'+this.vectors.a.id)
            .attr("x2", this.scaleX(this.vectors.a.x))
            .attr("y2", this.scaleY(this.vectors.a.y));

        d3.select('#'+this.vectors.a.id + '_label')
            .attr('x',this.scaleX(this.vectors.a.x/2))
            .attr('y',this.scaleY(this.vectors.a.y/2))
            .attr("transform", "rotate("+(-this.vectors.a.angle)+","+this.scaleX(this.vectors.a.x / 2)+","+this.scaleY(this.vectors.a.y / 2)+")")

        d3.select('#'+this.vectors.a.id + '_x_component')
            .attr("x1", this.scaleX(this.vectors.a.x))
            .attr("y1", this.scaleY(this.vectors.a.y))
            .attr("x2", this.scaleX(this.vectors.a.x))
            .attr("y2", this.scaleY(0))

        d3.select('#'+this.vectors.a.id + '_y_component')
            .attr("x1", this.scaleX(this.vectors.a.x))
            .attr("y1", this.scaleY(this.vectors.a.y))
            .attr("x2", this.scaleX(0))
            .attr("y2", this.scaleY(this.vectors.a.y))

        d3.select('#a_vector_info')
            .html(this.a_vectorInfo());

        d3.select('#a_vector_info_length')
            .html(this.a_infoLength());


        this.updateCalculationTable();

    }// end update()

    updateCalculationTable(){

        let activeID = document.activeElement.id;

        if(activeID != 't_a_x'){
            d3.select('#t_a_x').property('value', this.vectors.a.x.toFixed(2));
        }

        if(activeID != 't_a_y'){
            d3.select('#t_a_y').property('value', this.vectors.a.y.toFixed(2));
        }

        d3.select('#t_result').text(this.vectors.a.magnitude.toFixed(2));

    } // end updateCalculationTable()

    a_dragged(event){

        let x = event.x,
            y = event.y;

        if ((x < 0) || x > APP.calculations.mainGroupWidth  || (y < 0) || y > APP.calculations.mainGroupHeight)
            return;

        APP.vectors.a.x = APP.scaleX.invert(x);
        APP.vectors.a.y = APP.scaleY.invert(y);

        APP.update();

    } // end a_dragged()

    dragstarted(e){
        let circle = d3.select(this).classed("dragging", true);
    }

    dragended(e){
        let circle = d3.select(this).classed("dragging", false);
    }

    drawVector(vector){

        if( ! vector.hasOption('id'))
            return;

        let x1=vector.offsetX;
        let y1=vector.offsetY;
        let x2=vector.offsetX + vector.x;
        let y2=vector.offsetY + vector.y;
        let dasharray = vector.getOption('dasharray');
        let color = vector.getOption('color');
        let linecap = vector.getOption('linecap');
        let width = vector.getOption('width');
        let html_label = vector.getOption('html_label');
    
        if(vector.offsetX == 0 && vector.offsetY == 0){
            // draw x-component line
            this.mainGroup.append("line")
                .attr('id', vector.id+'_x_component')
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
                .attr('id', vector.id+'_y_component')
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

            if( null == vector.getOption('html_label_min_width') || this.calculations.svgWidth >= vector.getOption('html_label_min_width'))
            {
                this.mainGroup.append('text')
                    .html(html_label)
                    .attr('id',vector.id+"_label")
                    .style('text-anchor', 'middle')
                    .style('alignment-baseline', 'middle')
                    .attr("transform", "rotate("+(-vector.angle)+","+this.scaleX(x1+((x2-x1) / 2))+","+this.scaleY(y1+((y2-y1) / 2))+")")
                    .attr('fill', color)
                    .attr('fill-opacity', 0.7)
                    .attr('font-style','italic')
                    .attr('x',this.scaleX(x1+((x2-x1) / 2)))
                    .attr('y',this.scaleY(y1+((y2-y1) / 2)))
                    .attr('dx',0)
                    .attr('dy',-14)
                    .attr('font-size','20px');
            }
        }
    
        // place arrow
        this.svg.append("svg:defs").append("svg:marker")
            .attr("id", vector.id+"_arrow")
            .attr("refX", 7)
            .attr("refY", 4)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("markerUnits", "strokeWidth")
            .attr("viewBox", "0 0 8 8")
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,0 L8,4 L0,8 L4,4 L0,0")
            .style("fill", color);

        // draw line
        this.mainGroup.append("line")
            .attr('id', vector.id)
            .attr("x1", this.scaleX(x1))
            .attr("y1", this.scaleY(y1))
            .attr("x2", this.scaleX(x2))
            .attr("y2", this.scaleY(y2))
            .attr("stroke-dasharray", dasharray)
            .attr("stroke-width", width)
            .attr("stroke-linecap", linecap)
            .attr("stroke", color)
            .attr("marker-end","url(#"+vector.id+"_arrow)");

    } // end drawVector()

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

        // Vector a info
        this.mainGroup.append('text')
            .attr('id', 'a_vector_info')
            .html(this.a_vectorInfo())
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
            .attr('id', 'a_vector_info_length')
            .html(this.a_infoLength())
            .style('text-anchor', 'start')
            .style('alignment-baseline', 'bottom')
            .attr('fill',"#333")
            .attr('opacity', 0.7)
            .attr('x',this.options.margins.left)
            .attr('y',44)
            .attr('dx',0)
            .attr('dy',0)
            .attr('font-size','16px');

    } // end drawInfoBlock()

    placeControls() {

        // Draggable circles
        this.mainGroup.append('circle')
            .attr('id', 'a_control')
            .classed("draggable", true)
            .attr("cx", this.scaleX(this.vectors.a.x))
            .attr("cy", this.scaleY(this.vectors.a.y))
            .attr("r", this.options.circlesRadius)
            .call(
                d3.drag()
                    .on("start", this.dragstarted)
                    .on('drag', this.a_dragged)
                    .on("end", this.dragended)
            );

    } // end placeControls()

    a_vectorInfo() {
        let info = "a&#773;&nbsp;&nbsp;&lang;";

        info+=this.vectors.a.x.toFixed(2);
        info+=", ";
        info+=this.vectors.a.y.toFixed(2);

        info+="&rang;";

        return info;
    } // end a_vectorInfo()

    a_infoLength(){
        return "&#8214; a&#773; &#x2016; = " + this.vectors.a.magnitude.toFixed(2);
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

} //end class

let APP = new PAGE_APP();
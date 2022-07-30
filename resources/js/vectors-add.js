import SVGVector2D from './SVGVector2D'

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
            smallestAxisDomain: [-5, 5]
        };

        this.calculations = {
            svgWidth: null,
            svgHeight: null,
            mainGroupWidth: null,
            mainGroupHeight: null,

            smallestAxisLabel: 'y',
        };

        this.vectors = {
            a: new SVGVector2D(-2.5, 2, {
                id: 'vector_a',
                html_label: "a&#773;",
            }),
            b: new SVGVector2D(3.5, 2.4, {
                id: 'vector_b',
                html_label: "b&#773;",
            }),
            a_plus_b: new SVGVector2D(1, 4.4, {
                id: 'a_plus_b_vector',
                color: '#FF0000',
                html_label: "a&#773; + b&#773;",
            }),
            b_moved: new SVGVector2D(3.5, 2.4, {
                id: 'b_moved_vector',
                color: '#AAAAAA',
                dasharray: '3 2'
            }, -2.5, 2)
        };


        this.el = null;
        this.width = null;
        this.height = null;

        this.svg = null;
        this.mainGroup = null;
        this.scaleX = null;
        this.scaleY = null;

        d3.select('#t_a_x').on('input', function(e){
            if( ! APP.isNumeric(e.target.value))
                return;

            let x = parseFloat(e.target.value);

            APP.vectors.a.x = x;
        
            APP.vectors.a_plus_b.x = x + APP.vectors.b.x;

            APP.vectors.b_moved.offsetX = x;

            APP.update()
        })

        d3.select('#t_a_y').on('input', function(e){
            if( ! APP.isNumeric(e.target.value))
                return;

            let y = parseFloat(e.target.value);

            APP.vectors.a.y = y;
        
            APP.vectors.a_plus_b.y = y + APP.vectors.b.y;

            APP.vectors.b_moved.offsetY = y;

            APP.update()
        })

        d3.select('#t_b_x').on('input', function(e){
            if( ! APP.isNumeric(e.target.value))
                return;

            let x = parseFloat(e.target.value);

            APP.vectors.b.x = x;
        
            APP.vectors.a_plus_b.x = x + APP.vectors.a.x;

            APP.vectors.b_moved.x = x;

            APP.update()
        })

        d3.select('#t_b_y').on('input', function(e){
            if( ! APP.isNumeric(e.target.value))
                return;

            let y = parseFloat(e.target.value);

            APP.vectors.b.y = y;
        
            APP.vectors.a_plus_b.y = y + APP.vectors.a.y;

            APP.vectors.b_moved.y = y;

            APP.update()
        })

        this.init();
    }

    init(){
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



        this.drawAxes();

        this.drawInfoBlock();

        this.drawVector(this.vectors.a);
        this.drawVector(this.vectors.b);
        this.drawVector(this.vectors.b_moved);
        this.drawVector(this.vectors.a_plus_b);

        this.placeControls();

        this.updateCalculationTable();

    } // end init

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
            this.mainGroup.append('text')
                .html(html_label)
                .attr('id',vector.id+"_label")
                .style('text-anchor', 'middle')
                .style('alignment-baseline', 'middle')
                .attr("transform", "rotate("+(-vector.angle)+","+this.scaleX(x1+((x2-x1) / 2))+","+this.scaleY(y1+((y2-y1) / 2))+")")
                .attr('fill', color)
                .attr('fill-opacity', 0.7)
                .attr('x',this.scaleX(x1+((x2-x1) / 2)))
                .attr('y',this.scaleY(y1+((y2-y1) / 2)))
                .attr('dx',0)
                .attr('dy',-14)
                .attr('font-size','20px');
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

    }// end drawVector

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

        // Vector b info
        this.mainGroup.append('text')
            .attr('id', 'b_vector_info')
            .html(this.b_vectorInfo())
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
            .attr('id', 'a_plus_b_vector_info')
            .html(this.a_plus_b_vectorInfo())
            .style('text-anchor', 'start')
            .style('alignment-baseline', 'bottom')
            .attr('fill',"#333")
            .attr('opacity', 0.7)
            .attr('x',this.options.margins.left)
            .attr('y',70)
            .attr('dx',0)
            .attr('dy',0)
            .attr('font-size','16px');

    }// end drawInfoBlock

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

    } // end drawAxes

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

        this.mainGroup.append('circle')
            .attr('id', 'b_control')
            .classed("draggable", true)
            .attr("cx", this.scaleX(this.vectors.b.x))
            .attr("cy", this.scaleY(this.vectors.b.y))
            .attr("r", this.options.circlesRadius)
            .call(
                d3.drag()
                    .on("start", this.dragstarted)
                    .on('drag', this.b_dragged)
                    .on("end", this.dragended)
            );
    } // end placeControls

    a_dragged(event){
        let x = event.x,
            y = event.y;

        if ((x < 0) || x > APP.calculations.mainGroupWidth  || (y < 0) || y > APP.calculations.mainGroupHeight)
            return;

        APP.vectors.a.x = APP.scaleX.invert(x);
        APP.vectors.a.y = APP.scaleY.invert(y);

        APP.vectors.a_plus_b.x = APP.scaleX.invert(x)+APP.vectors.b.x;
        APP.vectors.a_plus_b.y = APP.scaleY.invert(y)+APP.vectors.b.y;

        APP.vectors.b_moved.offsetX = APP.scaleX.invert(x);
        APP.vectors.b_moved.offsetY = APP.scaleY.invert(y);

        APP.update();
    } // end a_dragged

    b_dragged(event){
        let x = event.x,
            y = event.y;

        if ((x < 0) || x > APP.calculations.mainGroupWidth  || (y < 0) || y > APP.calculations.mainGroupHeight)
            return;

        APP.vectors.b.x = APP.scaleX.invert(x);
        APP.vectors.b.y = APP.scaleY.invert(y);

        APP.vectors.a_plus_b.x = APP.scaleX.invert(x)+APP.vectors.a.x;
        APP.vectors.a_plus_b.y = APP.scaleY.invert(y)+APP.vectors.a.y;

        APP.vectors.b_moved.x = APP.scaleX.invert(x);
        APP.vectors.b_moved.y = APP.scaleY.invert(y);

        APP.update();
    } // end b_dragged

    dragstarted(e){
        let circle = d3.select(this).classed("dragging", true);
    }

    dragended(e){
        let circle = d3.select(this).classed("dragging", false);
    }

    update(){

        d3.select('#a_control')
            .attr("cx", this.scaleX(this.vectors.a.x))
            .attr("cy", this.scaleY(this.vectors.a.y));

        d3.select('#b_control')
        .attr("cx", this.scaleX(this.vectors.b.x))
        .attr("cy", this.scaleY(this.vectors.b.y));

        d3.select('#'+this.vectors.a.id)
            .attr("x2", this.scaleX(this.vectors.a.x))
            .attr("y2", this.scaleY(this.vectors.a.y));

        d3.select('#'+this.vectors.b.id)
            .attr("x2", this.scaleX(this.vectors.b.x))
            .attr("y2", this.scaleY(this.vectors.b.y));

        d3.select('#'+this.vectors.b_moved.id)
            .attr("x1", this.scaleX(this.vectors.b_moved.offsetX))
            .attr("y1", this.scaleY(this.vectors.b_moved.offsetY))
            .attr("x2", this.scaleX(this.vectors.b_moved.offsetX + this.vectors.b_moved.x))
            .attr("y2", this.scaleY(this.vectors.b_moved.offsetY + this.vectors.b_moved.y));

        d3.select('#'+this.vectors.a_plus_b.id)
            .attr("x2", this.scaleX(this.vectors.a_plus_b.x))
            .attr("y2", this.scaleY(this.vectors.a_plus_b.y));

        d3.select('#'+this.vectors.a.id + '_label')
            .attr('x',this.scaleX(this.vectors.a.x/2))
            .attr('y',this.scaleY(this.vectors.a.y/2))
            .attr("transform", "rotate("+(-this.vectors.a.angle)+","+this.scaleX(this.vectors.a.x / 2)+","+this.scaleY(this.vectors.a.y / 2)+")")

        d3.select('#'+this.vectors.b.id + '_label')
            .attr('x',this.scaleX(this.vectors.b.x/2))
            .attr('y',this.scaleY(this.vectors.b.y/2))
            .attr("transform", "rotate("+(-this.vectors.b.angle)+","+this.scaleX(this.vectors.b.x / 2)+","+this.scaleY(this.vectors.b.y / 2)+")")

        d3.select('#'+this.vectors.a_plus_b.id + '_label')
            .attr('x',this.scaleX(this.vectors.a_plus_b.x/2))
            .attr('y',this.scaleY(this.vectors.a_plus_b.y/2))
            .attr("transform", "rotate("+(-this.vectors.a_plus_b.angle)+","+this.scaleX(this.vectors.a_plus_b.x / 2)+","+this.scaleY(this.vectors.a_plus_b.y / 2)+")")

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

        d3.select('#'+this.vectors.b.id + '_x_component')
            .attr("x1", this.scaleX(this.vectors.b.x))
            .attr("y1", this.scaleY(this.vectors.b.y))
            .attr("x2", this.scaleX(this.vectors.b.x))
            .attr("y2", this.scaleY(0))

        d3.select('#'+this.vectors.b.id + '_y_component')
            .attr("x1", this.scaleX(this.vectors.b.x))
            .attr("y1", this.scaleY(this.vectors.b.y))
            .attr("x2", this.scaleX(0))
            .attr("y2", this.scaleY(this.vectors.b.y))

        d3.select('#'+this.vectors.a_plus_b.id + '_x_component')
            .attr("x1", this.scaleX(this.vectors.a_plus_b.x))
            .attr("y1", this.scaleY(this.vectors.a_plus_b.y))
            .attr("x2", this.scaleX(this.vectors.a_plus_b.x))
            .attr("y2", this.scaleY(0))

        d3.select('#'+this.vectors.a_plus_b.id + '_y_component')
            .attr("x1", this.scaleX(this.vectors.a_plus_b.x))
            .attr("y1", this.scaleY(this.vectors.a_plus_b.y))
            .attr("x2", this.scaleX(0))
            .attr("y2", this.scaleY(this.vectors.a_plus_b.y))

        d3.select('#a_vector_info')
            .html(this.a_vectorInfo());

        d3.select('#b_vector_info')
            .html(this.b_vectorInfo());

        d3.select('#a_plus_b_vector_info')
            .html(this.a_plus_b_vectorInfo());

        this.updateCalculationTable();
    }// end update

    updateCalculationTable(){
        let activeID = document.activeElement.id;

        if(activeID != 't_a_x'){
            d3.select('#t_a_x').property('value', this.vectors.a.x.toFixed(2));
        }

        if(activeID != 't_a_y'){
            d3.select('#t_a_y').property('value', this.vectors.a.y.toFixed(2));
        }

        if(activeID != 't_b_x'){
            d3.select('#t_b_x').property('value', this.vectors.b.x.toFixed(2));
        }
        
        if(activeID != 't_b_y'){
            d3.select('#t_b_y').property('value', this.vectors.b.y.toFixed(2));
        }

        d3.select('#t_a_plus_b_x').text(this.vectors.a_plus_b.x.toFixed(2));
        d3.select('#t_a_plus_b_y').text(this.vectors.a_plus_b.y.toFixed(2));
    } // end

    a_vectorInfo() {
        let info = "a&#773;&nbsp;&nbsp;&lang;";

        info+=this.vectors.a.x.toFixed(2);
        info+=", ";
        info+=this.vectors.a.y.toFixed(2);

        info+="&rang;";

        return info;
    }

    b_vectorInfo() {
        let info = "b&#773;&nbsp;&nbsp;&lang;";

        info+=this.vectors.b.x.toFixed(2);
        info+=", ";
        info+=this.vectors.b.y.toFixed(2);

        info+="&rang;";

        return info;
    }
    a_plus_b_vectorInfo() {
        let info = "a&#773; + b&#773;&nbsp;&nbsp;&lang;";

        info+=this.vectors.a_plus_b.x.toFixed(2);
        info+=", ";
        info+=this.vectors.a_plus_b.y.toFixed(2);

        info+="&rang;";

        return info;
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

let APP = new PAGE_APP();
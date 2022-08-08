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

        this.vectors = [

            new SVGVector2D(3.0, 3.0, {
                id: 'vector_0',
                has_control: true,
                html_label: "Q&#773;",
            }),

            new SVGVector2D(1.0, 1.0, {
                id: 'vector_1',
                color: '#FF0000',
                has_control: false,
                html_label: "Q&#770;",
            }),

        ];

        this.el = null;
        this.width = null;
        this.height = null;

        this.svg = null;
        this.mainGroup = null;
        this.scaleX = null;
        this.scaleY = null;

        this.init();

    } // end constructor

    init() {

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
        
        // set values for calculated vectors
        this.vectors[1].x = this.vectors[0].x / this.vectors[0].magnitude;
        this.vectors[1].y = this.vectors[0].y / this.vectors[0].magnitude;


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

        this.drawVectors();

        this.placeControls();

        this.updateCalculationTable();

    } // end init()

    initEvents() {
        d3.select('#t_0_x').on('input', function(e){
            if( ! APP.isNumeric(e.target.value))
                return;

            let x = parseFloat(e.target.value);

            APP.vectors[0].x = x;

            if(APP.vectors[0].magnitude != 0){
                APP.vectors[1].x = APP.vectors[0].x / APP.vectors[0].magnitude;
                APP.vectors[1].y = APP.vectors[0].y / APP.vectors[0].magnitude;
            } else{
                APP.vectors[1].x = 0;
                APP.vectors[1].y = 0;
            }


            APP.update();
        });

        d3.select('#t_0_y').on('input', function(e){
            if( ! APP.isNumeric(e.target.value))
                return;

            let y = parseFloat(e.target.value);

            APP.vectors[0].y = y;

            if(APP.vectors[0].magnitude != 0){
                APP.vectors[1].x = APP.vectors[0].x / APP.vectors[0].magnitude;
                APP.vectors[1].y = APP.vectors[0].y / APP.vectors[0].magnitude;
            } else{
                APP.vectors[1].x = 0;
                APP.vectors[1].y = 0;
            }
        
            APP.update();
        });
    } // end initEvents()

    update() {

        for(let vector_index=0; vector_index < this.vectors.length; vector_index++){

            if( true === this.vectors[vector_index].getOption('has_control')){
                d3.select('#control_'+vector_index)
                    .attr("cx", this.scaleX(this.vectors[vector_index].x))
                    .attr("cy", this.scaleY(this.vectors[vector_index].y));
            }

            d3.select('#'+this.vectors[vector_index].id)
                .attr("x2", this.scaleX(this.vectors[vector_index].x))
                .attr("y2", this.scaleY(this.vectors[vector_index].y));

            d3.select('#'+this.vectors[vector_index].id + '_label')
                .attr('x',this.scaleX(this.vectors[vector_index].x/2))
                .attr('y',this.scaleY(this.vectors[vector_index].y/2))
                .attr("transform", "rotate("+(-this.vectors[vector_index].angle)+","+this.scaleX(this.vectors[vector_index].x / 2)+","+this.scaleY(this.vectors[vector_index].y / 2)+")")

            d3.select('#'+this.vectors[vector_index].id + '_x_component')
                .attr("x1", this.scaleX(this.vectors[vector_index].x))
                .attr("y1", this.scaleY(this.vectors[vector_index].y))
                .attr("x2", this.scaleX(this.vectors[vector_index].x))
                .attr("y2", this.scaleY(0))

            d3.select('#'+this.vectors[vector_index].id + '_y_component')
                .attr("x1", this.scaleX(this.vectors[vector_index].x))
                .attr("y1", this.scaleY(this.vectors[vector_index].y))
                .attr("x2", this.scaleX(0))
                .attr("y2", this.scaleY(this.vectors[vector_index].y))

            d3.select('#vector_info_'+vector_index)
                .html(this.vectorInfo(vector_index));
        }

        this.updateCalculationTable();

    } // end update()



    updateCalculationTable(){

        let activeID = document.activeElement.id;

        if(activeID != 't_0_x'){
            d3.select('#t_0_x').property('value', this.vectors[0].x.toFixed(2));
        }

        if(activeID != 't_0_y'){
            d3.select('#t_0_y').property('value', this.vectors[0].y.toFixed(2));
        }

        d3.select('#t_length_0').text(this.vectors[0].magnitude.toFixed(2));

        d3.select('#t_1_x').text(this.vectors[1].x.toFixed(2));
        d3.select('#t_1_y').text(this.vectors[1].y.toFixed(2));

    } // end updateCalculationTable()



    drawVectors(){

        this.drawVector(this.vectors[0]);
        this.drawVector(this.vectors[1]);

    } // end drawVectors()

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

        for(let vector_index=0; vector_index < this.vectors.length; vector_index++){
            this.mainGroup.append('text')
                .attr('id', 'vector_info_'+vector_index)
                .html(this.vectorInfo(vector_index))
                .style('text-anchor', 'start')
                .style('alignment-baseline', 'bottom')
                .attr('fill',"#333")
                .attr('opacity', 0.7)
                .attr('x',this.options.margins.left)
                .attr('y',18 + 26 * vector_index)
                .attr('dx',0)
                .attr('dy',0)
                .attr('font-size','16px');
        }

    } // end drawInfoBlock()



    placeControls() {

        for(let vector_index=0; vector_index < this.vectors.length; vector_index++){
            if( true === this.vectors[vector_index].getOption('has_control')){
                // Draggable circles
                this.mainGroup.append('circle')
                    .attr('id', 'control_'+vector_index)
                    .classed("draggable", true)
                    .attr("cx", this.scaleX(this.vectors[vector_index].x))
                    .attr("cy", this.scaleY(this.vectors[vector_index].y))
                    .attr("r", this.options.circlesRadius)
                    .call(
                        d3.drag()
                            .on("start", this.dragstarted)
                            .on('drag', function(e) { APP.dragging(e, vector_index); } )
                            .on("end", this.dragended)
                    );
            }
        }

    } // end placeControls()

    vectorInfo(index) {

        let info;

        switch(index){
            case 0:
                info = "Q&#773;&nbsp;&nbsp;&lang;";

                info+=this.vectors[index].x.toFixed(2);
                info+=", ";
                info+=this.vectors[index].y.toFixed(2);
        
                info+="&rang;";
        
                return info;
            break;

            case 1:
                info = "Q&#770;&nbsp;&nbsp;&lang;";

                info+=this.vectors[index].x.toFixed(2);
                info+=", ";
                info+=this.vectors[index].y.toFixed(2);
        
                info+="&rang;";
        
                return info;
            break;
        }
    } // end vectorInfo()

    dragging(event, index){

        let x = event.x,
            y = event.y;

        if ((x < 0) || x > APP.calculations.mainGroupWidth  || (y < 0) || y > APP.calculations.mainGroupHeight)
            return;

        switch(index){
            case 0:
                APP.vectors[index].x = APP.scaleX.invert(x);
                APP.vectors[index].y = APP.scaleY.invert(y);

                APP.vectors[1].x = APP.vectors[index].x / APP.vectors[index].magnitude;
                APP.vectors[1].y = APP.vectors[index].y / APP.vectors[index].magnitude;

                if(APP.vectors[index].magnitude != 0){
                    APP.vectors[1].x = APP.vectors[index].x / APP.vectors[index].magnitude;
                    APP.vectors[1].y = APP.vectors[index].y / APP.vectors[index].magnitude;
                } else{
                    APP.vectors[1].x = 0;
                    APP.vectors[1].y = 0;
                }
            break;
        }


        APP.update();

    } // end dragging()

    dragstarted(e){
        let circle = d3.select(this).classed("dragging", true);
    }

    dragended(e){
        let circle = d3.select(this).classed("dragging", false);
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

} //end class

 let APP = new PAGE_APP();
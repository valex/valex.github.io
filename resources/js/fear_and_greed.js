const percToDeg = perc => perc * 360;
const degToRad = deg => (deg * Math.PI) / 180;
const percToRad = perc => degToRad(percToDeg(perc));

class Needle {
    /**
     * Initializes a new instance of the Needle class.
     *
     * @param config                      The configuration to use to initialize the needle.
     * @param config.animationDelay       The delay in ms before to start the needle animation.
     * @param config.animationDuration    The duration in ms of the needle animation.
     * @param config.color                The color to use for the needle.
     * @param config.easeType             The ease type to use for the needle animation.
     * @param config.el                   The parent element of the needle.
     * @param config.length               The length of the needle.
     * @param config.percent              The initial percentage to use.
     * @param config.radius               The radius of the needle.
     */
    constructor(config) {
        const defaults = {
            animationDelay: 0,
            animationDuration: 500,
            color: '#191919',
            easeType: d3.easeQuadOut,
            el: null,
            length: null,
            percent: 0,
            radius: 15,
        };

        this.options = Object.assign({}, defaults, config);

        this._initialize();
    }

    /**
     * Updates the needle position based on the percentage specified.
     *
     * @param percent      The percentage to use.
     */
    update(percent) {
        const self = this;
        this.options.el.transition()
            .delay(this.options.animationDelay)
            .ease(this.options.easeType)
            .duration(this.options.animationDuration)
            .selectAll('.needle')
            .tween('progress', function () {
                const thisElement = this;
                const delta = percent - self.options.percent;
                const initialPercent = self.options.percent;
                return function (progressPercent) {
                    self.options.percent = initialPercent + progressPercent * delta;

                    // Update needle position
                    d3.select(thisElement)
                        .attr('d', self._getPath(self.options.percent));

                    // Update the number inside the center circle
                    self.options.el.select('.gauge-center-text')
                        .text(d3.format(".0f")(100*self.options.percent));
                }
            });
    }

    /**
     * Initializes the needle.
     *
     * @private
     */
    _initialize() {
        this.options.el.append('circle')
            .attr('class', 'needle-center')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', this.options.radius);

            this.options.el.append('path')
            .attr('class', 'needle')
            .attr('d', this._getPath(this.options.percent));

        if (this.options.color) {
            this.options.el.select('.needle-center')
                .style('fill', this.options.color);

            this.options.el.select('.needle')
                .style('fill', this.options.color);
        }
    }

    /**
     * Gets the needle path based on the percent specified.
     *
     * @param percent       The percentage to use to create the path.
     * @returns {string}    A string associated with the path.
     * @private
     */
    _getPath(percent) {
        const halfPI = Math.PI / 2;
        const thetaRad = percToRad(percent / 2); // half circle

        const centerX = 0;
        const centerY = 0;

        const topX = centerX - (this.options.length * Math.cos(thetaRad));
        const topY = centerY - (this.options.length * Math.sin(thetaRad));

        const leftX = centerX - (this.options.radius * Math.cos(thetaRad - halfPI));
        const leftY = centerY - (this.options.radius * Math.sin(thetaRad - halfPI));

        const rightX = centerX - (this.options.radius * Math.cos(thetaRad + halfPI));
        const rightY = centerY - (this.options.radius * Math.sin(thetaRad + halfPI));

        return `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`;
    }

}

class Gauge{
    constructor(config) {

        const defaults = {
            container_id: null, 

            sectionsCount: 5,
            padRad: 0.05,
            percent: 0,

            arcColors:['#f0f0f0'],
            arcLabels:['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'],

            aspectRatio: 16/9,
            margins: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
            },
            breakpoints: {
                extraSmall: 576
            }
        };

        this.options = Object.assign({}, defaults, config);

        this.calculations = {
            windowWidth: null,
            svgWidth: null,
            svgHeight: null,
            mainGroupWidth: null,
            mainGroupHeight: null,

            radius: null,
            barWidth: null
        }

        this._el = null;
        this._svg = null;
        this._mainGroup = null;
        this._chart = null;
        this._arcs = null;
        this._needle = null;

        this._validateOptions();

        this._initialize();
    }

    /**
     * Gets the needle percent.
     *
     * @returns {number|*}    The percentage position of the needle.
     */
    get percent() {
        return this.options.percent;
    }

    /**
     * Sets the needle percent. The percent must be between 0 and 1.
     *
     * @param percent         The percentage to set.
     */
    set percent(percent) {
        if (isNaN(percent) || percent < 0 || percent > 1) {
            throw new RangeError('The percentage must be between 0 and 1.');
        }

        if (this._needle) {
            this._needle.update(percent);
        }

        this.options.percent = percent;
        this._update();
    }

    _validateOptions() {
        if ( ! this.options.container_id) {
            throw new Error('The "container_id" property is required.');
        }

        this._el = document.getElementById(this.options.container_id);
        if ( ! this._el) {
            throw new Error(`No element found with the ID "${this.options.container_id}". Please provide a valid DOM element ID.`);
        }
    }

    _initialize() {

        this.calculations.windowWidth = window.innerWidth;

        if(this.calculations.windowWidth < this.options.breakpoints.extraSmall){
            this.options.aspectRatio = 4/3;
        }

        this.calculations.svgWidth = Math.floor( this._el.clientWidth - 1 );
        this.calculations.svgHeight = Math.floor( this.calculations.svgWidth / this.options.aspectRatio );

        this.calculations.mainGroupWidth = this.calculations.svgWidth - this.options.margins.left - this.options.margins.right;
        this.calculations.mainGroupHeight = this.calculations.svgHeight - this.options.margins.top - this.options.margins.bottom;
        
        this._svg = d3.select(this._el)
            .append("svg")
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr("width", this.calculations.svgWidth)
            .attr("height", this.calculations.svgHeight)
            .on('click', function() {
                console.log('onClickSvg');
            });

        this._mainGroup = this._svg.append('g')
            .attr('transform', 'translate(' + this.options.margins.left + ',' + this.options.margins.top + ')');

        this._chart = this._mainGroup.append('g')
            .attr('transform', `translate(${this.calculations.mainGroupWidth / 2}, ${this.calculations.mainGroupHeight})`);


        const sectionPercentage = 1 / this.options.sectionsCount / 2;
        const padRad = this.options.padRad;
        
        let totalPercent = 0.75; // Start at 270deg
        this.calculations.radius = Math.min(this.calculations.mainGroupWidth, this.calculations.mainGroupHeight * 2) / 2;
        this.calculations.barWidth = 0.4 * this.calculations.radius;
        
        
        const radius = this.calculations.radius;
        this._arcs = this._chart.selectAll('.arc')
            .data(d3.range(1, this.options.sectionsCount + 1))
            .enter()
            .append('path')
            .attr('class', sectionIndex => `arc`)
            .attr('d', (d, sectionIndex) => {
                const arcStartRad = percToRad(totalPercent);
                const arcEndRad = arcStartRad + percToRad(sectionPercentage);
                totalPercent += sectionPercentage;

                const startPadRad = sectionIndex === 0 ? 0 : padRad / 2;
                const endPadRad = sectionIndex === (this.options.sectionsCount-1) ? 0 : padRad / 2;
                const arc = d3.arc()
                    .outerRadius(radius)
                    .innerRadius(radius - this.calculations.barWidth)
                    .startAngle(arcStartRad + startPadRad)
                    .endAngle(arcEndRad - endPadRad);

                return arc(this);
            })
            .attr('fill', (sectionIndex) => this.options.arcColors[sectionIndex % this.options.arcColors.length]);;

        this._addPercentLabels();
        this._addArcLabels();

        this._needle = new Needle({
            el: this._chart,
            length: this.calculations.radius - this.calculations.barWidth + this.calculations.barWidth *0.15,
            percent: this.options.percent,
            radius: 0.05 * this.calculations.radius
        });

        // Add a circle to the center of the gauge
        this._chart.append('circle')
            .attr('class', 'gauge-center-circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', this.calculations.radius * 0.15);

        const fontSize = 0.005 * radius;
        // Add text inside the center circle
        this._chart.append('text')
            .attr('class', 'gauge-center-text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '0.1em') // Vertical alignment
            .attr('text-anchor', 'middle') // Horizontal alignment
            .style('font-size', `${fontSize}em`)
            .text(d3.format(".0f")(100*this.options.percent)); // Display percentage as text

        this._update();

        this.fetchDataAndUpdate();
    }

    async fetchDataAndUpdate() {
        try {
            const response = await fetch('https://effxtu.3utilities.com/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const colorScale = d3.scaleLinear()
                .domain([0, 50, 100]) 
                .range(['#8B0000', '#FFD700', '#006400']); 
        

            d3.select('#fgi_today')
                .style('background-color', colorScale(data.today))
                .text(data.today.toFixed(0));
            d3.select('#fgi_yesterday')
                .style('background-color', colorScale(data.yesterday))
                .text(data.yesterday.toFixed(0));
            d3.select('#fgi_last_week')
                .style('background-color', colorScale(data.last_week))
                .text(data.last_week.toFixed(0));

            this.percent = data.today/100;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Функция для добавления текстовых меток вдоль арки
    _addArcLabels() {
        const radius = this.calculations.radius;
        let totalPercent = 0.75; // Start at 270deg
        const sectionPercentage = 1 / this.options.sectionsCount / 2;

        this._chart.selectAll('.arc-label-path')
            .data(this.options.arcLabels)
            .enter()
            .append('g')
            .attr('class', 'arc-label-group')
            .each( (d, i, nodes) => {
                const arcStartRad = percToRad(totalPercent);
                const arcEndRad = arcStartRad + percToRad(sectionPercentage);
                const arcMidRad = (arcStartRad + arcEndRad) / 2; 

                totalPercent += sectionPercentage; 

                const startPadRad = i === 0 ? 0 : this.options.padRad / 2;
                const endPadRad = i === (this.options.sectionsCount-1) ? 0 : this.options.padRad / 2;

                // Split the label into words
                const words = d.split(" ");

                // Create a path for each word, adjusting the radius for each word to simulate "stacking"
                words.forEach((word, wordIndex) => {
                    const wordRadius = radius - (0.09 * radius) - (wordIndex * (0.09 * radius)); // Adjust radial position for each word

                    const wordArcPath = d3.arc()
                        .outerRadius(wordRadius) // Use a slightly smaller radius for the next word
                        .innerRadius(wordRadius)
                        .startAngle(arcStartRad + startPadRad)
                        .endAngle(arcEndRad - endPadRad);

                    // Append a path for the word
                    d3.select(nodes[i])
                        .append('path')
                        .attr('id', `arc-label-path-${i}-${wordIndex}`) // Unique ID for each word
                        .attr('d', wordArcPath)
                        .attr('fill', 'none')
                        .attr('stroke', 'none'); // Invisible path for text to follow

                    const fontSize = 0.0035 * radius
                    // Append a text element with the word
                    d3.select(nodes[i])
                        .append('text')
                        .attr('class', 'arc-label')
                        .append('textPath')
                        .attr('xlink:href', `#arc-label-path-${i}-${wordIndex}`)
                        .attr('startOffset', '25%') 
                        .style('text-anchor', 'middle')
                        .style('font-size', `${fontSize}em`)
                        .text(word);  

                });
            });
    }

    _addPercentLabels() {
        const radius = this.calculations.radius;

        const labelRadius = 0.9 * (radius - this.calculations.barWidth); 
        const numLabels = 21; 
        const step = 100 / (numLabels - 1); 

        const labels = d3.range(0, 101, step); 

        const majorLabels = [0, 25, 50, 75, 100]; 

        this._chart.selectAll('.label')
            .data(labels)
            .enter()
            .each((d, i, nodes) => {
                const angle = i * (Math.PI / (numLabels - 1)) - Math.PI / 1;
                const x = labelRadius * Math.cos(angle);
                const y = labelRadius * Math.sin(angle);

                if (majorLabels.includes(d)) {
                    const fontSize = 0.003 * radius;
                    d3.select(nodes[i])
                        .append('text')
                        .attr('class', 'percent-label')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .style('font-size', `${fontSize}em`)
                        .text(d);
                } else {
                    d3.select(nodes[i])
                        .append('circle')
                        .attr('class', 'percent-dot')
                        .attr('cx', x)
                        .attr('cy', y)
                        .attr('r', 0.006 * radius);
                }
            });
    }

    _update() {
        if ( ! this._arcs) {
            return;
        }

        this._arcs.classed('active', (d, i) => i === Math.floor(this.options.percent * this.options.sectionsCount) ||
            i === this._arcs.size() - 1 && this.options.percent === 1
        );
    }
}

const gauge = new Gauge({
    container_id: 'svg_chart',
    percent: 0
});


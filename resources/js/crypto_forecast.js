class CryptoForecastApp{
    constructor(config) {
        const defaults = {
            container_id: null, 

            aspectRatio: 16/9,
            margins: {
                top: 10,
                right: 10,
                bottom: 30,
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
        }

        this._el = null;
        this._svg = null;
        this._mainGroup = null;
        this.scaleX = null;
        this.scaleY = null;
        this.line = null;
        this._colors = d3.schemePastel2; 
        this._currentSymbol = 'BTCUSDT';

        this._symbolSettings = {
            'BTCUSDT': { leftMargin: 60 },
            'ETHUSDT': { leftMargin: 50 },
            'LTCUSDT': { leftMargin: 40 },
        };

        this.options.margins.left = this._symbolSettings['BTCUSDT'].leftMargin;

        this._data = {
            t0: null,
            s0: null,
            paths: null,
            mean_path: null,
            prediction_interval_95: {
                lower: null,
                upper: null
            },
            build_at_utc: null,

            x_extent: [0,1],
            y_extent: [0,1]
        }

        this._validateOptions()

        this._initialize();

        this._showLoading(true);
        this.fetchAndBuildData()


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

        this._mainGroup.append('rect')
            .attr('class', 'chart-hover-area')
            .attr('width', this.calculations.mainGroupWidth)
            .attr('height', this.calculations.mainGroupHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mousemove', (event) => this._showTooltip(event))
            .on('mouseout', () => this._hideTooltip());

        this._tooltip = d3.select(this._el).append('div')
            .attr('class', 'forecast-tooltip')
            .style('opacity', 0);

        // Symbol switcher event delegation
        const symbolSelector = document.getElementById('symbol-selector');
        if (symbolSelector) {
            symbolSelector.addEventListener('click', (e) => {
                const item = e.target.closest('.list-group-item');
                if (item && item.dataset.symbol) {
                    e.preventDefault();
                    this.switchSymbol(item.dataset.symbol);
                }
            });
        }
    }

    _recalculateDimensions() {
        this.calculations.mainGroupWidth = this.calculations.svgWidth - this.options.margins.left - this.options.margins.right;

        // Update mainGroup transform
        this._mainGroup.attr('transform', `translate(${this.options.margins.left},${this.options.margins.top})`);

        // Update hover rect size
        this._mainGroup.select('.chart-hover-area')
            .attr('width', this.calculations.mainGroupWidth);
    }

    async fetchAndBuildData(symbol = this._currentSymbol) {
      
        let data;
        try {
            const response = await fetch(`https://stochastic.fastapicloud.dev/forecast?symbol=${symbol}&interval=1d`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();

        } catch (error) {
            console.error('Error network fetching data:', error);
            return;
        }

        if (!data) {
            console.error('No data received from API');
            return;
        }

        // Convert paths object to array of arrays: [[{date, value}, ...], ...]
        const pathsArray = Object.values(data.paths).map(pathObj => 
            Object.entries(pathObj).map(([dateStr, value]) => ({
                date: new Date(dateStr + "Z"),
                value: value
            }))
        );

        this._data.mean_path = Object.entries(data.mean_path[0]).map(([dateStr, value]) => ({
            date: new Date(dateStr + "Z"),
            value: value
        }));

        this._data.prediction_interval_95.lower = Object.entries(data.prediction_interval_95[0][0]).map(([dateStr, value]) => ({
            date: new Date(dateStr + "Z"),
            value: value
        }));

        this._data.prediction_interval_95.upper = Object.entries(data.prediction_interval_95[1][0]).map(([dateStr, value]) => ({
            date: new Date(dateStr + "Z"),
            value: value
        }));

        this._data.t0 = new Date(data.t0 + "Z");
        this._data.s0 = data.s0;
        this._data.paths = pathsArray;
        this._data.build_at_utc = new Date(data.build_at_utc);

        // console.log(this._data)

        // Find global min/max for Y scale
        const allValues = this._data.paths.flatMap(p => p.map(d => d.value));
        this._data.y_extent = d3.extent(allValues)

        // Date extent for X scale
        const allDates = this._data.paths.flatMap(p => p.map(d => d.date));
        this._data.x_extent = d3.extent(allDates)

        this._recalculateDimensions();

        this.scaleX = d3.scaleTime()
            .domain(this._data.x_extent)
            .range([0, this.calculations.mainGroupWidth]);

        this.scaleY = d3.scaleLinear()
            .domain([this._data.y_extent[0] * 0.9, this._data.y_extent[1] * 1.01])  // slight padding
            .range([this.calculations.mainGroupHeight, 0]);

        // Line Generator
        this.line = d3.line()
            .x(d => this.scaleX(d.date))
            .y(d => this.scaleY(d.value))
            .curve(d3.curveLinear);


        this._draw()
        this._showLoading(false);
    }// end fetchAndBuildData()

    async switchSymbol(symbol) {
        if (symbol === this._currentSymbol) return;
        
        this._currentSymbol = symbol;
        
        // Apply symbol-specific settings
        const settings = this._symbolSettings[symbol];
        if (settings) {
            this.options.margins.left = settings.leftMargin;
        }
        
        // Update active UI
        document.querySelectorAll('#symbol-selector .list-group-item').forEach(el => {
            el.classList.toggle('active', el.dataset.symbol === symbol);
        });
        
        this._showLoading(true);
        
        try {
            await this.fetchAndBuildData(symbol);
        } catch (error) {
            console.error('Symbol switch failed:', error);
        } finally {
            this._showLoading(false);
        }
    }

    _showLoading(isLoading) {
        this._el.classList.toggle('loading', isLoading);
    }

    _draw() {
        // Clear all content except hover rect
        this._mainGroup.selectAll(':not(.chart-hover-area)').remove();
        
        this._drawAxes();
        this._drawPaths();
        this._drawPredictionBand();
        this._drawLowerBound();
        this._drawUpperBound();
        this._drawMeanPath();
    }

    _drawAxes() {
        // X axis - time
        const axisX = d3.axisBottom(this.scaleX)
            .ticks(d3.timeDay.every(2))
            .tickFormat(d => d.getDate() + ' ' + d3.timeFormat('%b')(d));
        this._mainGroup.append('g')
            .attr('class', 'axis axis-x')
            .attr('transform', `translate(0,${this.calculations.mainGroupHeight})`)
            .call(axisX);
        // Y axis - price
        const axisY = d3.axisLeft(this.scaleY)
            .ticks(6)
            .tickFormat(d => d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
        this._mainGroup.append('g')
            .attr('class', 'axis axis-y')
            .call(axisY);
    }

    _drawPaths() {
        const pathsGroup = this._mainGroup.append('g').attr('class', 'forecast-paths');
        
        this._data.paths.forEach((pathData, i) => {
            pathsGroup.append('path')
                .datum(pathData)
                .attr('class', `forecast-path path-${i}`)
                .attr('d', this.line)
                .attr('fill', 'none')
                .attr('stroke', this._colors[i % this._colors.length])
                .attr('stroke-width', 1.5)
                .attr('stroke-opacity', 0.7)
                .attr('stroke-linecap', 'round')
                .attr('stroke-linejoin', 'round');
        });
    }

    _drawMeanPath() {
        this._mainGroup.append('path')
            .datum(this._data.mean_path)
            .attr('class', 'mean-path')
            .attr('d', this.line)
            .attr('fill', 'none')
            .attr('stroke', '#8B0000')
            .attr('stroke-width', 2.5)
            .attr('stroke-opacity', 0.95)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round');
    }

    _drawLowerBound() {
        this._mainGroup.append('path')
            .datum(this._data.prediction_interval_95.lower)
            .attr('class', 'prediction-lower')
            .attr('d', this.line)
            .attr('fill', 'none')
            .attr('stroke', '#8B0000')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.6)
            .attr('stroke-dasharray', '6,4')
            .attr('stroke-linecap', 'round');
    }

    _drawUpperBound() {
        this._mainGroup.append('path')
            .datum(this._data.prediction_interval_95.upper)
            .attr('class', 'prediction-upper')
            .attr('d', this.line)
            .attr('fill', 'none')
            .attr('stroke', '#8B0000')
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.6)
            .attr('stroke-dasharray', '6,4')
            .attr('stroke-linecap', 'round');
    }

    _drawPredictionBand() {
        const area = d3.area()
            .x(d => this.scaleX(d.date))
            .y0(d => this.scaleY(d.upper))  // need combined data
            .y1(d => this.scaleY(d.lower))
            .curve(d3.curveLinear);
        
        // Combine lower/upper for area generator
        const bandData = this._data.prediction_interval_95.lower.map((d, i) => ({
            date: d.date,
            lower: d.value,
            upper: this._data.prediction_interval_95.upper[i].value
        }));
        
        this._mainGroup.append('path')
            .datum(bandData)
            .attr('class', 'prediction-band')
            .attr('d', area)
            .attr('fill', '#8B0000')
            .attr('fill-opacity', 0.04)
            .attr('stroke', 'none');
    }

    _showTooltip(event) {
        const [x] = d3.pointer(event, this._mainGroup.node());
        const date = this.scaleX.invert(x);
        
        const bisect = d3.bisector(d => d.date).center;
        const idx = Math.min(
            bisect(this._data.mean_path, date),
            this._data.mean_path.length - 1
        );
        
        const mean = this._data.mean_path[idx];
        const lower = this._data.prediction_interval_95.lower[idx];
        const upper = this._data.prediction_interval_95.upper[idx];
        
        const dateStr = `${mean.date.getDate()} ${d3.timeFormat('%b')(mean.date)}`;
        
        this._tooltip
            .style('opacity', 1)
            .html(`
                <div><span class="label">${dateStr}</span></div>
                <div class="upper"><span class="label">Upper:</span> <span class="value">${upper.value.toFixed(6)}</span></div>
                <div class="mean"><span class="label">Mean:</span> <span class="value">${mean.value.toFixed(6)}</span></div>
                <div class="lower"><span class="label">Lower:</span> <span class="value">${lower.value.toFixed(6)}</span></div>
            `)
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }

    _hideTooltip() {
        this._tooltip.style('opacity', 0);
    }
}

const APP = new CryptoForecastApp({
    container_id: 'svg_chart'
});
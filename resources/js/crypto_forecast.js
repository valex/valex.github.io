class CryptoForecastApp{
    constructor(config) {
        const defaults = {
            container_id: null, 

            aspectRatio: 16/9,
            margins: {
                top: 10,
                right: 10,
                bottom: 40,
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
        this._tooltip = null;
        this._guideLine = null;
        this.scaleX = null;
        this.scaleY = null;
        this.line = null;
        this._colors = d3.schemePastel2; 
        this._currentSymbol = 'BTCUSDT';
        this._fullscreenButton = null;
        this._isFullscreen = false;

        this._fullscreenSVGs = {
            enter: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g stroke-width="0"></g><g stroke-linecap="round" stroke-linejoin="round"></g><g><g><path d="M192,64H32C14.328,64,0,78.328,0,96v96c0,17.672,14.328,32,32,32s32-14.328,32-32v-64h128c17.672,0,32-14.328,32-32 S209.672,64,192,64z"></path><path d="M480,64H320c-17.672,0-32,14.328-32,32s14.328,32,32,32h128v64c0,17.672,14.328,32,32,32s32-14.328,32-32V96 C512,78.328,497.672,64,480,64z"></path><path d="M480,288c-17.672,0-32,14.328-32,32v64H320c-17.672,0-32,14.328-32,32s14.328,32,32,32h160c17.672,0,32-14.328,32-32v-96 C512,302.328,497.672,288,480,288z"></path><path d="M192,384H64v-64c0-17.672-14.328-32-32-32S0,302.328,0,320v96c0,17.672,14.328,32,32,32h160c17.672,0,32-14.328,32-32 S209.672,384,192,384z"></path></g></g></svg>`,
            exit: `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g stroke-width="0"></g><g stroke-linecap="round" stroke-linejoin="round"></g><g><g><path d="M192,64c-17.672,0-32,14.328-32,32v64H32c-17.672,0-32,14.328-32,32s14.328,32,32,32h160c17.672,0,32-14.328,32-32V96 C224,78.328,209.672,64,192,64z"></path> <path d="M320,224h160c17.672,0,32-14.328,32-32s-14.328-32-32-32H352V96c0-17.672-14.328-32-32-32s-32,14.328-32,32v96 C288,209.672,302.328,224,320,224z"></path> <path d="M480,288H320c-17.672,0-32,14.328-32,32v96c0,17.672,14.328,32,32,32s32-14.328,32-32v-64h128c17.672,0,32-14.328,32-32 S497.672,288,480,288z"></path> <path d="M192,288H32c-17.672,0-32,14.328-32,32s14.328,32,32,32h128v64c0,17.672,14.328,32,32,32s32-14.328,32-32v-96 C224,302.328,209.672,288,192,288z"></path></g></g></svg>`
        };

        this._symbolSettings = {
            'BTCUSDT': { 
                title: 'BTC (Bitcoin)',
                leftMargin: 50,
                toFixed: 0
            },
            'ETHUSDT': { 
                title: 'ETH (Ethereum)',
                leftMargin: 40,
                toFixed: 0
            },
            'LTCUSDT': { 
                title: 'LTC (Litecoin)',
                leftMargin: 30,
                toFixed: 2
            },
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
            .on('pointerdown', (event) => {
                this._hideTooltip();
            });

        // Add white background rect to prevent black background in fullscreen
        this._svg.insert('rect', ':first-child')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#ffffff');

        this._mainGroup = this._svg.append('g')
            .attr('transform', 'translate(' + this.options.margins.left + ',' + this.options.margins.top + ')');

        // SVG Tooltip (native SVG, included in PNG download)
        this._tooltip = this._mainGroup.append('g')
            .attr('class', 'svg-tooltip persistent')
            .attr('visibility', 'hidden')
            .attr('pointer-events', 'none');

        // Background rect - will be sized dynamically
        this._tooltip.append('rect')
            .attr('class', 'tooltip-bg')
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', 'rgba(0,0,0,0.9)')
            .attr('stroke', '#8B0000')
            .attr('stroke-width', 1);

        // Title (date)
        this._tooltip.append('text')
            .attr('class', 'tooltip-title')
            .attr('x', 8).attr('y', 16)
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-family', 'monospace');

        // Upper
        this._tooltip.append('text')
            .attr('class', 'tooltip-upper')
            .attr('x', 8).attr('y', 32)
            .attr('fill', '#ffaaaa')
            .attr('font-size', '11px')
            .attr('font-family', 'monospace');

        // Mean
        this._tooltip.append('text')
            .attr('class', 'tooltip-mean')
            .attr('x', 8).attr('y', 48)
            .attr('fill', '#ff6b6b')
            .attr('font-size', '11px')
            .attr('font-family', 'monospace');

        // Lower
        this._tooltip.append('text')
            .attr('class', 'tooltip-lower')
            .attr('x', 8).attr('y', 64)
            .attr('fill', '#ffaaaa')
            .attr('font-size', '11px')
            .attr('font-family', 'monospace');

        // Show buttons now that SVG is initialized
        const fsBtn = document.getElementById('fullscreen-button');
        const dlBtn = document.getElementById('download-button');
        if (fsBtn) fsBtn.hidden = false;
        if (dlBtn) dlBtn.hidden = false;

        this._mainGroup.append('rect')
            .attr('class', 'chart-hover-area persistent')
            .attr('width', this.calculations.mainGroupWidth)
            .attr('height', this.calculations.mainGroupHeight)
            .attr('fill', 'transparent')
            .attr('pointer-events', 'all')
            .on('pointerdown', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this._showTooltip(event);
            })
            .on('pointermove', (event) => {                
                event.preventDefault();
                event.stopPropagation();
                this._showTooltip(event);
            })
            .on('mouseleave', () => this._hideTooltip());

        // Fullscreen button
        this._fullscreenButton = document.getElementById('fullscreen-button');
        if (this._fullscreenButton) {
            this._fullscreenButton.innerHTML = this._fullscreenSVGs.enter;
            this._fullscreenButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this._hideTooltip();
                this.toggleFullscreen();
            });
        }

        // Download button
        const downloadButton = document.getElementById('download-button');
        if (downloadButton) {
            downloadButton.addEventListener('click', (e) => {
                e.stopPropagation();

                const dateStr = new Date().toISOString().split('T')[0];
                const fileName = `forecast_${this._currentSymbol}_${dateStr}.png`;
                
                saveSvgAsPng(this._svg.node(), fileName, {
                    backgroundColor: 'white',
                    encoderOptions: 1.0,
                    scale: 1
                });

            });
        }

        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());

        // Handle window resize (and orientation change)
        window.addEventListener('resize', () => {
            this._recalculateDimensions();
            if (this.scaleX && this.scaleY) {
                this.scaleX.range([0, this.calculations.mainGroupWidth]);
                this.scaleY.range([this.calculations.mainGroupHeight, 0]);
                this._draw();
            }
        });

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
        this.calculations.svgWidth = Math.floor(this._el.clientWidth - 1);
        
        if (this._isFullscreen) {
            this.calculations.svgHeight = Math.floor(this._el.clientHeight);
        } else {
            this.calculations.svgHeight = Math.floor(this.calculations.svgWidth / this.options.aspectRatio);
        }

        this.calculations.mainGroupWidth = this.calculations.svgWidth - this.options.margins.left - this.options.margins.right;
        this.calculations.mainGroupHeight = this.calculations.svgHeight - this.options.margins.top - this.options.margins.bottom;

        // Update SVG size
        this._svg.attr('width', this.calculations.svgWidth).attr('height', this.calculations.svgHeight);

        // Update mainGroup transform
        this._mainGroup.attr('transform', `translate(${this.options.margins.left},${this.options.margins.top})`);

        // Update hover rect size
        this._mainGroup.select('.chart-hover-area')
            .attr('width', this.calculations.mainGroupWidth)
            .attr('height', this.calculations.mainGroupHeight);

        // Update guide line height
        if (this._guideLine) {
            this._guideLine.attr('y2', this.calculations.mainGroupHeight);
        }
    }

    async fetchAndBuildData(symbol = this._currentSymbol) {
      
        const limit = 200;
        const now = new Date();
        now.setUTCDate(now.getUTCDate() - limit);
        const ymd = now.toISOString().split('T')[0]

        let data;
        try {
            const response = await fetch(`https://stochastic.fastapicloud.dev/forecast?symbol=${symbol}&interval=1d&from=${ymd}`);
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

        this.scaleX = d3.scaleUtc()
            .domain(this._data.x_extent)
            .range([0, this.calculations.mainGroupWidth]);

        this.scaleY = d3.scaleLinear()
            .domain([this._data.y_extent[0] * 0.9, this._data.y_extent[1] * 1.05])  // slight padding
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

    isFullscreen() {
        return !!document.fullscreenElement ||
               !!document.webkitFullscreenElement ||
               !!document.mozFullScreenElement ||
               !!document.msFullscreenElement;
    }

    toggleFullscreen() {
        if (!this.isFullscreen()) {
            if (this._el.requestFullscreen) {
                this._el.requestFullscreen();
            } else if (this._el.webkitRequestFullscreen) {
                this._el.webkitRequestFullscreen();
            } else if (this._el.mozRequestFullScreen) {
                this._el.mozRequestFullScreen();
            } else if (this._el.msRequestFullscreen) {
                this._el.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    handleFullscreenChange() {
        this._isFullscreen = this.isFullscreen();
        if (this._fullscreenButton) {
            this._fullscreenButton.innerHTML = this._isFullscreen 
                ? this._fullscreenSVGs.exit 
                : this._fullscreenSVGs.enter;
            this._fullscreenButton.title = this._isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
            this._fullscreenButton.setAttribute('aria-label', this._isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
        }
        this._recalculateDimensions();

        // Update scales for new dimensions
        if (this.scaleX && this.scaleY) {
            this.scaleX.range([0, this.calculations.mainGroupWidth]);
            this.scaleY.range([this.calculations.mainGroupHeight, 0]);
            this._draw();
        }
    }

    _draw() {
        this._mainGroup.selectAll('*')
            .filter(function() {
                return !this.closest('.chart-hover-area, .svg-tooltip');
            })
            .remove();

        this._drawAxes();
        this._drawTitle();
        this._drawLabels();
        this._drawPaths();
        this._drawPredictionBand();
        this._drawLowerBound();
        this._drawUpperBound();
        this._drawMeanPath();
        this._drawGuideLine();


    }

    _drawGuideLine(){
        this._guideLine = this._mainGroup.append('line')
            .attr('class', 'guide-line')
            .attr('y1', 0)
            .attr('y2', this.calculations.mainGroupHeight)
            .attr('stroke', '#999')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4')
            .style('opacity', 0)
            .style('pointer-events', 'none');
    }

    _drawLabels(){
        // Build timestamp in bottom-left
        if (this._data.build_at_utc) {
            const dateStr = this._data.build_at_utc.toISOString().split('T')[0];
            this._mainGroup.append('text')
                .attr('class', 'build-timestamp')
                .attr('x', 0)
                .attr('y', this.calculations.svgHeight - 13)
                .attr('fill', '#999')
                .attr('font-size', '10px')
                .text(`Forecast built on ${dateStr}`);
        }

        this._mainGroup.append('text')
            .attr('x', this.calculations.mainGroupWidth)
            .attr('y', this.calculations.svgHeight - 13)
            .attr('fill', '#999')
            .attr('font-size', '10px')
            .attr('text-anchor', 'end')
            .text(`valex.github.io`);
    }// end _drawLabels

    _drawTitle() {
        const settings = this._symbolSettings[this._currentSymbol];
        if (settings && settings.title) {
            this._mainGroup.append('text')
                .attr('class', 'chart-title')
                .attr('x', 10)
                .attr('y', 25)
                .attr('fill', '#333')
                .attr('font-size', '18px')
                .attr('font-weight', 'bold')
                .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
                .style('pointer-events', 'none')
                .text(settings.title);
        }
    }

    _drawAxes() {
        // X axis - time
        const axisX = d3.axisBottom(this.scaleX)
            .ticks(d3.utcDay.every(2))
            .tickFormat((d, i, nodes) => {
                const month = d.getUTCMonth();
                const prevMonth = i > 0 ? new Date(nodes[i - 1].__data__).getUTCMonth() : -1;
                const showMonth = month !== prevMonth;
                return (showMonth ? d3.utcFormat('%b')(d) + ' ' : '') + d.getUTCDate();
            });
        const axisXGroup = this._mainGroup.append('g')
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


    } // end _drawAxes()

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
        if (!this.scaleX || !this.scaleY) return;
        

        if (event.touches) {
            event = event.touches[0];
        }

        const [x, y] = d3.pointer(event, this._mainGroup.node());

        const date = this.scaleX.invert(x);
        
        const bisect = d3.bisector(d => d.date).center;
        const idx = Math.min(
            bisect(this._data.mean_path, date),
            this._data.mean_path.length - 1
        );
        
        const mean = this._data.mean_path[idx];
        const lower = this._data.prediction_interval_95.lower[idx];
        const upper = this._data.prediction_interval_95.upper[idx];
        
        const snappedX = this.scaleX(mean.date) + 0.5;

        // Update guide line
        if (this._guideLine) {
            this._guideLine
                .attr('x1', snappedX)
                .attr('x2', snappedX)
                .attr('y1', 0)
                .attr('y2', this.calculations.mainGroupHeight)
                .style('opacity', 1);
        }

        const dateStr = `${d3.timeFormat('%b')(mean.date)} ${mean.date.getDate()}`;
        
        const toFixed = this._symbolSettings[this._currentSymbol].toFixed;
        const upperText = `Upper: ${upper.value.toFixed(toFixed)}`;
        const meanText = `Mean: ${mean.value.toFixed(toFixed)}`;
        const lowerText = `Lower: ${lower.value.toFixed(toFixed)}`;

        // Calculate tooltip dimensions based on text length
        const padding = 8;
        const lineHeight = 16;
        const charWidth = 6.5; // approximate monospace char width
        const maxChars = Math.max(
            dateStr.length,
            upperText.length,
            meanText.length,
            lowerText.length
        );
        const width = Math.max(96, padding * 2 + maxChars * charWidth);
        const height = 72;

        // Smart positioning - flip left if near right edge
        const showLeft = (x + width + 12) > this.calculations.mainGroupWidth;
        const tooltipX = showLeft ? x - width - 12 : x + 12;
        const tooltipY = Math.max(20, y - height + height/2);

        // Update tooltip content
        this._tooltip
            .attr('visibility', 'visible')
            .attr('transform', `translate(${tooltipX}, ${tooltipY})`);

        this._tooltip.select('.tooltip-title').text(dateStr);
        this._tooltip.select('.tooltip-upper').text(upperText);
        this._tooltip.select('.tooltip-mean').text(meanText);
        this._tooltip.select('.tooltip-lower').text(lowerText);

        // Update background rect size
        this._tooltip.select('.tooltip-bg')
            .attr('width', width)
            .attr('height', height);

        this._tooltip.raise();
    }

    _hideTooltip() {
        this._tooltip.attr('visibility', 'hidden');
        if (this._guideLine) {
            this._guideLine.style('opacity', 0);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof d3 !== 'undefined') {
        const APP = new CryptoForecastApp({
            container_id: 'svg_chart'
        });
        // Export to window for debugging if needed
        window.cryptoApp = APP;
    } else {
        console.error('D3 library is not loaded! Crypto Forecast cannot initialize.');
    }
});
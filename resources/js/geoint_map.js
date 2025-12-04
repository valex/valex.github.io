const DB = {
    'road_distance_marker': {
        'AUS': [],
        'BEL': ['bel1.jpg','bel2.jpg','bel3.jpg'],
        'CZE': ['cze1.jpg','cze2.jpg','cze3.jpg'],
        'ESP': ['esp1.jpg','esp2.jpg','esp3.jpg','esp4.jpg',],
        'EST': ['est1.jpg','est2.jpg','est3.jpg'],
        'FRA': ['fra1.jpg','fra2.jpg'],
        'HUN': ['hun1.jpg','hun2.jpg','hun3.jpg'],
        'GRC': ['grc1.jpg','grc2.jpg'],
        'MNE': [],
        'NOR': [],
        'OSA': [],
        'PRT': ['portugal1.jpg','portugal2.jpg','portugal3.jpg'],
        'SRB': ['srb1.jpg','srb2.jpg'],
        'SVK': ['svk1.jpg','svk2.jpg','svk3.jpg','svk4.jpg',],
    },

    tourist_attraction: {
        'FRA': ['france-tower.jpg', 'france-louvre.jpg'],
        'ITA': ['italy-colosseum.jpg'],
        'ESP': ['spain-sagrada.jpg']
    }
};

class PAGE_APP {
    // Constructor
    constructor() {
        this.options = {
            elID: 'svg_chart',
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

        this.calculations = {
            windowWidth: null,
            svgWidth: null,
            svgHeight: null,
            mainGroupWidth: null,
            mainGroupHeight: null,
        };

        this.el = null;
        this.width = null;
        this.height = null;

        this.svg = null;
        this.mainGroup = null;
        this.mapGroup = null;
        this.projection = null;
        this.tooltip = null;
        this.zoom = null; 

        this.tooltipState = {
            currentCountry: null,
            currentElement: null,
            isVisible: false,
            currentImageIndex: 0, 
            totalImages: 0        
        };

        this.init();
    }

    init(){
        this.calculations.windowWidth = window.innerWidth;

        if(this.calculations.windowWidth < this.options.breakpoints.extraSmall){
            this.options.aspectRatio = 4/3;
        }

        this.el = document.getElementById(this.options.elID);

        this.calculations.svgWidth = Math.floor( this.el.clientWidth - 1 );
        this.calculations.svgHeight = Math.floor( this.calculations.svgWidth / this.options.aspectRatio );

       
        this.calculations.mainGroupWidth = this.calculations.svgWidth - this.options.margins.left - this.options.margins.right;
        this.calculations.mainGroupHeight = this.calculations.svgHeight - this.options.margins.top - this.options.margins.bottom;
        
        this.tooltip = d3.select("#svg_tooltip");
        this.setupTooltipEvents();

        this.svg = d3.select(this.el)
                .append("svg")
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr("width", this.calculations.svgWidth)
                .attr("height", this.calculations.svgHeight)
                .on('click', (event) => {
                    // Закрываем tooltip при клике на пустое место SVG
                    if (event.target === this.svg.node()) {
                        this.hideTooltip();
                    }
                });

        this.mainGroup = this.svg.append('g')
            .attr('transform', 'translate(' + this.options.margins.left + ',' + this.options.margins.top + ')');

        this.mapGroup = this.mainGroup.append('g')
            .attr('class', 'map-group');

        this.projection = d3.geoNaturalEarth1()
            .translate([this.calculations.mainGroupWidth / 2, this.calculations.mainGroupHeight / 2])

        this.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [this.calculations.mainGroupWidth, this.calculations.mainGroupHeight]])
            .on('zoom', (event) => this.zoomed(event));

        this.svg.call(this.zoom);

        const that = this;
        d3.json("./data/world.geojson").then(function(world) {

            that.projection.fitSize([that.calculations.mainGroupWidth, that.calculations.mainGroupHeight], world)

            that.mapGroup.selectAll(".country")
                .data(world.features)
                .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", d3.geoPath().projection(that.projection))
                .attr("data-name", d => { return d.id+' '+d.properties.name})
                .style("stroke", "#fff")
                .style("stroke-width", "0.1px")
                .attr("fill", d => {
                    const countryId = d.id;
                    return (countryId in DB.road_distance_marker && DB.road_distance_marker[countryId].length > 0) 
                        ? "#69b3a2"
                        : "#ccc";
                })
                .on("click", function(event, d) {

                    event.stopPropagation();
                    that.toggleTooltip(event, d, this);
                })
                .on("mouseover", function(event, d) {
                    if (!that.tooltipState.isVisible || that.tooltipState.currentCountry !== d) {
                        d3.select(this).style("opacity", 0.8);
                    }
                })
                .on("mouseout", function(event, d) {
                    if (!that.tooltipState.isVisible || that.tooltipState.currentCountry !== d) {
                        d3.select(this).style("opacity", 1);
                    }
                });
        });

        // Events
        this.svg.on("dblclick.zoom", null) // Отключаем стандартный dblclick zoom
            .on("dblclick", () => this.resetZoom());

        d3.selectAll('input[name="markerType"]')
            .on('change', (event) => {
                const selectedValue = event.target.value;
                //console.log('Selected marker type:', selectedValue);
                this.hideTooltip();
                this.updateMapColors(selectedValue);
            });

    } // end init

    zoomed(event) {
        this.mapGroup.attr('transform', event.transform);
        
        // Если tooltip открыт, обновляем его позицию
        if (this.tooltipState.isVisible && this.tooltipState.currentCountry) {
            // Можно добавить логику для обновления позиции tooltip при зуме
        }
    }

    resetZoom() {
        this.svg.transition().duration(750).call(
            this.zoom.transform,
            d3.zoomIdentity
        );
    }

    updateMapColors(markerType) {
        this.mapGroup.selectAll(".country")
            .attr("fill", d => {
                const countryId = d.id;
                const hasData = countryId in DB[markerType] && DB[markerType][countryId].length > 0;
                return hasData ? "#69b3a2" : "#ccc";
            });
    }

    setupTooltipEvents() {
        const that = this;

        this.tooltip
            .on("click", function(event) {
                // Если клик по кнопке закрытия, закрываем tooltip
                if (event.target.classList.contains('tooltip-close-btn')) {
                    that.hideTooltip();
                    return;
                }
                
                // Если клик по изображению, переключаем на следующее
                if (event.target.classList.contains('tooltip-image')) {
                    that.nextImage();
                    return;
                }
                
                // Если клик по точке навигации
                if (event.target.classList.contains('nav-dot')) {
                    const index = parseInt(event.target.dataset.index);
                    that.showImageByIndex(index);
                    return;
                }
                
                // Предотвращаем закрытие tooltip при клике на другие части
                event.stopPropagation();
            });
    }

    toggleTooltip(event, countryData, element) {
        // Если tooltip уже показан для этой страны, скрываем его
        if (this.tooltipState.isVisible && this.tooltipState.currentCountry === countryData) {
            this.hideTooltip();
            return;
        }

        // Если tooltip показан для другой страны, сначала скрываем предыдущий
        if (this.tooltipState.isVisible) {
            this.hideTooltip();
        }

        // Показываем tooltip для новой страны
        this.showTooltip(event, countryData, element);
    }

    showTooltip(event, countryData, element) {
        // Сохраняем текущую страну и элемент
        this.tooltipState.currentCountry = countryData;
        this.tooltipState.currentElement = element;
        this.tooltipState.isVisible = true;
        this.tooltipState.currentImageIndex = 0; // Сбрасываем индекс на первое изображение

        // Получаем позицию клика относительно SVG
        const [x, y] = d3.pointer(event, this.svg.node());

        // Подсвечиваем выбранную страну
        d3.select(element).attr("fill", "#ff7f0e").style("opacity", 1);

        // Получаем текущий тип маркера и данные для страны
        const markerType = this.getCurrentMarkerType();
        const countryId = countryData.id;
        const countryName = countryData.id + ' ' + countryData.properties.name;

        // Обновляем tooltip содержимое
        this.updateTooltipContent(countryName, markerType, countryId);

        // Показываем tooltip
        this.tooltip
            .style("visibility", "visible")
            .style("left", (x + 2) + "px")
            .style("top", (y - 2) + "px");
    }

    updateTooltipContent(countryName, markerType, countryId) {
        // Создаем содержимое tooltip
        let tooltipContent = `
            <div style="text-align: center;">
                <div style="font-weight: bold; margin-bottom: 8px;">${countryName}</div>
        `;

        // Проверяем есть ли данные для этой страны
        if (countryId in DB[markerType] && DB[markerType][countryId].length > 0) {
            const images = DB[markerType][countryId];
            this.tooltipState.totalImages = images.length;
            
            // Показываем только текущее изображение
            const currentImage = images[this.tooltipState.currentImageIndex];
            const imageUrl = `./data/map_clues/${markerType}/${countryId}/${currentImage}`;
            
            tooltipContent += `
                <div style="position: relative; cursor: pointer;">
                    <img src="${imageUrl}" alt="${currentImage}" 
                         class="tooltip-image"
                         style="border-radius: 4px; margin: 4px; max-width: 280px; height: auto;" 
                         onerror="this.style.display='none'" />
                </div>
            `;

            // Добавляем навигационные точки, если изображений больше одного
            if (images.length > 1) {
                tooltipContent += `<div style="margin: 8px 0;">`;
                for (let i = 0; i < images.length; i++) {
                    const isActive = i === this.tooltipState.currentImageIndex;
                    tooltipContent += `
                        <span class="nav-dot" 
                              data-index="${i}"
                              style="display: inline-block; 
                                     width: 8px; 
                                     height: 8px; 
                                     border-radius: 50%; 
                                     margin: 0 3px; 
                                     cursor: pointer;
                                     background-color: ${isActive ? '#ff7f0e' : '#ccc'};
                                     transition: background-color 0.2s;">
                        </span>
                    `;
                }
                tooltipContent += `</div>`;
                
                // Добавляем подсказку
                tooltipContent += `
                    <div style="font-size: 11px; color: #999; margin: 4px 0;">
                        Click image to view next (${this.tooltipState.currentImageIndex + 1}/${images.length})
                    </div>
                `;
            }
        } else {
            // Если нет данных, показываем сообщение
            this.tooltipState.totalImages = 0;
            tooltipContent += `
                <div style="color: #999; font-style: italic; padding: 20px;">
                    No images available for this country
                </div>
            `;
        }

        tooltipContent += `
                <div style="font-size: 12px; color: #666; margin-top: 8px; cursor: pointer;" class="tooltip-close-btn">Click to close</div>
            </div>
        `;

        // Обновляем содержимое tooltip
        this.tooltip.html(tooltipContent);
    }

    nextImage() {
        if (this.tooltipState.totalImages <= 1) return;
        
        this.tooltipState.currentImageIndex = (this.tooltipState.currentImageIndex + 1) % this.tooltipState.totalImages;
        
        // Обновляем содержимое tooltip
        const markerType = this.getCurrentMarkerType();
        const countryId = this.tooltipState.currentCountry.id;
        const countryName = this.tooltipState.currentCountry.id + ' ' + this.tooltipState.currentCountry.properties.name;
        
        this.updateTooltipContent(countryName, markerType, countryId);
    }

    showImageByIndex(index) {
        if (index < 0 || index >= this.tooltipState.totalImages) return;
        
        this.tooltipState.currentImageIndex = index;
        
        // Обновляем содержимое tooltip
        const markerType = this.getCurrentMarkerType();
        const countryId = this.tooltipState.currentCountry.id;
        const countryName = this.tooltipState.currentCountry.id + ' ' + this.tooltipState.currentCountry.properties.name;
        
        this.updateTooltipContent(countryName, markerType, countryId);
    }

    hideTooltip() {
        if (!this.tooltipState.isVisible) {
            return;
        }

        // Скрываем tooltip
        this.tooltip.style("visibility", "hidden");

        // Возвращаем исходный цвет и opacity для предыдущей страны
        if (this.tooltipState.currentElement) {
            const countryId = this.tooltipState.currentCountry.id;
            const markerType = this.getCurrentMarkerType();
            const hasData = countryId in DB[markerType] && DB[markerType][countryId].length > 0;
            
            d3.select(this.tooltipState.currentElement)
                .attr("fill", hasData ? "#69b3a2" : "#ccc")
                .style("opacity", 1);
        }

        // Очищаем состояние
        this.tooltipState.currentCountry = null;
        this.tooltipState.currentElement = null;
        this.tooltipState.isVisible = false;
        this.tooltipState.currentImageIndex = 0;
        this.tooltipState.totalImages = 0;
    }

    getCurrentMarkerType() {
        const selectedRadio = d3.select('input[name="markerType"]:checked');
        return selectedRadio.empty() ? 'road_distance_marker' : selectedRadio.property('value');
    }
}

let APP = new PAGE_APP();
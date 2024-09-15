
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script cargado correctamente");

    const canvasContainer = document.querySelector('.canvas-container');
    const addLayerBtn = document.getElementById('add-layer-btn');
    const removeLayerBtn = document.getElementById('remove-layer-btn');
    const layerList = document.getElementById('layer-list');

    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;

    const scale = 1.5; 

    let initialX;
    let initialY;
    let isDrawing = false;
    let activeLayer = 1;
    let layerCount = 1;

    const toolSettings = {
        pen: { lineCap: 'round', lineJoin: 'round', lineDash: [] },
        pencil: { lineCap: 'round', lineJoin: 'round', lineDash: [] },
        brush: { lineCap: 'round', lineJoin: 'round', lineDash: [] },
        airbrush: { lineCap: 'round', lineJoin: 'round', lineDash: [] },
        marker: { lineCap: 'square', lineJoin: 'round', lineDash: [] }
    }

    let currentTool = 'pen';
    let currentTexture = 'http://127.0.0.1:8000/static/img/dibujo/pen.png';
    loadBrushPattern(currentTexture);
    let currentColor = '#000000';
    let currentOpacity = 1.0;
    let brushSize = 20;
    let brushPattern = null;

    const brushDropdownBtn = document.getElementById('brush-dropdown');
    const brushSizeInput = document.getElementById('brush-size');
    const brushSizeValue = document.getElementById('brush-size-value');
    const eraserToolBtn = document.getElementById('eraser-tool');

    function setTool(tool, texture) {
        currentTool = tool;
        currentTexture = 'http://127.0.0.1:8000/'+texture;
        if (tool !== 'eraser') {
            brushDropdownBtn.setAttribute('data-tool', tool);
            brushDropdownBtn.textContent = `${tool.charAt(0).toUpperCase() + tool.slice(1)}`;
        }
        console.log(`Herramienta seleccionada: ${tool}, ${currentTexture}`);
        loadBrushPattern(currentTexture); // Cargar patrón de pincel cuando se selecciona una herramienta
    }

    function loadBrushPattern(imageUrl) {
        const image = new Image();
        image.src = imageUrl;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = brushSize;
            canvas.height = brushSize;
            const context = canvas.getContext('2d');
            
            // Dibujar la textura en blanco y negro
            context.drawImage(image, 0, 0, brushSize, brushSize);
            
            // Cambiar el modo de composición para colorear la textura
            context.globalCompositeOperation = 'source-in';
            context.fillStyle = currentColor; // Color seleccionado
            context.fillRect(0, 0, brushSize, brushSize);
            
            brushPattern = context.createPattern(canvas, 'repeat');
            console.log('Patrón de pincel cargado y coloreado');
        };
    }

    document.querySelectorAll('.tool-option').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            setTool(event.target.getAttribute('data-tool'), event.target.getAttribute('texture'));
        });
    });

    document.querySelectorAll('.layer-item').forEach(item => {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
    });

    function setBrushSize(size) {
        brushSize = size;
        brushSizeValue.textContent = size;
        console.log(`Tamaño del pincel: ${size}`);
        loadBrushPattern(currentTexture); // Recargar patrón de pincel con el nuevo tamaño
    }

    function setColor(color) {
        currentColor = color.toHEXA().toString();
        console.log(`Color seleccionado: ${currentColor}`);
        loadBrushPattern(currentTexture); // Recargar el patrón de pincel con el nuevo color
    }
    
    function setOpacity(opacity) {
        currentOpacity = opacity;
        console.log(`Opacidad seleccionada: ${currentOpacity}`);
    }

    eraserToolBtn.addEventListener('click', () => setTool('eraser'));

    const pickr = Pickr.create({
        el: '#color-picker',
        theme: 'classic',
        default: '#000000',
        components: {
            preview: true,
            opacity: true,
            hue: true,
    
            interaction: {
                hex: true,
                rgba: true,
                hsla: true,
                hsva: true,
                cmyk: true,
                input: true,
                clear: true,
                save: true
            }
        }
    });
    
    pickr.on('change', (color) => {
        setColor(color);
        setOpacity(color.toRGBA()[3]);
    });

    function createItemLayer() {
        const newLayerItem = document.createElement('li');
        newLayerItem.classList.add('layer-item');
        newLayerItem.setAttribute('data-layer', layerCount);

        const thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = width * 0.18;
        thumbnailCanvas.height = height * 0.18;
        thumbnailCanvas.style.border = '1px solid #5e5c5c';
        thumbnailCanvas.classList.add('layer-thumbnail');
        newLayerItem.appendChild(thumbnailCanvas);

        layerList.appendChild(newLayerItem);
    }

    let draggedLayer = null;

    function handleDragStart(event) {
        draggedLayer = event.currentTarget;
        event.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const targetLayer = event.currentTarget;
        if (draggedLayer !== targetLayer) {
            const layerList = document.getElementById('layer-list');
            const rect = targetLayer.getBoundingClientRect();
            const offset = event.clientY - rect.top;
            if (offset > rect.height / 2) {
                layerList.insertBefore(targetLayer, draggedLayer.nextElementSibling);
            } else {
                layerList.insertBefore(targetLayer, draggedLayer);
            }
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        draggedLayer = null;
        updateLayerOrder();
    }


    function updateLayerOrder() {
        const layers = Array.from(document.querySelectorAll('.layer-item'));
        const canvasContainer = document.querySelector('.canvas-container');
        layers.forEach(layer => {
            const layerNumber = layer.getAttribute('data-layer');
            const canvas = document.querySelector(`canvas[data-layer="${layerNumber}"]`);
            if (canvas) {
                canvasContainer.removeChild(canvas);
                canvasContainer.appendChild(canvas);
            }
        });
        updateThumbnails();
    }
    
    
    

    function createLayer() {
        createItemLayer();
        const newCanvas = document.createElement('canvas');
        newCanvas.width = width * scale;
        newCanvas.height = height * scale;
        newCanvas.style.width = `${width}px`;
        newCanvas.style.height = `${height}px`;
        newCanvas.classList.add('layer-canvas');
        newCanvas.setAttribute('data-layer', layerCount);
        const context = newCanvas.getContext('2d');
        context.scale(scale, scale);
        canvasContainer.appendChild(newCanvas);
        const newLayerItem = layerList.querySelector(`.layer-item[data-layer="${layerCount}"]`);
        newLayerItem.setAttribute('draggable', 'true');
        newLayerItem.addEventListener('dragstart', handleDragStart);
        newLayerItem.addEventListener('dragover', handleDragOver);
        newLayerItem.addEventListener('drop', handleDrop);
    
        setActiveLayer(layerCount);
    }
    

    function setActiveLayer(layerNumber) {
        activeLayer = layerNumber;
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`li[data-layer="${layerNumber}"]`).classList.add('active');
    }

    function addLayer() {
        layerCount++;
        createLayer();
    }

    function removeLayer() {
        if (layerCount > 1) {
            const activeLayerElement = document.querySelector(`canvas[data-layer="${activeLayer}"]`);
            const activeLayerListItem = document.querySelector(`li[data-layer="${activeLayer}"]`);

            canvasContainer.removeChild(activeLayerElement);
            layerList.removeChild(activeLayerListItem);
            layerCount--;

            if (activeLayer == 1) {
                let newLayerNumber = 1;
                const layers = canvasContainer.querySelectorAll('canvas.layer-canvas');
                const layerItems = layerList.querySelectorAll('li.layer-item');
                
                layers.forEach(layer => {
                    layer.setAttribute('data-layer', newLayerNumber);
                    newLayerNumber++;
                });

                newLayerNumber = 1;
                layerItems.forEach(item => {
                    item.setAttribute('data-layer', newLayerNumber);
                    newLayerNumber++;
                });
            }

            setActiveLayer(layerCount);
        }
    }

    function getActiveCanvas() {
        return document.querySelector(`canvas[data-layer="${activeLayer}"]`);
    }

    function getActiveThumbnail() {
        return document.querySelector(`li[data-layer="${activeLayer}"] .layer-thumbnail`);
    }

    function updateThumbnails() {
        const layers = document.querySelectorAll('.layer-item');
        
        layers.forEach(layer => {
            const layerNumber = layer.getAttribute('data-layer');
            const canvas = document.querySelector(`canvas[data-layer="${layerNumber}"]`);
            const thumbnail = layer.querySelector('.layer-thumbnail');
    
            if (canvas && thumbnail) {
                const thumbnailContext = thumbnail.getContext('2d');
                thumbnailContext.clearRect(0, 0, thumbnail.width, thumbnail.height);
                thumbnailContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, thumbnail.width, thumbnail.height);
            }
        });
    }
    

    function dibujar(cursorX, cursorY) {
        const canvas = getActiveCanvas();
        if (!canvas) {
            console.error("Canvas activo no encontrado.");
            return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
            console.error("No se pudo obtener el contexto de dibujo.");
            return;
        }
        context.lineTo(cursorX, cursorY);
        context.stroke();
        updateThumbnails();
    }

    function startDrawing(evt) {
        evt.preventDefault();
        isDrawing = true;
        const canvas = getActiveCanvas();
        const context = canvas.getContext("2d");
        context.beginPath();
        if (evt.changedTouches === undefined) {
            initialX = (evt.offsetX); 
            initialY = (evt.offsetY);
        } else {
            initialX = ((evt.changedTouches[0].pageX - canvas.getBoundingClientRect().left) * scale) / scale;
            initialY = ((evt.changedTouches[0].pageY - canvas.getBoundingClientRect().top) * scale) / scale;
        }
        if (currentTool === 'eraser') {
            startErasing(evt);
        } else {
            startBrushing(evt);
        }
        context.moveTo(initialX, initialY);
    }

    function keepDrawing(evt) {
        evt.preventDefault();
        if (!isDrawing) return;
        const canvas = getActiveCanvas();
        if (evt.changedTouches === undefined) {
            dibujar((evt.offsetX * scale) / scale, (evt.offsetY * scale) / scale);  // Ajustar las coordenadas según la escala
        } else {
            dibujar(((evt.changedTouches[0].pageX - canvas.getBoundingClientRect().left) * scale) / scale, ((evt.changedTouches[0].pageY - canvas.getBoundingClientRect().top) * scale) / scale);
        }
        if (!isDrawing) return;
        if (currentTool === 'eraser') {
            keepErasing(evt);
        } else if (currentTool === 'pen') {
            keepBrushing(evt);
        }
    }

    function startBrushing(evt) {
        const canvas = getActiveCanvas();
        const context = canvas.getContext('2d');
        const settings = toolSettings[currentTool];
        
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = currentColor;
        context.globalAlpha = currentOpacity;
        context.lineWidth = brushSize;
        context.setLineDash(settings.lineDash);
        context.lineCap = settings.lineCap;
        context.lineJoin = settings.lineJoin;
        
        if (brushPattern) {
            context.strokeStyle = brushPattern;
        }
        
        context.beginPath();
        initialX = (evt.offsetX);
        initialY = (evt.offsetY);
        context.moveTo(initialX, initialY);
    }
    
    function keepBrushing(evt) {
        if (!isDrawing) return;
        const canvas = getActiveCanvas();
        const context = canvas.getContext('2d');
        const cursorX = (evt.offsetX * scale) / scale;
        const cursorY = (evt.offsetY * scale) / scale;
    
        context.lineTo(cursorX, cursorY);
        context.stroke();
        updateThumbnails(); 
    }
    
    function startErasing(evt) {
        const canvas = getActiveCanvas();
        const context = canvas.getContext('2d');
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = brushSize;
        context.globalAlpha = 1.0; 
        context.beginPath();
        initialX = (evt.offsetX);
        initialY = (evt.offsetY);
        context.moveTo(initialX, initialY);
    }

    function keepErasing(evt) {
        if (!isDrawing) return;
        dibujar((evt.offsetX * scale) / scale, (evt.offsetY * scale) / scale);
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function handleLayerClick(event) {
        if (event.target.closest('.layer-item')) {
            const layerNumber = parseInt(event.target.closest('.layer-item').getAttribute('data-layer'));
            setActiveLayer(layerNumber);
        }
    }

    addLayerBtn.addEventListener('click', addLayer);
    removeLayerBtn.addEventListener('click', removeLayer);
    layerList.addEventListener('click', handleLayerClick);

    document.getElementById('save-btn').addEventListener('click', () => {
        const saveModal = new bootstrap.Modal(document.getElementById('saveModal'));
        saveModal.show();
    });
    
    document.getElementById('saveDrawing').addEventListener('click', () => {
        const nameDraw = document.getElementById('drawName').value; 
        const descriptionDraw = document.getElementById('descriptionDraw').value;
        const combinedCanvas = combineCanvases();
    
        if (!combinedCanvas) {
            alert('No hay nada para guardar.');
            return;
        }
    
        const dataURL = combinedCanvas.toDataURL('image/png');
    
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = nameDraw + '.png';
        downloadLink.click();
    
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch('/dibujo/guardar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                titulo: nameDraw,
                descripcion: descriptionDraw,
                imagen: dataURL 
            })
        }).then(response => {
            if (response.ok) {
                $('#successModal').modal('show');
                
                document.getElementById('saveModal').style.display = 'none';
                
                document.getElementById('redirectBtn').addEventListener('click', function() {
                    window.location.href = '/galeria/';
                });
            } else {
                $('#errorModal').modal('show');
            }
        });
    });    

    function combineCanvases() {
        const canvases = document.querySelectorAll('.canvas-container canvas');
        if (canvases.length === 0) return null;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvases[0].width;
        tempCanvas.height = canvases[0].height;
        const tempContext = tempCanvas.getContext('2d');
        canvases.forEach(canvas => {
            tempContext.drawImage(canvas, 0, 0);
        });
    
        return tempCanvas;
    }

    createLayer();

    canvasContainer.addEventListener("mousedown", startDrawing);
    canvasContainer.addEventListener("mousemove", keepDrawing);
    canvasContainer.addEventListener("mouseup", stopDrawing);
    canvasContainer.addEventListener("touchstart", startDrawing, { passive: true });
    canvasContainer.addEventListener("touchmove", keepDrawing, { passive: true });
    canvasContainer.addEventListener("touchend", stopDrawing);
    brushSizeInput.addEventListener('input', (event) => setBrushSize(event.target.value));    
});


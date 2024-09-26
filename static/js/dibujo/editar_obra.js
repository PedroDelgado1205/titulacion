document.addEventListener('DOMContentLoaded', function() {
    console.log("Script cargado correctamente");

    const canvasContainer = document.querySelector('.canvas-container');
    const imageUrl = canvasContainer.getAttribute('data-image-url');  // Obtener la URL de la imagen existente
    const addLayerBtn = document.getElementById('add-layer-btn');
    const removeLayerBtn = document.getElementById('remove-layer-btn');
    const layerList = document.getElementById('layer-list');

    const width = canvasContainer.clientWidth; // tamaño para futuros camvas (capas del lienzo)
    const height = canvasContainer.clientHeight; // tamaño para futuros camvas (capas del lienzo)

    const scale = 1.5; // escala del canvas

    let initialX;
    let initialY;
    let isDrawing = false;
    let activeLayer = 1;
    let layerCount = 1;

    // configuración para las herramientas
    const toolSettings = {
        pen: { lineCap: 'round', lineJoin: 'round', lineDash: [] },
        pencil: { lineCap: 'round', lineJoin: 'round', lineDash: [] },
        brush: { lineCap: 'round', lineJoin: 'round', lineDash: [] },
        airbrush: { lineCap: 'round', lineJoin: 'round', lineDash: [] },
        marker: { lineCap: 'square', lineJoin: 'round', lineDash: [] }
    }

    let currentTool = 'pen'; // herramienta inicial
    let currentTexture = 'http://127.0.0.1:8000/static/img/dibujo/pen.png'; // textura de la herramienta inicial
    loadBrushPattern(currentTexture); // carga de la textura
    let currentColor = '#000000'; // color inicial de las herramientas (negro)
    let currentOpacity = 1.0; // color solido
    let brushSize = 20;  // tamaño inicial de las herramientas
    let brushPattern = null;

    const brushDropdownBtn = document.getElementById('brush-dropdown');
    const brushSizeInput = document.getElementById('brush-size');
    const brushSizeValue = document.getElementById('brush-size-value');
    const eraserToolBtn = document.getElementById('eraser-tool');

    // funcion para establecer y cambiar herramientas de dibujo
    function setTool(tool, texture) {
        currentTool = tool; // cambio de herramienta
        currentTexture = 'http://127.0.0.1:8000/'+texture; // cambio de textura
        // evitar errores por la herramienta de borrador
        if (tool !== 'eraser') {
            brushDropdownBtn.setAttribute('data-tool', tool);
            brushDropdownBtn.textContent = `${tool.charAt(0).toUpperCase() + tool.slice(1)}`;
        }
        console.log(`Herramienta seleccionada: ${tool}, ${currentTexture}`);
        loadBrushPattern(currentTexture); // carga de la nueva textura
    }

    // función para cargar la textura de pincel cuando se selecciona una herramienta
    function loadBrushPattern(imageUrl) {
        const image = new Image(); // se inicia una nueva imagen
        image.src = imageUrl; // se carga la textura en la nueva imagen
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = brushSize; // se establese el cambio de tamaño
            canvas.height = brushSize; // se establese el cambio de tamaño
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, brushSize, brushSize); // se dibuja la nueva imagen
            context.globalCompositeOperation = 'source-in';
            context.fillStyle = currentColor; // se cambia el color
            context.fillRect(0, 0, brushSize, brushSize);
            brushPattern = context.createPattern(canvas, 'repeat'); // se dibuja la nueva imagen como la linea dubujada
            console.log('Patrón de pincel cargado y coloreado');
        };
    }

    // se cargan el resto de herramientas
    document.querySelectorAll('.tool-option').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            setTool(event.target.getAttribute('data-tool'), event.target.getAttribute('texture')); // se cambia la herramienta y textura
        });
    });

    // logica para tener una interfaz drag and drop dento de las capas
    document.querySelectorAll('.layer-item').forEach(item => {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
    });

    // funcion para cambiar el tamaño de la herramienta
    function setBrushSize(size) {
        brushSize = size;
        brushSizeValue.textContent = size;
        console.log(`Tamaño del pincel: ${size}`);
        loadBrushPattern(currentTexture); // carga la textura con el nuevo tamaño
    }

    // funcion para cambiar el color de la herramienta
    function setColor(color) {
        currentColor = color.toHEXA().toString();
        console.log(`Color seleccionado: ${currentColor}`);
        loadBrushPattern(currentTexture); // carga la textura con el nuevo color
    }
    
    // funcion para cambiar la opacidad de la herramienta
    function setOpacity(opacity) {
        currentOpacity = opacity;
        console.log(`Opacidad seleccionada: ${currentOpacity}`);
    }

    // herramienta de borrador que se encuentra separa del resto de herramientas
    eraserToolBtn.addEventListener('click', () => setTool('eraser'));

    // componete para el cambiar colores y opacidad de las herramientas
    const pickr = Pickr.create({
        el: '#color-picker',
        theme: 'classic', // tema del componente mas completo para el cambiar colores y opacidad de las herramientas
        default: '#000000', // color inicial (negro)
        components: {
            preview: true,
            opacity: true,
            hue: true,
            // diferentes formatos para poder cambiar el color
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
    
    // carga del nuevo color en la textura
    pickr.on('change', (color) => {
        setColor(color);
        setOpacity(color.toRGBA()[3]);
    });

    // crea una nueva capa dentro del menu de capas (miniatura)
    function createItemLayer() {
        const newLayerItem = document.createElement('li'); // crea una nueva capa dentro del menu
        newLayerItem.classList.add('layer-item'); // se añade el atributo del menu
        newLayerItem.setAttribute('data-layer', layerCount); // se nuemeriza la capa
        newLayerItem.setAttribute('draggable', 'true');  // Asegura que la capa es draggable
    
        const thumbnailCanvas = document.createElement('canvas'); // miniatura de la capa
        thumbnailCanvas.width = width * 0.18; // tamaño al 18%
        thumbnailCanvas.height = height * 0.18; // tamaño al 18%
        thumbnailCanvas.style.border = '1px solid #5e5c5c';
        thumbnailCanvas.classList.add('layer-thumbnail'); // agrega la miniatura al resto
        newLayerItem.appendChild(thumbnailCanvas);
    
        // Asignar eventos de arrastre
        newLayerItem.addEventListener('dragstart', handleDragStart);
        newLayerItem.addEventListener('dragover', handleDragOver);
        newLayerItem.addEventListener('drop', handleDrop);
    
        layerList.appendChild(newLayerItem);
    }
    
    // crea una nueva capa dentro del lienzo
    function createLayer() {
        createItemLayer(); // se crea la capa
        const newCanvas = document.createElement('canvas');
        newCanvas.width = width * scale; // tamaño de las nuevas capa iguales al resto
        newCanvas.height = height * scale; // tamaño de las nuevas capa iguales al resto
        newCanvas.style.width = `${width}px`; // tamaño de las nuevas capa iguales al resto
        newCanvas.style.height = `${height}px`; // tamaño de las nuevas capa iguales al resto
        newCanvas.classList.add('layer-canvas'); // se añade la capa al resto
        newCanvas.setAttribute('data-layer', layerCount); // se nuemeriza la capa
        
        const context = newCanvas.getContext('2d');
        context.scale(scale, scale);
        
        canvasContainer.appendChild(newCanvas); // se agrega la nueva capa al resto
    
        // Establecer la capa como activa
        setActiveLayer(layerCount);
    
        layerCount++;  // Incrementar el conteo de capas después de crear una nueva
    }

    let draggedLayer = null;

    // logica para actualizar el campo de orden de capas
    function handleDragStart(event) {
        draggedLayer = event.currentTarget;
        event.dataTransfer.effectAllowed = 'move';
    }

    // logica para mover las capas según el orden en el menu
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

    // logica para mover las capas según el orden en el lienzo
    function handleDrop(event) {
        event.preventDefault();
        draggedLayer = null;
        updateLayerOrder();
    }

    // logica para actualizar las miniaturas después de mover las capas
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

    // fincion para cambiar la capa a dibujar
    function setActiveLayer(layerNumber) {
        activeLayer = layerNumber;
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`li[data-layer="${layerNumber}"]`).classList.add('active');
    }

    // funcion para añadir una capar
    function addLayer() {
        layerCount++; // aunmenta el contador de capas
        createLayer(); // llama a la logica para crear capas
    }

    // funcion para eliminar una capa
    function removeLayer() {
        if (layerCount > 1) { // restincion de quedar siempre con una capa
            const activeLayerElement = document.querySelector(`canvas[data-layer="${activeLayer}"]`); // se toma la capa del liezo a borrar
            const activeLayerListItem = document.querySelector(`li[data-layer="${activeLayer}"]`); // se toma la miniatura del menu de capas correspondiente a la capa a borrar

            // se eliminan de las listas
            canvasContainer.removeChild(activeLayerElement); 
            layerList.removeChild(activeLayerListItem);
            layerCount--; // se reduce el contador de capas

            // actualizar el orden de las capas
            if (activeLayer == 1) {
                let newLayerNumber = 1;
                const layers = canvasContainer.querySelectorAll('canvas.layer-canvas'); // se obtienen el resto de capas
                const layerItems = layerList.querySelectorAll('li.layer-item'); // se obtienen el resto de minuaturas
                
                layers.forEach(layer => {
                    layer.setAttribute('data-layer', newLayerNumber); // cambio de orden (capas)
                    newLayerNumber++; // aunmete el contador para el cambio de orden (capas)
                });

                newLayerNumber = 1;
                layerItems.forEach(item => {
                    item.setAttribute('data-layer', newLayerNumber); // cambio de orden (miniaturas)
                    newLayerNumber++; // aunmete el contador para el cambio de orden (miniaturas)
                });
            }

            setActiveLayer(layerCount); // se cambia la capa activa 
        }
    }

    // obtencion de la capa activa
    function getActiveCanvas() {
        return document.querySelector(`canvas[data-layer="${activeLayer}"]`);
    }

    // obtencion de la miniatura activa
    function getActiveThumbnail() {
        return document.querySelector(`li[data-layer="${activeLayer}"] .layer-thumbnail`);
    }

    // actaulizacion de las miniaturas
    function updateThumbnails() {
        const layers = document.querySelectorAll('.layer-item'); // se obtienen las minuaturas
        
        layers.forEach(layer => {
            const layerNumber = layer.getAttribute('data-layer'); // se obtiene el numero la capas
            const canvas = document.querySelector(`canvas[data-layer="${layerNumber}"]`); // se obtiene la capa
            const thumbnail = layer.querySelector('.layer-thumbnail'); // se obtiene la miniatura correspondiente a la capa
    
            // se dibuja dento la miniatura el contenido de la capa
            if (canvas && thumbnail) {
                const thumbnailContext = thumbnail.getContext('2d');
                thumbnailContext.clearRect(0, 0, thumbnail.width, thumbnail.height);
                thumbnailContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, thumbnail.width, thumbnail.height);
            }
        });
    }

    // funcion para dibujar en la capa
    function dibujar(cursorX, cursorY) {
        const canvas = getActiveCanvas(); // se obtiene la capa activa
        if (!canvas) {
            console.error("Canvas activo no encontrado.");
            return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
            console.error("No se pudo obtener el contexto de dibujo.");
            return;
        }
        context.lineTo(cursorX, cursorY); // se dibuja la linea en la pocicion del cursor
        context.stroke(); // Dibuja el contorno la linea
        updateThumbnails(); // se actualiza la miniatura
    }

    // funcion para dibujar en la capa
    function startDrawing(evt) {
        evt.preventDefault();
        isDrawing = true;
        const canvas = getActiveCanvas();
        const context = canvas.getContext("2d");
        context.beginPath();
        if (evt.changedTouches === undefined) {
            initialX = (evt.offsetX); //cordenadas x del mouse
            initialY = (evt.offsetY); //cordenadas y del mouse
        } else {
            initialX = ((evt.changedTouches[0].pageX - canvas.getBoundingClientRect().left) * scale) / scale; // correccion de coordenadas x
            initialY = ((evt.changedTouches[0].pageY - canvas.getBoundingClientRect().top) * scale) / scale; // correccion de coordenadas y
        }
        // cambio de herrameintas
        if (currentTool === 'eraser') { // en caso de borrador
            startErasing(evt); 
        } else {
            startBrushing(evt); // en caso del resto de herramientas
        }
        context.moveTo(initialX, initialY);  // toma la posicion de cursos para dibujar
    }

    // funcion para mantener la logica de dibujar
    function keepDrawing(evt) {
        evt.preventDefault();
        if (!isDrawing) return;
        const canvas = getActiveCanvas();
        if (evt.changedTouches === undefined) {
            dibujar((evt.offsetX * scale) / scale, (evt.offsetY * scale) / scale); // correccion de coordenadas
        } else {
            dibujar(((evt.changedTouches[0].pageX - canvas.getBoundingClientRect().left) * scale) / scale, ((evt.changedTouches[0].pageY - canvas.getBoundingClientRect().top) * scale) / scale); // correccion de coordenadas
        }
        if (!isDrawing) return;
        // cambio de herrameintas
        if (currentTool === 'eraser') {
            keepErasing(evt);
        } else if (currentTool === 'pen') {
            keepBrushing(evt);
        }
    }

    // funcion para rayar en la capa
    function startBrushing(evt) {
        const canvas = getActiveCanvas();
        const context = canvas.getContext('2d');
        const settings = toolSettings[currentTool]; // se cargargan las configuraciones de la herramienta
        
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = currentColor; // se carga el color
        context.globalAlpha = currentOpacity; // se carga la opcacidad 
        context.lineWidth = brushSize; // se carga el tamaño
        // se carga el tipo de linea
        context.setLineDash(settings.lineDash); 
        context.lineCap = settings.lineCap;
        context.lineJoin = settings.lineJoin;
        
        if (brushPattern) {
            context.strokeStyle = brushPattern;
        }
        
        context.beginPath();
        initialX = (evt.offsetX); // cooredenadas x de cursor
        initialY = (evt.offsetY); // cooredenadas y de cursor
        context.moveTo(initialX, initialY); //toma la pocicion del cursor para empezar a rayar
    }
    
    // funcion para mantener la logica de rayar en la capa
    function keepBrushing(evt) {
        if (!isDrawing) return;
        const canvas = getActiveCanvas();
        const context = canvas.getContext('2d');
        const cursorX = (evt.offsetX * scale) / scale; // correccion de coordenadas x del cursor
        const cursorY = (evt.offsetY * scale) / scale; // correccion de coordenadas y del cursor
    
        context.lineTo(cursorX, cursorY); // empieza a rayar en la pocicion del cursor
        context.stroke(); // empieza a rayar el contorno de la linea
        updateThumbnails(); // actualiza la miniatura
    }
    
    // funcion para empezar a borrar en la capa
    function startErasing(evt) {
        const canvas = getActiveCanvas();
        const context = canvas.getContext('2d');
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = brushSize; // tamaño del borrador
        context.globalAlpha = 1.0; 
        context.beginPath();
        initialX = (evt.offsetX); // coordenadas x del cursor
        initialY = (evt.offsetY); // coordenadas y del cursor
        context.moveTo(initialX, initialY); //toma la pocicion del cursor para empezar a borrar
    }

    // funcion para mantener la logica de borrar en la capa
    function keepErasing(evt) {
        if (!isDrawing) return;
        dibujar((evt.offsetX * scale) / scale, (evt.offsetY * scale) / scale); // borra segun la logica de dibujo
    }

    // funcion para parar de dibujar
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
        saveModal.show(); // llama al modal para guardar el dibujo
    });
    
    document.getElementById('saveDrawing').addEventListener('click', () => {
        // datos necesarios para guardar la obra editada
        const nameDraw = document.getElementById('drawName').value;
        const descriptionDraw = document.getElementById('descriptionDraw').value;
        const combinedCanvas = combineCanvases(); // combina las capas en una sola imagen
        const drawNameElement = document.getElementById('drawName');
        const idDB = drawNameElement.getAttribute('idDB');
    
        if (!combinedCanvas) {
            alert('No hay nada para guardar.');
            return;
        }
    
        const dataURL = combinedCanvas.toDataURL('image/png'); // foramto png
    
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value; //csrfToken de djando para formularios
        fetch('/dibujo/guardar_edicion_dibujo/', { //llama a la url para guardar la edicion
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ // envia los datos en formato JSON
                titulo: nameDraw,
                descripcion: descriptionDraw,
                imagen: dataURL,
                id : idDB
            })
        }).then(response => {
            if (response.ok) {
                $('#successModal').modal('show'); // llama al modal de exito de guardado
                document.getElementById('saveModal').style.display = 'none'; // oculta el anterio modal
                document.getElementById('redirectBtn').addEventListener('click', function() {
                    window.location.href = '/galeria/'; // redirije a la pagina de galeria
                });
            } else {
                document.getElementById('saveModal').style.display = 'none';
                $('#errorModal').modal('show'); // modal de error de guardado
            }
        });
    });    

    // funcion para combinar las capas en una sola imagen
    function combineCanvases() {
        const canvases = document.querySelectorAll('.canvas-container canvas'); //obtiene todas las capas
        if (canvases.length === 0) return null;
        const tempCanvas = document.createElement('canvas'); // crea un camvas temporal para combinar las capas
        tempCanvas.width = canvases[0].width; // tamaño igal al resto de capas
        tempCanvas.height = canvases[0].height; // tamaño igal al resto de capas
        const tempContext = tempCanvas.getContext('2d');
        canvases.forEach(canvas => {
            tempContext.drawImage(canvas, 0, 0); // inserta capa por capa segun el orden en el que quedaron 
        });
    
        return tempCanvas; //devuelve la imagen combinada
    }

    // funcion para caraga la imagen a editar en la primera capa
    function loadExistingImage() {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = width * scale; // tamaño de la capa
        newCanvas.height = height * scale; // tamaño de la capa
        newCanvas.style.width = `${width}px`; // tamaño de la capa
        newCanvas.style.height = `${height}px`; // tamaño de la capa
        newCanvas.classList.add('layer-canvas'); // agrega a la lista de capas
        newCanvas.setAttribute('data-layer', layerCount); // agrega la nuemracion
        const context = newCanvas.getContext('2d');
        context.scale(scale, scale);
    
        const image = new Image();
        image.src = imageUrl; // se carga la imagen a editar
    
        image.onload = () => {
            const canvasAspectRatio = newCanvas.width / newCanvas.height;
            const imageAspectRatio = image.width / image.height;
    
            let newWidth, newHeight;

            newWidth = (newCanvas.width * scale)/2.4; // tamaño de la imagen
            newHeight = (newCanvas.height * scale)/2.4; // tamaño de la capa
    
            context.drawImage(image, 20, 15, newWidth, newHeight); // se dibuja la imgen dentro de la capa
    
            canvasContainer.appendChild(newCanvas); // se añade la capa
            createItemLayer(); // se crea la miniatura
    
            // Establecer la capa como activa
            setActiveLayer(layerCount);
        };
    }
    
    if (imageUrl) {
        loadExistingImage(); // carga la imagen a editar
    }

    // Funciones para compativilidad con mouse, tabletas de dibujo y dispositivos tactiles
    canvasContainer.addEventListener("mousedown", startDrawing);
    canvasContainer.addEventListener("mousemove", keepDrawing);
    canvasContainer.addEventListener("mouseup", stopDrawing);
    canvasContainer.addEventListener("touchstart", startDrawing, { passive: true });
    canvasContainer.addEventListener("touchmove", keepDrawing, { passive: true });
    canvasContainer.addEventListener("touchend", stopDrawing);
    brushSizeInput.addEventListener('input', (event) => setBrushSize(event.target.value));    
});

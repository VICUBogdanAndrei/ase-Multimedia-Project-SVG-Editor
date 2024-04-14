let startX, startY;

let selectedShape = null;
let currentColor = '#ff0000';
let defaultStrokeColor = '#000000';
let currentLineWidth = 1;
let isMoveMode = false;


let undoStack = [];
let redoStack = [];

function addShapeToCanvas(shape) {
    // Adăugăm elementul SVG la canvas
    svgCanvas.appendChild(shape);
    // Salvăm referința elementului pentru a putea face undo
    undoStack.push(shape);
}


function updateActiveButton(selectedButtonId) {
    // Deselectează toate butoanele
    document.querySelectorAll('#toolbar button').forEach(button => {
        button.classList.remove('button-active');
    });

    // Selectează butonul curent, dacă este specificat
    if (selectedButtonId) {
        const selectedButton = document.getElementById(selectedButtonId);
        if (selectedButton) {
            selectedButton.classList.add('button-active');
        }
    }
}
function undoLastAction() {
    if (undoStack.length === 0) {
        alert("Nu există acțiuni pentru undo.");
        return;
    }
    // Scoatem ultima formă adăugată din stivă și o eliminăm din DOM
    let shapeToUndo = undoStack.pop();
    svgCanvas.removeChild(shapeToUndo);
    
    // Adăugăm forma scoasă în stiva de redo
    redoStack.push(shapeToUndo);
}

function redoLastAction() {
    if (redoStack.length === 0) {
        alert("Nu există acțiuni pentru redo.");
        return;
    }
    // Scoatem ultima formă eliminată prin undo din stiva de redo
    let shapeToRedo = redoStack.pop();
    // Adăugăm elementul înapoi în DOM
    svgCanvas.appendChild(shapeToRedo);
    // Adăugăm forma înapoi în stiva de undo pentru un viitor undo
    undoStack.push(shapeToRedo);
}

function svgToPng() {
    let svgData = new XMLSerializer().serializeToString(svgCanvas);
    let canvas = document.createElement('canvas');
    canvas.width = svgCanvas.clientWidth;
    canvas.height = svgCanvas.clientHeight;
    
    let ctx = canvas.getContext('2d');
    let img = new Image();

    let svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    let url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url); // Eliberează memoria utilizată de URL-ul de obiect

        let imgURL = canvas.toDataURL('image/png');

        let dlLink = document.createElement('a');
        dlLink.download = 'desen.png';
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = ['image/png', dlLink.download, dlLink.href].join(':');

        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        console.log('Descărcarea ar trebui să înceapă acum.');
    };

    img.onerror = function() {
        console.error('A apărut o eroare la încărcarea SVG-ului în canvas.');
    };

    img.src = url;
}

function svgToJpg(quality = 0.75) {
    let svgData = new XMLSerializer().serializeToString(svgCanvas);
    let canvas = document.createElement('canvas');
    canvas.width = svgCanvas.clientWidth;
    canvas.height = svgCanvas.clientHeight;

    let ctx = canvas.getContext('2d');
    let img = new Image();

    let svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    let url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        // Setează fundalul canvas-ului în alb
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenează SVG-ul peste fundalul alb
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url); // Eliberează memoria utilizată de URL-ul de obiect

        let imgURL = canvas.toDataURL('image/jpeg', quality);

        let dlLink = document.createElement('a');
        dlLink.download = 'desen.jpg';
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = ['image/jpeg', dlLink.download, dlLink.href].join(':');

        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        console.log('Descărcarea ar trebui să înceapă acum.');
    };

    img.onerror = function() {
        console.error('A apărut o eroare la încărcarea SVG-ului în canvas.');
    };

    img.src = url;
}

function downloadSvg() {
    let svgData = new XMLSerializer().serializeToString(svgCanvas);
    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    let svgUrl = URL.createObjectURL(svgBlob);
    
    let downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "desen.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
    console.log('Descărcarea SVG-ului ar trebui să înceapă acum.');
}

document.getElementById('deleteButton').addEventListener('click', function() {
    // Selectează canvas-ul SVG
    const svg = document.getElementById('svgCanvas');
    
    // Elimină toate elementele copil din SVG
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    
    // O altă opțiune ar fi să setezi direct innerHTML la un string gol
    // svg.innerHTML = '';
});

document.addEventListener('DOMContentLoaded', function() {
    var downloadButton = document.getElementById('downloadButton');
    var downloadMenu = document.getElementById('downloadMenu');

    downloadButton.addEventListener('click', function(event) {
        event.preventDefault(); // Previne comportamentul default al butonului
        console.log("Download button was clicked"); // Mesaj la apăsarea butonului
        downloadMenu.classList.toggle('open'); // Comută clasa 'open'
        if(downloadMenu.classList.contains('open')){
            console.log("Download options should now be visible."); // Mesaj când opțiunile ar trebui să fie vizibile
        } else {
            console.log("Download options should now be hidden."); // Mesaj când opțiunile ar trebui să fie ascunse
        }
    });
});

// Adaugă un event listener la un buton pentru a declanșa descărcarea
document.getElementById('downloadSvg').addEventListener('click', downloadSvg);


document.getElementById('downloadPng').addEventListener('click', svgToPng);


document.getElementById('downloadJpg').addEventListener('click', function() {
    svgToJpg(); // Puteți să specificați o calitate, de exemplu, svgToJpg(0.85);
});

document.getElementById('undoButton').addEventListener('click', undoLastAction);

document.getElementById('redoButton').addEventListener('click', redoLastAction);

document.getElementById('drawRect').addEventListener('click', function() {
    
    if (selectedShape === 'rect') {
        // Dacă modul dreptunghi este deja selectat, dezactivează-l
        selectedShape = null;
        updateActiveButton(null); // Niciun buton nu ar trebui să fie activ
        console.log("Modul dreptunghi dezactivat");
    } else {
        // Altfel, activează modul dreptunghi
        selectedShape = 'rect';
        updateActiveButton('drawRect');
        console.log("Dreptunghi selectat"); // Mesaj de depanare
    }
});

document.getElementById('drawCircle').addEventListener('click', function() {
    if (selectedShape === 'circle') {
        selectedShape = null;
        updateActiveButton(null); 
        console.log("Modul cerc dezactivat");
    } else {
        selectedShape = 'circle';
        updateActiveButton('drawCircle');
        console.log("Cerc selectat"); // Mesaj de depanare
    }
});

document.getElementById('drawLine').addEventListener('click', function() {
    if (selectedShape === 'line') {
        selectedShape = null;
        updateActiveButton(null); 
        console.log("Modul linie dezactivat");
    } else {
        selectedShape = 'line';
        updateActiveButton('drawLine');
        console.log("Linie selectata");
    }
});

document.getElementById('drawEllipse').addEventListener('click', function() {
    if (selectedShape === 'ellipse') {
        selectedShape = null;
        updateActiveButton(null); 
        console.log("Modul elipsă dezactivat");
    } else {
        selectedShape = 'ellipse';
        updateActiveButton('drawEllipse');
        console.log("Elipsă selectată"); // Mesaj de depanare
    }
});

document.getElementById('colorPicker').addEventListener('change', function(e) {
    currentColor = e.target.value;
    console.log("Culoare selectată:", currentColor);
});

document.getElementById('lineWidthPicker').addEventListener('change', function(e) {
    currentLineWidth = e.target.value;
});

const svgCanvas = document.getElementById('svgCanvas');
svgCanvas.addEventListener('mousedown', startDrawing);
svgCanvas.addEventListener('mousemove', draw);
svgCanvas.addEventListener('mouseup', stopDrawing);



function startDrawing(e) {

    console.log("Începe desenarea: ", selectedShape); 
    if (!selectedShape) return;


    startX = e.offsetX;
    startY = e.offsetY;

    let shape;
    if (selectedShape === 'rect') {
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', startX);
        shape.setAttribute('y', startY);
        shape.setAttribute('width', 0);
        shape.setAttribute('height', 0);
        shape.setAttribute('fill', currentColor || '#ff0000');
        shape.setAttribute('stroke', defaultStrokeColor);
        shape.setAttribute('stroke-width', currentLineWidth);
        shape.id = 'currentShape';
        svgCanvas.appendChild(shape);
    } else if (selectedShape === 'circle') {
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shape.setAttribute('cx', startX);
        shape.setAttribute('cy', startY);
        shape.setAttribute('r', 0); // Raza va fi setată în funcția draw
        shape.setAttribute('fill', currentColor);
        shape.setAttribute('stroke', defaultStrokeColor);
        shape.setAttribute('stroke-width', currentLineWidth);
        shape.id = 'currentShape';
        svgCanvas.appendChild(shape);
    } else if (selectedShape === 'line') {
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        shape.setAttribute('x1', startX);
        shape.setAttribute('y1', startY);
        shape.setAttribute('x2', startX); // x2, y2 vor fi actualizate în funcția draw
        shape.setAttribute('y2', startY);
        shape.setAttribute('stroke', currentColor);
        shape.setAttribute('stroke-width', currentLineWidth);
        shape.id = 'currentShape';
        svgCanvas.appendChild(shape);
    } else if (selectedShape === 'ellipse'){
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        // Setează centrul elipsei la punctul de start
        shape.setAttribute('cx', startX);
        shape.setAttribute('cy', startY);
        // Inițializează razele elipsei la zero
        shape.setAttribute('rx', 0);
        shape.setAttribute('ry', 0);
        // Setează culoarea și grosimea conturului elipsei
        shape.setAttribute('stroke', defaultStrokeColor);
        shape.setAttribute('stroke-width', currentLineWidth);
        // Setează o culoare de umplere, dacă este necesar
        shape.setAttribute('fill', currentColor); 
        // Dă un ID unic formei curente pentru a o putea identifica ulterior
        shape.id = 'currentShape';
        // Adaugă elipsa la canvas-ul SVG
        svgCanvas.appendChild(shape);
    }

    if (shape) {
        shape.id = 'currentShape';
        svgCanvas.appendChild(shape);
    }
}

function draw(e) {
    if (!selectedShape || !document.getElementById('currentShape')) return;
    
    const currentShape = document.getElementById('currentShape');
    if (selectedShape === 'rect') {
        let width = e.offsetX - startX;
        let height = e.offsetY - startY;
        currentShape.setAttribute('width', Math.abs(width));
        currentShape.setAttribute('height', Math.abs(height));
        currentShape.setAttribute('x', Math.min(startX, e.offsetX));
        currentShape.setAttribute('y', Math.min(startY, e.offsetY));
    } else if (selectedShape === 'circle') {
        let radius = Math.sqrt(Math.pow(startX - e.offsetX, 2) + Math.pow(startY - e.offsetY, 2));
        currentShape.setAttribute('r', radius);
    } else if (selectedShape === 'line') {
        currentShape.setAttribute('x2', e.offsetX);
        currentShape.setAttribute('y2', e.offsetY);
    } else if (selectedShape === 'ellipse') {
        // Calculul razelor pentru elipsă
        let rx = Math.abs(e.offsetX - startX) / 2;
        let ry = Math.abs(e.offsetY - startY) / 2;
        
        // Actualizarea atributelor pentru elipsă
        currentShape.setAttribute('rx', rx);
        currentShape.setAttribute('ry', ry);
        
        // Ajustarea centrului elipsei în timpul desenării
        currentShape.setAttribute('cx', Math.min(startX, e.offsetX) + rx);
        currentShape.setAttribute('cy', Math.min(startY, e.offsetY) + ry);
    }
}

function stopDrawing() {
    if (document.getElementById('currentShape')) {
        // Adaugă forma completată în stiva de undo
        addShapeToCanvas(document.getElementById('currentShape'));
        document.getElementById('currentShape').id = '';
    }
    // Nu resetăm selectedShape aici pentru a permite desenarea continuă a aceleiași forme
}



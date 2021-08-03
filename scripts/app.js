const inputFile = document.getElementById('inputImage');
const checkboxResize = document.getElementById('checkboxResize');
const inputImageWidth = document.getElementById('inputImageWidth');
const inputImageHeight = document.getElementById('inputImageHeight');
const imageSizeContainer = document.getElementById('imageSizeContainer');
const radioSymbolsButtons = document.getElementsByName('symbols');
const resultText = document.getElementById('resultText');
const resultWrapper = document.getElementById('resultWrapper');
const buttonPlusSize = document.getElementById('buttonPlusSize');
const buttonMinusSize = document.getElementById('buttonMinusSize');
const buttonCopyToClipboard = document.getElementById('buttonCopyToClipboard');

buttonPlusSize.addEventListener('click', onResultSizePlus);
buttonMinusSize.addEventListener('click', onResultSizeMinus);
buttonCopyToClipboard.addEventListener('click', onResultCopyButtonClicked);

inputFile.addEventListener('change', onInputFileChanged);
checkboxResize.addEventListener('change', onCheckboxResizeChanged);

function onResultCopyButtonClicked() {
    copyToClipboard(resultText.innerText);
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        return window.clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed"; 
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}


function onCheckboxResizeChanged(event) {
    inputImageWidth.disabled = !checkboxResize.checked;
    inputImageHeight.disabled = !checkboxResize.checked;
    imageSizeContainer.style.color = checkboxResize.checked ? '#ffffff' : '#808080';
}

function onInputFileChanged(event) {

    if(checkboxResize.checked) {

        if(!inputImageWidth.value 
            || !inputImageHeight.value 
            || inputImageWidth.value < 1 
            || inputImageHeight.value < 1)
        {
            window.alert('Введите размер изображения, раз уж решили изменять его!');
            return;
        }
    }

    if(!this.files)
        return;

    const imageWidth = inputImageWidth.value;
    const imageHeight = inputImageHeight.value;

    let file = this.files[0];
    let fileReader = new FileReader();

    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');

    let img = new Image;
    let selectedSymbols = getSelectedRadio(radioSymbolsButtons);
    img.onload = function() {

        cvs.width = imageWidth;
        cvs.height = imageHeight;
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

        let imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);

        let drawableString = new DrawableString(cvs.width, cvs.height, '░');

        for (let x = 0; x < cvs.width; x++) {
            for (let y = 0; y < cvs.height; y++) {
                 
                let rgbPixel = getPixelXY(imageData, x, y);
                
                let char = getCharByColor(rgbPixel[0], rgbPixel[1], rgbPixel[2], selectedSymbols);

                drawableString.setPixel(x, y, char);
            }
           
        }
        resultWrapper.style.display = 'block';
        resultText.innerText = drawableString.toString();
    }

    fileReader.onload = function() {
        if(fileReader.result)
            img.src = fileReader.result;
    }

    fileReader.error = function() {
        window.alert('Произошла ошибка, попробуйте еще раз!')
    }

    fileReader.readAsDataURL(file);
}

function onResultSizePlus(event) {

    let currentSize = resultText.style.fontSize.replace('px', '').replace('pt', '') * 1;
    currentSize++;
    resultText.style.fontSize = `${currentSize}px`;
}

function onResultSizeMinus(event) {
    let currentSize = resultText.style.fontSize.replace('px', '').replace('pt', '') * 1;
    currentSize--;

    if(currentSize > 0)
        resultText.style.fontSize = `${currentSize}px`;
}

function getSelectedRadio(radioButtons){
    for (let i = 0; i < radioButtons.length; i++) {
        if(radioButtons[i].checked){
            return radioButtons[i].value;        
        }
    }
}

function getPixel(imageData, index) {
    let i = index * 4, d = imageData.data;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]] 
}

function getPixelXY(imageData, x, y) {
    return getPixel(imageData, y * imageData.width + x);
}

function getCharByColor(r, g, b, symbolsType) {
    
    let brightness = (r + g + b) / 3;

    let symbols = symbolsType === 'ascii' ? ['@', '#', 'S', '%', '?', '*', '+', ':', ',', '.'] : ['█', '▓', '▒', '░'] ;//['.', ',', ':', '+', '*', '?', '%', 'S', '#', '@'] : ['░', '▒', '▓', '█'];
    let step = (brightness / 255) * (symbols.length - 1);

    let index = Math.floor(step);
    return symbols[index];
}

class DrawableString {

    constructor(width, height, background) {
        this.symbols = new Array(width);
        this.width = width;
        this.height = height;
        
        for (let x = 0; x < width; x++){

            this.symbols[x] = new Array(height);
            for (let y = 0; y < height; y++){
                this.symbols[x][y] = background;
            }

        }
    }

    setPixel(x, y, value) {
        this.symbols[x][y] = value;
    }

    getPixel(x, y) {
        return this.symbols[x][y];
    }

    toString() {
        let output = '';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                output += this.symbols[x][y];
            }
            output += '\n';
        }
        
        return output;
    }
}
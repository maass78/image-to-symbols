const inputFile = document.getElementById('inputImage');

const imageWidht = 200;
const imageHeight = 200;

inputFile.addEventListener('change', onInputFileChanged);

function onInputFileChanged(event) {

    let file = this.files[0];
    let fileReader = new FileReader();

    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');

    let img = new Image;
    img.onload = function() {

        cvs.width = imageWidht;
        cvs.height = imageHeight;
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

        let imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);

        let drawableString = new DrawableString(cvs.width, cvs.height, '░');

        for (let x = 0; x < cvs.width; x++) {
            for (let y = 0; y < cvs.height; y++) {
                 
                let rgbPixel = getPixelXY(imageData, x, y);
                
                drawableString.setPixel(x, y, getCharByColor(rgbPixel[0], rgbPixel[1], rgbPixel[2]));
            }
           
        }

        console.log(drawableString.toString());
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

function getPixel(imageData, index) {
    let i = index * 4, d = imageData.data;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]] 
}

function getPixelXY(imageData, x, y) {
    return getPixel(imageData, y * imageData.width + x);
}

function getCharByColor(r, g, b) {
    
    let brightness = (r + g + b) / 3;

    if (brightness >= 0 && brightness < 50)
        return '█';
    else if (brightness >= 50 && brightness < 120)
        return '▓';
    else if (brightness >= 120 && brightness < 180)
        return '▒';
    else
        return '░';
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
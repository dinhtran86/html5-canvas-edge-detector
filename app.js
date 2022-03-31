const LaplacianKernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];

window.onload = () => {
    let video = document.querySelector('#myVideo');
    let canvas = document.querySelector('#myCanvas');
    let context = canvas.getContext('2d');
    let back = document.createElement('canvas');
    let backContext = back.getContext('2d');

    let canvasWidth, canvasHeight;

    video.addEventListener('play', () => {
        canvasWidth = video.clientWidth;
        canvasHeight = video.clientHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        back.width = canvasWidth;
        back.height = canvasHeight;
        draw(video, context, backContext, canvasWidth, canvasHeight);
    }, false);
};

const draw = (video, context, backContext, canvasWidth, canvasHeight) => {
    if (video.paused || video.ended) {
        return false;
    }
    // Draw the video into the backing canvas
    backContext.drawImage(video, 0, 0, canvasWidth, canvasHeight);

    // Grab the pixel data from the backing canvas
    let imgData = backContext.getImageData(0, 0, canvasWidth, canvasHeight);

    // Convert RGB frame to Grayscale frame
    grayscale(imgData);

    // Edge detector using Laplacian kernel
    let outputData = context.createImageData(canvasWidth, canvasHeight);
    convolve(imgData, outputData, LaplacianKernel);

    // Draw the pixels onto the visible canvas
    context.putImageData(outputData, 0, 0);

    // Start over
    setTimeout(draw, 20, video, context, backContext, canvasWidth, canvasHeight);

};

const grayscale = (imgData) => {
    let data = imgData.data;
    let dataLength = data.length;
    for (let i = 0; i < dataLength; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        let brightness = (3 * r + 4 * g + b) >>> 3;
        data[i] = data[i + 1] = data[i + 2] = brightness;
    }
    imgData.data = data;
};

const convolve = (imgData, outputData, kernel) => {
    let w = imgData.width,
        h = imgData.height;
    let iD = imgData.data,
        oD = outputData.data;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let i = (y * w + x) * 4 + c;
                oD[i] =
                    kernel[0] * iD[i - w * 4 - 4] +
                    kernel[1] * iD[i - w * 4] +
                    kernel[2] * iD[i - w * 4 + 4] +
                    kernel[3] * iD[i - 4] +
                    kernel[4] * iD[i] +
                    kernel[5] * iD[i + 4] +
                    kernel[6] * iD[i + w * 4 - 4] +
                    kernel[7] * iD[i + w * 4] +
                    kernel[8] * iD[i + w * 4 + 4];
            }
            oD[(y * w + x) * 4 + 3] = 255;
        }
    }
};
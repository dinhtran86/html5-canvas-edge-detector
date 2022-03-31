const LaplacianKernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
//[-1   -1  -1]
//[-1    8  -1]
//[-1   -1  -1]

window.onload = () => {
    let myCanvas = document.querySelector('#myCanvas');
    let context = myCanvas.getContext('2d');
    
    let back = document.createElement('canvas');
    let backContext = back.getContext('2d');

    let canvasWidth, canvasHeight;

    let myVideo = document.querySelector('#myVideo');

    myVideo.addEventListener('play', () => {
        canvasWidth = myVideo.clientWidth;
        canvasHeight = myVideo.clientHeight;
        myCanvas.width = canvasWidth;
        myCanvas.height = canvasHeight;
        back.width = canvasWidth;
        back.height = canvasHeight;
        draw(myVideo, context, backContext, canvasWidth, canvasHeight);
    }, false);
};


const RGBtoGrayscale = (imgData) => {
    let imgMat = imgData.data;
    
    for (let i = 0; imgMat.length-i ; i += 4) {
        let red = imgMat[i];
        let green = imgMat[i + 1];
        let blue = imgMat[i + 2];
        let alpha = (3 * red + 4 * green + blue) >>> 3;
        imgMat[i] = imgMat[i + 1] = imgMat[i + 2] = alpha;
    }

    imgData.data = imgMat;
};


// Reference: https://developpaper.com/image-processing-with-convolution-kernel-in-html5-canvas/
const Convolution = (imgData, outputData, kernel) => {
    let width = imgData.width,
        height = imgData.height;
    let inpData = imgData.data,
        outpData = outputData.data;
    let px =4;          // 1 px = 4 [r g b alpha]
    let kernelSize =3;  // dimension of Laplapcian Kernel
    for (let j = 1; (height - 1)-j ; ++j) {
        for (let k = 1; (width - 1)-k ; ++k) {
            for (let c = 0; kernelSize-c ; ++c) {
                let i = (j * width + k) * px + c;
                                            //[-1   -1  -1]
                                            //[-1    8  -1]    Laplacian Kernel
                                            //[-1   -1  -1]
                outpData[i] =   kernel[8] * inpData[i + width * px + px] +  // Lower Right
                                kernel[7] * inpData[i + width * px] +       // Lower
                                kernel[6] * inpData[i + width * px - px] +  // Lower Left
                                kernel[5] * inpData[i + px] +               // Left
                                kernel[4] * inpData[i] +                    // Center of Mask
                                kernel[3] * inpData[i - px] +               // Right
                                kernel[2] * inpData[i - width * px + px] +  // Upper Right
                                kernel[1] * inpData[i - width * px] +       // Upper
                                kernel[0] * inpData[i - width * px - px];   // Upper Left
            }
            outpData[(j * width + k) * px + kernelSize] = 255;
        }
    }
};

const draw = (myVideo, context, backContext, canvasWidth, canvasHeight) => {
    if (myVideo.paused || myVideo.ended) {
        return false;
    }
    // Draw the video into the backing canvas
    backContext.drawImage(myVideo, 0, 0, canvasWidth, canvasHeight);

    // Grab the pixel data from the backing canvas
    let imgMat = backContext.getImageData(0, 0, canvasWidth, canvasHeight);

    // Convert RGB frame to Grayscale frame
    RGBtoGrayscale(imgMat);

    // Edge detector using Laplacian kernel and Convolution
    let outMat = context.createImageData(canvasWidth, canvasHeight);
    Convolution(imgMat, outMat, LaplacianKernel);

    // Draw the pixels onto the visible canvas
    context.putImageData(outMat, 0, 0);

    // Start over
    setTimeout(draw, 20, myVideo, context, backContext, canvasWidth, canvasHeight);
};

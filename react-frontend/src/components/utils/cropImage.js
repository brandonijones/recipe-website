export const createImage = (url) => 
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

export function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 100;
}

// Returns the new bounding area of a rotated rectangle
export function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation);

    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
    };
}

export default async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        return null;
    }

    const rotRad = getRadianAngle(rotation);

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // Set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to a central location to allow rotating 
    // and flipping around the center
    context.translate(bBoxWidth / 2, bBoxHeight / 2);
    context.rotate(rotRad);
    context.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    context.translate(-image.width / 2, -image.height / 2);

    // Draw rotated image
    context.drawImage(image, 0, 0);

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = context.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // Set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Paste generated rotate image at the top left corner
    context.putImageData(data, 0, 0);

    // As Base64 string
    // return canvas.toDataURL("image/png");

    // As a blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((file) => {
            file.name = "cropped.png"
            resolve({file: file, url: URL.createObjectURL(file)})
        }, "image/png")
    });
}
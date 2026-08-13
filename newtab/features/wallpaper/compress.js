export function compressImage(file, callback)
{
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
        const maxWidth = 1920;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        callback(base64);
        URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
}
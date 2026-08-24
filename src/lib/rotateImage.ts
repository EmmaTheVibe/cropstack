export function rotateImage90(image: HTMLImageElement): Promise<{ image: HTMLImageElement; imageUrl: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalHeight;
  canvas.height = image.naturalWidth;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.reject(new Error('Could not get 2D canvas context'));
  }
  ctx.translate(canvas.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('canvas.toBlob failed'));
        return;
      }
      const imageUrl = URL.createObjectURL(blob);
      const rotated = new Image();
      rotated.onload = () => resolve({ image: rotated, imageUrl });
      rotated.onerror = () => reject(new Error('Could not load rotated image'));
      rotated.src = imageUrl;
    }, 'image/png');
  });
}

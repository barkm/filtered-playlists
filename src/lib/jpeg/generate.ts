import { createCanvas } from 'canvas';

export const generateSingleColorJpeg = (width: number, height: number, color: string): string => {
	const canvas = createCanvas(width, height);
	const context = canvas.getContext('2d')!;
	context.fillStyle = color;
	context.fillRect(0, 0, width, height);
	return canvas.toDataURL('image/jpeg');
};

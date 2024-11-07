import { createCanvas } from 'canvas';

export const PALETTE = [
	'#FF9AA7',
	'#85D1B5',
	'#B980E3',
	'#79C2E6',
	'#FFD866',
	'#FFB384',
	'#D798CA',
	'#81CCE6',
	'#FF9D82',
	'#FFB3C8'
];

export const generateRandomJpegFromColors = (
	width: number,
	height: number,
	hex_colors: string[]
): string => {
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	const image_data = ctx.createImageData(width, height);
	const rgb_colors = hex_colors.map(hexToRgb);
	for (let i = 0; i < image_data.data.length; i += 4) {
		const [r, g, b] = rgb_colors[Math.floor(Math.random() * rgb_colors.length)];
		image_data.data[i] = r;
		image_data.data[i + 1] = g;
		image_data.data[i + 2] = b;
		image_data.data[i + 3] = 255;
	}
	ctx.putImageData(image_data, 0, 0);
	return canvas.toDataURL('image/jpeg');
};

const hexToRgb = (hex: string): [number, number, number] => {
	const bigint = parseInt(hex.slice(1), 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return [r, g, b];
};

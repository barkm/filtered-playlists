export async function fetchImageData(url: string): Promise<string> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}
	const blob = await response.blob();
	return dataUrlFromBlob(blob);
}

const dataUrlFromBlob = async (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (reader.result) {
				resolve(reader.result as string);
			} else {
				reject('Could not convert blob to data URL.');
			}
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

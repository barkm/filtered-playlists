export const ms_to_min_sec = (ms: number): string => {
	let total_seconds = ms / 1000;
	let minutes = Math.floor(total_seconds / 60);
	let seconds = Math.floor(total_seconds % 60);
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

<script lang="ts">
	import { onMount } from 'svelte';
	import { generateRandomJpegFromColors, PALETTE } from '$lib/jpeg/generate';

	interface Props {
		update_ms: number;
		palette?: string[];
		width?: number;
		height?: number;
	}

	let { update_ms, palette = PALETTE, width = 3, height = 3 }: Props = $props();

	const generate_image = () => {
		return generateRandomJpegFromColors(width, height, palette);
	};

	let image_data = $state(generate_image());

	onMount(() => {
		setInterval(() => {
			image_data = generate_image();
		}, update_ms);
	});
</script>

<img src={image_data} alt="random square" />

<style>
	img {
		width: var(--width);
		height: var(--height);
		max-width: var(--max-width);
		image-rendering: var(--image-rendering);
	}
</style>

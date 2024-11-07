<script lang="ts">
	import { onMount } from 'svelte';
	import { generateRandomJpegFromColors, PALETTE } from '$lib/jpeg/generate';

	interface Props {
		update_ms: number;
	}

	let { update_ms }: Props = $props();

	const generate_image = () => {
		return generateRandomJpegFromColors(3, 3, PALETTE);
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
	}
</style>

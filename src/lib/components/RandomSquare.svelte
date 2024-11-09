<script lang="ts">
	import { onMount } from 'svelte';
	import { fillFromColorPalette, PALETTE } from '$lib/jpeg/generate';

	interface Props {
		update_ms: number;
		palette?: string[];
		width?: number;
		height?: number;
		canvas?: HTMLCanvasElement;
	}

	let {
		update_ms,
		palette = PALETTE,
		width = 3,
		height = 3,
		canvas: canvas_element = $bindable()
	}: Props = $props();

	const fill_canvas = () => {
		if (canvas_element) {
			fillFromColorPalette(canvas_element, palette);
		}
	};

	onMount(() => {
		fill_canvas();
		setInterval(fill_canvas, update_ms);
	});
</script>

<canvas bind:this={canvas_element} {width} {height}></canvas>

<style>
	canvas {
		width: var(--width);
		height: var(--height);
		max-width: var(--max-width);
		image-rendering: var(--image-rendering);
	}
</style>

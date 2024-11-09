<script lang="ts">
	import { onMount } from 'svelte';
	import { fillFromColorPalette, PALETTE } from '$lib/jpeg/generate';

	interface Props {
		update_ms: number;
		palette?: string[];
		width?: number;
		height?: number;
	}

	let { update_ms, palette = PALETTE, width = 3, height = 3 }: Props = $props();

	let canvas_element: HTMLCanvasElement;

	onMount(() => {
		setInterval(() => {
			if (canvas_element) {
				fillFromColorPalette(canvas_element, palette);
			}
		}, update_ms);
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

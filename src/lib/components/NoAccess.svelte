<script>
	import { BW_PALETTE } from '$lib/jpeg/generate';
	import RandomSquare from './RandomSquare.svelte';
</script>

<container>
	<p>Sorry! You don't have access to this page!</p>
	<RandomSquare
		palette={BW_PALETTE}
		update_ms={1000}
		width={5}
		height={5}
		--image-rendering={'pixelated'}
		--width="5em"
		--max-width="300px"
	/>
</container>

<style>
	container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100vh;
		font-size: 1em;
	}
</style>

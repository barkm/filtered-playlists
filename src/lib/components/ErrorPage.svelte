<script lang="ts">
	import { BW_PALETTE } from '$lib/jpeg/generate';
	import RandomSquare from './RandomSquare.svelte';

	interface Props {
		error_message: string;
	}

	let { error_message }: Props = $props();
</script>

<container>
	<RandomSquare
		palette={BW_PALETTE}
		update_ms={1000}
		width={5}
		height={5}
		--image-rendering={'pixelated'}
		--width="5em"
		--max-width="300px"
	/>
	<p>{error_message}</p>
</container>

<style>
	container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 1em;
	}

	p {
		margin-top: 2em;
	}
</style>

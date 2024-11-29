<script lang="ts">
	import { BW_PALETTE } from '$lib/jpeg/generate';
	import { getScopes } from '$lib/spotify/authorization';
	import RandomSquare from './RandomSquare.svelte';

	let scopes = getScopes();
</script>

<no-playlists>
	<random-square>
		<RandomSquare
			palette={BW_PALETTE}
			update_ms={1000}
			width={5}
			height={5}
			--image-rendering={'pixelated'}
			--width="5em"
			--max-width="300px"
		/>
	</random-square>
	{#if scopes.includes('playlist-read-private') || scopes.includes('playlist-read-private')}
		<p>no playlists found</p>
	{:else}
		<p>no public playlists found</p>
	{/if}
</no-playlists>

<style>
	no-playlists {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 1em;
		flex-grow: 1;
	}

	random-square {
		margin-bottom: 1em;
	}
</style>

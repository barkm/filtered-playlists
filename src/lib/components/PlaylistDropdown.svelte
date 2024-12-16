<script lang="ts">
	import type { Playlist } from '$lib/spotify/api';
	import DropDown from './DropDown.svelte';

	interface Props {
		placeholder: string;
		playlists: Playlist[];
		selected_playlists: Playlist[];
	}

	let { placeholder, playlists, selected_playlists = $bindable() }: Props = $props();
</script>

<DropDown {placeholder} options={playlists} bind:selected={selected_playlists}>
	{#snippet option_snippet(playlist: Playlist)}
		<playlistoption>
			<img src={playlist.cover?.url} alt="cover" width="20px" />
			<div>
				{playlist.name}
			</div>
		</playlistoption>
	{/snippet}
</DropDown>

<style>
	playlistoption {
		display: flex;
		align-items: center;
		height: 1em;
		margin: 0.1em;
	}

	img {
		margin-right: 0.25em;
	}
</style>

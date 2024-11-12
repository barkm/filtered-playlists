<script lang="ts">
	import type { Playlist } from '$lib/spotify/api';
	import { authorizedRequest } from '$lib/spotify/authorization';
	import { filterTracks, getTracksFromPlaylists } from '$lib/synchronized';

	interface Props {
		included_playlists: Playlist[];
		excluded_playlists: Playlist[];
		required_playlists: Playlist[];
	}

	let {
		included_playlists = $bindable(),
		excluded_playlists = $bindable(),
		required_playlists = $bindable()
	}: Props = $props();

	let included_tracks = $derived(getTracksFromPlaylists(authorizedRequest, included_playlists));
	let excluded_tracks = $derived(getTracksFromPlaylists(authorizedRequest, excluded_playlists));
	let required_tracks = $derived(getTracksFromPlaylists(authorizedRequest, required_playlists));

	let tracks = $derived.by(async () => {
		let [included, excluded, required] = await Promise.all([
			included_tracks,
			excluded_tracks,
			required_tracks
		]);
		return filterTracks(included, excluded, required);
	});
</script>

<div>
	{#await tracks}
		<p>Loading...</p>
	{:then tracks}
		{#if included_playlists.length !== 0}
			{#if tracks.length === 0}
				<p>No tracks found</p>
			{:else}
				<p>{tracks.length} tracks found</p>
			{/if}
		{/if}
	{/await}
</div>

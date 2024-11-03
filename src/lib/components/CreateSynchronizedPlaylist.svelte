<script lang="ts">
	import { type Playlist } from '$lib/spotify/api';
	import {
		createSynchronizedPlaylist,
		filterTracks,
		getTracksFromPlaylists,
		type SynchronizedPlaylist
	} from '$lib/synchronized';
	import PlaylistDropdown from './PlaylistDropdown.svelte';

	interface Props {
		playlists: Playlist[];
		synchronized_playlists: SynchronizedPlaylist[];
	}

	let { playlists, synchronized_playlists = $bindable() }: Props = $props();

	let playlist_name = $state('');

	let included_playlists: Playlist[] = $state([]);
	let excluded_playlists: Playlist[] = $state([]);
	let required_playlists: Playlist[] = $state([]);

	let included_tracks = $derived(getTracksFromPlaylists(included_playlists));
	let excluded_tracks = $derived(getTracksFromPlaylists(excluded_playlists));
	let required_tracks = $derived(getTracksFromPlaylists(required_playlists));

	let tracks = $derived.by(async () => {
		const [included, excluded, required] = await Promise.all([
			included_tracks,
			excluded_tracks,
			required_tracks
		]);
		if (included.length === 0) {
			return null;
		}
		return filterTracks(included, excluded, required);
	});
</script>

<input type="text" bind:value={playlist_name} />
<button
	onclick={async () => {
		const synchronized_playlist = await createSynchronizedPlaylist(
			playlist_name,
			included_playlists,
			excluded_playlists,
			required_playlists
		);
		synchronized_playlists = [...synchronized_playlists, synchronized_playlist];
	}}>Create</button
>

<PlaylistDropdown {playlists} bind:selected_playlists={included_playlists} />
<PlaylistDropdown {playlists} bind:selected_playlists={excluded_playlists} />
<PlaylistDropdown {playlists} bind:selected_playlists={required_playlists} />
{#await tracks}
	<p>Loading tracks...</p>
{:then tracks}
	{#if tracks}
		<h2>Included tracks</h2>
		<ul>
			{#each tracks as track}
				<li>{track.name}</li>
			{/each}
		</ul>
	{/if}
{/await}

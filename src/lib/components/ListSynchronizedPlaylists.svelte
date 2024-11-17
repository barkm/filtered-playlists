<script lang="ts">
	import { unfollowPlaylist } from '$lib/spotify/api';
	import type { SynchronizedPlaylist } from '$lib/synchronized';
	import SynchronizedPlaylistRow from './SynchronizedPlaylistRow.svelte';

	interface Props {
		synchronized_playlists: SynchronizedPlaylist[];
	}

	let { synchronized_playlists = $bindable() }: Props = $props();
</script>

{#if synchronized_playlists.length}
	{#each synchronized_playlists as synchronized_playlist (synchronized_playlist.playlist.id)}
		<SynchronizedPlaylistRow
			{synchronized_playlist}
			onRemove={() => {
				unfollowPlaylist(synchronized_playlist.playlist.id);
				synchronized_playlists = synchronized_playlists.filter(
					(playlist: SynchronizedPlaylist) =>
						playlist.playlist.id !== synchronized_playlist.playlist.id
				);
			}}
		/>
	{/each}
{/if}

<script lang="ts">
	import { logged_in_guard } from '$lib/login';
	import { unfollowPlaylist, type Playlist } from '$lib/spotify/api';
	import type { SynchronizedPlaylist } from '$lib/synchronized';
	import SynchronizedPlaylistRow from './SynchronizedPlaylistRow.svelte';

	interface Props {
		playlists: Playlist[];
		synchronized_playlists: SynchronizedPlaylist[];
	}

	let { playlists, synchronized_playlists = $bindable() }: Props = $props();
</script>

{#if synchronized_playlists.length}
	{#each synchronized_playlists as synchronized_playlist, index (synchronized_playlist.playlist.id)}
		<SynchronizedPlaylistRow
			{playlists}
			bind:synchronized_playlist={synchronized_playlists[index]}
			onRemove={logged_in_guard(async () => {
				unfollowPlaylist(synchronized_playlist.playlist.id);
				synchronized_playlists = synchronized_playlists.filter(
					(playlist: SynchronizedPlaylist) =>
						playlist.playlist.id !== synchronized_playlist.playlist.id
				);
			})}
		/>
	{/each}
{/if}

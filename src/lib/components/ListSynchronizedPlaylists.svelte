<script lang="ts">
	import { unfollowPlaylist } from '$lib/spotify/api';
	import type { SynchronizedPlaylist } from '$lib/synchronized';
	import SynchronizedPlaylistRow from './SynchronizedPlaylistRow.svelte';

	interface Props {
		synchronized_playlists: SynchronizedPlaylist[];
	}

	let { synchronized_playlists }: Props = $props();
</script>

{#if synchronized_playlists.length}
	{#each synchronized_playlists as synchronized_playlist}
		<SynchronizedPlaylistRow
			{synchronized_playlist}
			onRemove={() => {
				unfollowPlaylist(synchronized_playlist.playlist.id);
				synchronized_playlists = synchronized_playlists.filter(
					(playlist) => playlist !== synchronized_playlist
				);
			}}
		/>
	{/each}
{/if}

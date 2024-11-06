<script lang="ts">
	import { unfollowPlaylist } from '$lib/spotify/api';
	import { synchronize, type SynchronizedPlaylist } from '$lib/synchronized';
	import SynchronizedPlaylistRow from './SynchronizedPlaylistRow.svelte';

	interface Props {
		synchronized_playlists: SynchronizedPlaylist[];
	}

	let { synchronized_playlists }: Props = $props();

	const synchronize_all = async () => {
		await Promise.all(synchronized_playlists.map(synchronize));
	};
</script>

{#if synchronized_playlists.length}
	<button onclick={synchronize_all}>synchronize all</button>
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

<script lang="ts">
	import { logged_in_guard } from '$lib/login';
	import { unfollowPlaylist, type Playlist } from '$lib/spotify/api';
	import type { FilteredPlaylist } from '$lib/filtered';
	import FilteredPlaylistRow from './FilteredPlaylistRow.svelte';

	interface Props {
		playlists: Playlist[];
		filtered_playlists: FilteredPlaylist[];
	}

	let { playlists, filtered_playlists = $bindable() }: Props = $props();
</script>

{#if filtered_playlists.length}
	{#each filtered_playlists as filtered_playlist, index (filtered_playlist.playlist.id)}
		<FilteredPlaylistRow
			{playlists}
			bind:filtered_playlist={filtered_playlists[index]}
			onRemove={logged_in_guard(async () => {
				unfollowPlaylist(filtered_playlist.playlist.id);
				filtered_playlists = filtered_playlists.filter(
					(playlist: FilteredPlaylist) => playlist.playlist.id !== filtered_playlist.playlist.id
				);
			})}
		/>
	{/each}
{/if}

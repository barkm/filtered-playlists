<script lang="ts">
	import { getPlaylists, type Playlist } from '$lib/spotify/api';
	import { onMount } from 'svelte';
	import FilteredPlaylists from './ListFilteredPlaylists.svelte';
	import CreateFilteredPlaylist from './CreateFilteredPlaylist.svelte';
	import {
		filterFilteredPlaylists as filterFilteredPlaylists,
		update,
		type FilteredPlaylist
	} from '$lib/filtered';
	import Loading from './Loading.svelte';
	import { RequestCacher } from '$lib/spotify/cache';
	import { authorizedRequest } from '$lib/spotify/authorization';
	import { logged_in_guard } from '$lib/login';
	import NoPlaylists from './NoPlaylists.svelte';

	let filtered_playlists: FilteredPlaylist[] | null = $state(null);
	let playlists: Playlist[] | null = $state(null);
	let disable_update = $state(false);

	onMount(
		logged_in_guard(async () => {
			playlists = await getPlaylists();
			const request_cacher = new RequestCacher(authorizedRequest);
			filtered_playlists = await filterFilteredPlaylists(request_cacher.makeRequest, playlists);
		})
	);

	const update_all = logged_in_guard(async () => {
		if (filtered_playlists !== null) {
			disable_update = true;
			const request_cacher = new RequestCacher(authorizedRequest);
			await Promise.all(filtered_playlists.map((p) => update(p, request_cacher.makeRequest)));
			disable_update = false;
		}
	});
</script>

{#if filtered_playlists === null || playlists === null}
	<Loading />
{:else if playlists.length === 0}
	<NoPlaylists />
{:else}
	{#if filtered_playlists.length !== 0}
		<button onclick={update_all} disabled={disable_update}>update all</button>
	{/if}
	<CreateFilteredPlaylist {playlists} bind:filtered_playlists />
	<FilteredPlaylists {playlists} bind:filtered_playlists />
{/if}

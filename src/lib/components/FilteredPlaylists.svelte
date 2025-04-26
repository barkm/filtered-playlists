<script lang="ts">
	import { getPlaylists, type Playlist } from '$lib/spotify/api';
	import { onMount } from 'svelte';
	import SynchronizedPlaylists from './ListFilteredPlaylists.svelte';
	import CreateSynchronizedPlaylist from './CreateSynchronizedPlaylist.svelte';
	import { filterSychronizedPlaylists, synchronize, type FilteredPlaylist } from '$lib/filtered';
	import Loading from './Loading.svelte';
	import { RequestCacher } from '$lib/spotify/cache';
	import { authorizedRequest } from '$lib/spotify/authorization';
	import { logged_in_guard } from '$lib/login';
	import NoPlaylists from './NoPlaylists.svelte';

	let filtered_playlists: FilteredPlaylist[] | null = $state(null);
	let playlists: Playlist[] | null = $state(null);
	let disable_synchronization = $state(false);

	onMount(
		logged_in_guard(async () => {
			playlists = await getPlaylists();
			const request_cacher = new RequestCacher(authorizedRequest);
			filtered_playlists = await filterSychronizedPlaylists(request_cacher.makeRequest, playlists);
		})
	);

	const synchronize_all = logged_in_guard(async () => {
		if (filtered_playlists !== null) {
			disable_synchronization = true;
			const request_cacher = new RequestCacher(authorizedRequest);
			await Promise.all(filtered_playlists.map((p) => synchronize(p, request_cacher.makeRequest)));
			disable_synchronization = false;
		}
	});
</script>

{#if filtered_playlists === null || playlists === null}
	<Loading />
{:else if playlists.length === 0}
	<NoPlaylists />
{:else}
	{#if filtered_playlists.length !== 0}
		<button onclick={synchronize_all} disabled={disable_synchronization}>synchronize all</button>
	{/if}
	<CreateSynchronizedPlaylist {playlists} bind:filtered_playlists />
	<SynchronizedPlaylists {playlists} bind:filtered_playlists />
{/if}

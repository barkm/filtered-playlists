<script lang="ts">
	import { getPlaylists, type Playlist } from '$lib/spotify/api';
	import { onMount } from 'svelte';
	import SynchronizedPlaylists from './ListSynchronizedPlaylists.svelte';
	import CreateSynchronizedPlaylist from './CreateSynchronizedPlaylist.svelte';
	import {
		filterSychronizedPlaylists,
		synchronize,
		type SynchronizedPlaylist
	} from '$lib/synchronized';
	import Loading from './Loading.svelte';
	import { RequestCacher } from '$lib/spotify/cache';

	let synchronized_playlists: SynchronizedPlaylist[] | null = $state(null);
	let playlists: Playlist[] | null = $state(null);

	onMount(async () => {
		playlists = await getPlaylists();
		const request_cacher = new RequestCacher();
		synchronized_playlists = await filterSychronizedPlaylists(
			request_cacher.makeAuthorizedRequest,
			playlists
		);
	});

	const synchronize_all = async () => {
		if (synchronized_playlists !== null) {
			const request_cacher = new RequestCacher();
			await Promise.all(
				synchronized_playlists.map((p) => synchronize(p, request_cacher.makeAuthorizedRequest))
			);
		}
	};
</script>

{#if synchronized_playlists === null || playlists === null}
	<Loading />
{:else}
	<button onclick={synchronize_all}>synchronize all</button>
	<CreateSynchronizedPlaylist {playlists} bind:synchronized_playlists />
	<SynchronizedPlaylists {synchronized_playlists} />
{/if}

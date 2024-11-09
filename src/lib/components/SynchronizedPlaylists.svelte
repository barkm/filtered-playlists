<script lang="ts">
	import { type Playlist } from '$lib/spotify/api';
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
		const cached_request = new RequestCacher();
		playlists = await cached_request.getPlaylists();
		synchronized_playlists = await filterSychronizedPlaylists(playlists);
	});

	const synchronize_all = async () => {
		if (synchronized_playlists !== null) {
			await Promise.all(synchronized_playlists.map(synchronize));
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

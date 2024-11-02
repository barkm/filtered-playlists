<script lang="ts">
	import { getPlaylists, getUser, type Playlist, type User } from '$lib/spotify/api';
	import { onMount } from 'svelte';
	import SynchronizedPlaylists from './ListSynchronizedPlaylists.svelte';
	import CreateSynchronizedPlaylist from './CreateSynchronizedPlaylist.svelte';
	import { getSynchronizedPlaylists, type SynchronizedPlaylist } from '$lib/synchronized';
	import { logout } from '$lib/spotify/authorization';
	import { is_logged_in } from '$lib/store';

	let user: User | null = $state(null);
	let synchronized_playlists: SynchronizedPlaylist[] | null = $state(null);
	let playlists: Playlist[] | null = $state(null);

	onMount(async () => {
		[user, synchronized_playlists];
		user = await getUser();
		synchronized_playlists = await getSynchronizedPlaylists();
		playlists = await getPlaylists();
	});

	const logoutAndReset = () => {
		logout();
		$is_logged_in = false;
	};
</script>

{#if user === null || synchronized_playlists === null || playlists === null}
	<p>Loading...</p>
{:else}
	<p>Hello, {user.display_name}!</p>
	<SynchronizedPlaylists {synchronized_playlists} />
	<CreateSynchronizedPlaylist {playlists} bind:synchronized_playlists />
	<button onclick={logoutAndReset}>Log out</button>
{/if}

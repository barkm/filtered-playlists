<script lang="ts">
	import { getPlaylists, getUser, type Playlist, type User } from '$lib/spotify/api';
	import { onMount } from 'svelte';
	import SynchronizedPlaylists from './ListSynchronizedPlaylists.svelte';
	import CreateSynchronizedPlaylist from './CreateSynchronizedPlaylist.svelte';
	import { getSynchronizedPlaylists, type SynchronizedPlaylist } from '$lib/synchronized';
	import { logout } from '$lib/spotify/authorization';
	import { is_logged_in } from '$lib/store';
	import Loading from './Loading.svelte';

	let user: User | null = $state(null);
	let synchronized_playlists: SynchronizedPlaylist[] | null = $state(null);
	let playlists: Playlist[] | null = $state(null);

	onMount(async () => {
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
	<Loading />
{:else}
	<div class="container">
		<div class="content">
			<SynchronizedPlaylists {synchronized_playlists} />
			<CreateSynchronizedPlaylist {playlists} bind:synchronized_playlists />
		</div>
		<div class="footer">
			<button onclick={logoutAndReset}>log out</button>
			<div>signed in as {user.display_name}</div>
		</div>
	</div>
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 95vh;
		padding: 2.5vh;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 75%;
		min-width: 300px;
		max-width: 500px;
		flex-grow: 1;
	}

	.footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.footer div {
		margin-top: 0.5em;
		font-size: 0.8em;
	}
</style>

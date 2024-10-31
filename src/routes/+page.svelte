<script lang="ts">
	import PlaylistDropdown from '$lib/components/PlaylistDropdown.svelte';
	import { getPlaylists, getTracks, getUser, isLoggedIn, type Playlist } from '$lib/spotify/api';
	import { login, logout } from '$lib/spotify/authorization';
	import {
		createSynchronizedPlaylist,
		filterTracks,
		getSynchronizedPlaylists,
		synchronize
	} from '$lib/synchronized';
	import { onMount } from 'svelte';

	let is_logged_in: boolean | null = $state(null);

	let user = $derived.by(() => (is_logged_in ? getUser() : null));
	let playlists = $derived.by(() => (is_logged_in ? getPlaylists() : null));
	let synchronized_playlists = $derived.by(() =>
		is_logged_in ? getSynchronizedPlaylists() : null
	);

	let playlist_name = '';
	let included_playlists: Playlist[] = $state([]);
	let excluded_playlists: Playlist[] = $state([]);
	let required_playlists: Playlist[] = $state([]);
	let included_tracks = $derived(
		Promise.all(included_playlists.map((playlist) => getTracks(playlist.id))).then((ts) =>
			ts.flat()
		)
	);
	let excluded_tracks = $derived(
		Promise.all(excluded_playlists.map((playlist) => getTracks(playlist.id))).then((ts) =>
			ts.flat()
		)
	);
	let required_tracks = $derived(
		Promise.all(required_playlists.map((playlist) => getTracks(playlist.id))).then((ts) =>
			ts.flat()
		)
	);

	let tracks = $derived.by(async () => {
		const [included, excluded, required] = await Promise.all([
			included_tracks,
			excluded_tracks,
			required_tracks
		]);
		if (included.length === 0 && excluded.length === 0 && required.length === 0) {
			return null;
		}
		return filterTracks(included, excluded, required);
	});

	onMount(async () => {
		is_logged_in = await isLoggedIn();
	});

	const logoutAndReset = () => {
		logout();
		is_logged_in = false;
	};
</script>

{#if is_logged_in === null}
	<p>Loading...</p>
{:else if is_logged_in}
	<button onclick={logoutAndReset}>Log out</button>
	{#if user}
		{#await user}
			<p>Loading user data...</p>
		{:then user}
			<p>Welcome, {user.display_name}!</p>
		{/await}
	{/if}

	<h2>Your synchronized playlists</h2>
	{#if synchronized_playlists}
		{#await synchronized_playlists}
			<p>Loading synchronized playlists...</p>
		{:then synchronized_playlists}
			<ul>
				{#each synchronized_playlists as playlist}
					<li>
						{playlist.playlist.name}
						<button onclick={() => synchronize(playlist)}>sync</button>
					</li>
					<ul>
						{#each playlist.included_playlists as included_playlist}
							<li>Included: {included_playlist.name}</li>
						{/each}
						{#each playlist.excluded_playlists as excluded_playlist}
							<li>Excluded: {excluded_playlist.name}</li>
						{/each}
						{#each playlist.required_playlists as required_playlist}
							<li>Required: {required_playlist.name}</li>
						{/each}
					</ul>
				{/each}
			</ul>
		{/await}
	{/if}

	<h2>Create a new playlist</h2>
	<input type="text" bind:value={playlist_name} />
	<button
		onclick={() => {
			createSynchronizedPlaylist(
				playlist_name,
				included_playlists,
				excluded_playlists,
				required_playlists
			);
		}}>Create</button
	>

	{#if playlists}
		{#await playlists}
			<p>Loading playlists...</p>
		{:then playlists}
			<PlaylistDropdown {playlists} bind:selected_playlists={included_playlists} />
			<PlaylistDropdown {playlists} bind:selected_playlists={excluded_playlists} />
			<PlaylistDropdown {playlists} bind:selected_playlists={required_playlists} />
			{#await tracks}
				<p>Loading tracks...</p>
			{:then tracks}
				{#if tracks}
					<h2>Included tracks</h2>
					<ul>
						{#each tracks as track}
							<li>{track.name}</li>
						{/each}
					</ul>
				{/if}
			{/await}
		{/await}
	{/if}
{:else}
	<button onclick={login}>Log in</button>
	<p>You are not logged in.</p>
{/if}

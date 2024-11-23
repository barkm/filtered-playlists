<script lang="ts">
	import { type Playlist } from '$lib/spotify/api';
	import { createSynchronizedPlaylist, type SynchronizedPlaylist } from '$lib/synchronized';
	import { onMount } from 'svelte';
	import PlaylistDropdown from './PlaylistDropdown.svelte';
	import PlaylistPrivacy from './PlaylistPrivacy.svelte';
	import RandomSquare from './RandomSquare.svelte';
	import { authorizedRequest, getScopes } from '$lib/spotify/authorization';
	import DurationFilter from './DurationFilter.svelte';
	import { logged_in_guard } from '$lib/login';

	interface Props {
		playlists: Playlist[];
		synchronized_playlists: SynchronizedPlaylist[];
	}

	let { playlists, synchronized_playlists = $bindable() }: Props = $props();

	let playlist_name = $state('');

	let scopes = getScopes();
	let is_public = $state(!scopes.includes('playlist-modify-private'));
	let enable_privacy_selection =
		scopes.includes('playlist-modify-private') && scopes.includes('playlist-modify-public');
	let included_playlists: Playlist[] = $state([]);
	let excluded_playlists: Playlist[] = $state([]);
	let required_playlists: Playlist[] = $state([]);

	let canvas: HTMLCanvasElement | undefined = $state(undefined);

	let placeholder = $state('');
	const text = 'new playlist name';
	let index = 0;

	function type() {
		if (index < text.length) {
			placeholder += text[index];
			index++;
			setTimeout(type, Math.floor(Math.random() * 10 + 100));
		} else {
			setTimeout(reset, 2000);
		}
	}

	function reset() {
		placeholder = '';
		index = 0;
		setTimeout(type, 1000);
	}

	onMount(() => {
		type();
	});

	let creating = $state(false);
	let duration_limits = $state({ min: 0, max: Infinity });
</script>

<inputrow>
	<cover>
		<RandomSquare update_ms={1000} --height="100%" bind:canvas />
	</cover>
	<input type="text" bind:value={playlist_name} {placeholder} />
	<button
		disabled={creating || playlist_name === '' || included_playlists.length === 0}
		onclick={logged_in_guard(async () => {
			if (!canvas) {
				console.log('no canvas');
				return;
			}
			creating = true;
			const synchronized_playlist = await createSynchronizedPlaylist(
				authorizedRequest,
				canvas.toDataURL('image/jpeg'),
				playlist_name,
				included_playlists,
				excluded_playlists,
				required_playlists,
				is_public,
				duration_limits
			);
			synchronized_playlists = [synchronized_playlist, ...synchronized_playlists];
			playlist_name = '';
			included_playlists = [];
			excluded_playlists = [];
			required_playlists = [];
			creating = false;
		})}>create</button
	>
</inputrow>

{#if playlist_name !== ''}
	<filters>
		{#if enable_privacy_selection}
			<PlaylistPrivacy bind:is_public />
		{/if}
		<PlaylistDropdown
			placeholder="include"
			{playlists}
			bind:selected_playlists={included_playlists}
		/>
		<PlaylistDropdown
			placeholder="exclude"
			{playlists}
			bind:selected_playlists={excluded_playlists}
		/>
		<PlaylistDropdown
			placeholder="require"
			{playlists}
			bind:selected_playlists={required_playlists}
		/>
	</filters>

	<DurationFilter
		{included_playlists}
		{excluded_playlists}
		{required_playlists}
		bind:duration_limits
	/>
{/if}

<style>
	inputrow {
		height: 2.5em;
		display: flex;
		flex-direction: row;
		margin-top: 1em;
		padding: 0.5em;
		width: 100%;
	}

	cover {
		margin-right: 0.5em;
		height: 100%;
	}

	input {
		align-self: center;
		flex-grow: 1;
		border: none;
		border-bottom: 1px solid black;
		outline: none;
		font-size: 1em;
		border-radius: 0;
		min-width: 0;
	}

	button {
		margin-left: 1em;
		align-self: center;
		flex-basis: auto;
	}

	filters {
		margin-top: 1em;
		width: 100%;
	}
</style>

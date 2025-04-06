<script lang="ts">
	import { type Artist, type Playlist } from '$lib/spotify/api';
	import PlaylistDropdown from './PlaylistDropdown.svelte';
	import PlaylistPrivacy from './PlaylistPrivacy.svelte';
	import { getScopes } from '$lib/spotify/authorization';
	import TracksFilter from './TracksFilter.svelte';

	interface Props {
		playlists: Playlist[];
		included_playlists: Playlist[];
		excluded_playlists: Playlist[];
		required_playlists: Playlist[];
		is_public: boolean;
		duration_limits: { min: number; max: number };
		release_year_limits: { min: number; max: number };
		required_artists: Artist[];
	}

	let {
		playlists,
		included_playlists = $bindable(),
		excluded_playlists = $bindable(),
		required_playlists = $bindable(),
		is_public = $bindable(),
		duration_limits = $bindable(),
		release_year_limits = $bindable(),
		required_artists = $bindable()
	}: Props = $props();

	let scopes = getScopes();
	let enable_privacy_selection =
		scopes.includes('playlist-modify-private') && scopes.includes('playlist-modify-public');
</script>

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

<TracksFilter
	{included_playlists}
	{excluded_playlists}
	{required_playlists}
	bind:duration_limits
	bind:release_year_limits
	bind:required_artists
/>

<style>
	filters {
		margin-top: 1em;
		width: 100%;
	}
</style>

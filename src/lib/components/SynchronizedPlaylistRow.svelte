<script lang="ts">
	import type { Playlist } from '$lib/spotify/api';
	import { authorizedRequest } from '$lib/spotify/authorization';
	import { synchronize, type SynchronizedPlaylist } from '$lib/synchronized';
	import RandomSquare from './RandomSquare.svelte';

	interface Props {
		synchronized_playlist: SynchronizedPlaylist;
		onRemove: () => void;
	}
	import { ms_to_min_sec, type DurationLimits } from '$lib/duration';
	import { logged_in_guard } from '$lib/login';

	let { synchronized_playlist, onRemove }: Props = $props();

	const concat_playlist_names = (playlists: Playlist[]) => {
		return playlists.map((playlist) => playlist.name).join(', ');
	};

	const included_playlist_names = concat_playlist_names(synchronized_playlist.included_playlists);
	const excluded_playlist_names = concat_playlist_names(synchronized_playlist.excluded_playlists);
	const required_playlist_names = concat_playlist_names(synchronized_playlist.required_playlists);

	const get_duration_limit_str = (duration_limits: DurationLimits) => {
		if (duration_limits.min === 0 && duration_limits.max === Infinity) {
			return '';
		}
		const min = ms_to_min_sec(duration_limits.min);
		const max = duration_limits.max === Infinity ? '+inf' : ms_to_min_sec(duration_limits.max);
		return `durations: ${min} - ${max}`;
	};

	const get_release_year_limit_str = (release_year_limits: DurationLimits) => {
		if (release_year_limits.min === -Infinity && release_year_limits.max === Infinity) {
			return '';
		}
		const min = release_year_limits.min === -Infinity ? '-inf' : release_year_limits.min;
		const max = release_year_limits.max === Infinity ? '+inf' : release_year_limits.max;
		return `release years: ${min} - ${max}`;
	};

	const duration_limits = get_duration_limit_str(synchronized_playlist.duration_limits);
	const release_year_limits = get_release_year_limit_str(synchronized_playlist.release_year_limits);

	let show_details = $state(false);
</script>

<container>
	<main>
		<a href={synchronized_playlist.playlist.spotify_url} target="_blank">
			{#if synchronized_playlist.synchronizing}
				<RandomSquare update_ms={200} --height="100%" />
			{:else}
				<img src={synchronized_playlist.playlist.cover?.url} alt="cover" />
			{/if}
		</a>
		<button class="playlistname" onclick={() => (show_details = !show_details)}>
			{synchronized_playlist.playlist.name}
		</button>
		<button
			class="click"
			disabled={synchronized_playlist.synchronizing}
			onclick={logged_in_guard(() => synchronize(synchronized_playlist, authorizedRequest))}
			>sync</button
		>
		<button class="click" disabled={synchronized_playlist.synchronizing} onclick={onRemove}
			>x</button
		>
	</main>

	{#if show_details}
		<playlistdetails>
			{#if included_playlist_names !== ''}
				<div>
					included: {included_playlist_names}
				</div>
			{/if}
			{#if excluded_playlist_names !== ''}
				<div>
					excluded: {excluded_playlist_names}
				</div>
			{/if}
			{#if required_playlist_names !== ''}
				<div>
					required: {required_playlist_names}
				</div>
			{/if}
			{#if duration_limits !== ''}
				<div>
					{duration_limits}
				</div>
			{/if}
			{#if release_year_limits !== ''}
				<div>
					{release_year_limits}
				</div>
			{/if}
		</playlistdetails>
	{/if}
</container>

<style>
	container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		margin-left: 5px;
		margin-right: 5px;
	}

	main {
		height: 2.5em;
		display: flex;
		flex-direction: row;
		border: 1px solid black;
		margin-top: 1em;
		padding: 0.5em;
		width: 100%;
	}

	a {
		align-self: center;
		height: 100%;
		flex-basis: auto;
		aspect-ratio: 1;
	}

	img {
		align-self: center;
		height: 100%;
	}

	.click {
		margin-left: 0.5em;
		align-self: center;
		font-size: 1em;
	}

	.playlistname {
		margin: 0;
		flex-grow: 1;
		align-self: center;
		background-color: transparent;
		border: none;
		text-align: left;
		font-size: 1em;
		color: black;
		padding: 0.5em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	playlistdetails {
		display: flex;
		flex-direction: column;
		border-left: 1px solid black;
		border-right: 1px solid black;
		border-bottom: 1px solid black;
		margin-bottom: 5px;
		padding: 0.5em;
		max-width: 500px;
		width: 100%;
	}
</style>

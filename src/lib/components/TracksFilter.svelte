<script lang="ts">
	import { type Artist, type Playlist, type Track } from '$lib/spotify/api';
	import { authorizedRequest } from '$lib/spotify/authorization';
	import { filterTracks, getTracksFromPlaylists } from '$lib/synchronized';
	import RangeSlider from 'svelte-range-slider-pips';
	import { ms_to_min_sec, type Limits } from '$lib/duration';
	import { logged_in_guard } from '$lib/login';
	import ArtistsDropDown from './ArtistsDropDown.svelte';

	interface Props {
		included_playlists: Playlist[];
		excluded_playlists: Playlist[];
		required_playlists: Playlist[];
		duration_limits: Limits;
		release_year_limits: Limits;
		required_artists: Artist[];
	}

	let {
		included_playlists,
		excluded_playlists,
		required_playlists,
		duration_limits = $bindable(),
		release_year_limits = $bindable(),
		required_artists = $bindable()
	}: Props = $props();

	let included_tracks = $derived(
		logged_in_guard(getTracksFromPlaylists)(authorizedRequest, included_playlists)
	);
	let excluded_tracks = $derived(
		logged_in_guard(getTracksFromPlaylists)(authorizedRequest, excluded_playlists)
	);
	let required_tracks = $derived(
		logged_in_guard(getTracksFromPlaylists)(authorizedRequest, required_playlists)
	);

	const get_tracks = async (
		limits: Limits,
		release_year_limits: Limits,
		required_artists: Artist[]
	) => {
		let [included, excluded, required] = await Promise.all([
			included_tracks,
			excluded_tracks,
			required_tracks
		]);
		if (included === undefined || excluded === undefined || required === undefined) {
			return [];
		}
		return filterTracks(
			included,
			excluded,
			required,
			limits,
			release_year_limits,
			required_artists
		);
	};

	let all_tracks = $derived.by(async () =>
		get_tracks({ min: 0, max: Infinity }, { min: -Infinity, max: Infinity }, [])
	);

	let init_duration_limits = $derived.by(async () => {
		let tracks_resolved = await all_tracks;
		if (tracks_resolved.length === 0) {
			return {
				min: 0,
				max: 0
			};
		}
		let durations = tracks_resolved.map((t) => t.duration_ms);
		let min_duration = Math.round(Math.min(...durations));
		let max_duration = Math.round(Math.max(...durations));
		return {
			min: min_duration,
			max: max_duration
		};
	});

	let init_release_year_limits = $derived.by(async () => {
		let tracks_resolved = await all_tracks;
		if (tracks_resolved.length === 0) {
			return {
				min: 0,
				max: 0
			};
		}
		let release_years = tracks_resolved.map((t) => t.album.release_year);
		let min_release_year = Math.min(...release_years);
		let max_release_year = Math.max(...release_years);
		return {
			min: min_release_year,
			max: max_release_year
		};
	});

	let all_artists = $derived.by(async () => {
		let tracks_resolved = await all_tracks;
		if (tracks_resolved.length === 0) {
			return [];
		}
		let all_artists = tracks_resolved.map((t) => t.artists).flat();
		let unique_artist_ids = new Set();
		let unique_artists: Artist[] = [];
		for (let artist of all_artists) {
			if (!unique_artist_ids.has(artist.id)) {
				unique_artist_ids.add(artist.id);
				unique_artists.push(artist);
			}
		}
		return unique_artists.sort((a, b) => a.name.localeCompare(b.name));
	});

	let filtered_tracks: Track[] | undefined = $state(undefined);

	$effect(() => {
		get_tracks({ min: 0, max: Infinity }, { min: -Infinity, max: Infinity }, []).then((t) => {
			filtered_tracks = t;
		});
	});
</script>

<container>
	{#if included_playlists.length !== 0}
		{#await Promise.all([all_artists, init_duration_limits, init_release_year_limits])}
			<p>Loading...</p>
		{:then [all_artists, init_duration_limits, init_release_year_limits]}
			<artists>
				<ArtistsDropDown
					artists={all_artists}
					bind:selected_artists={required_artists}
					on_change={() => {
						get_tracks(duration_limits, release_year_limits, required_artists).then((t) => {
							filtered_tracks = t;
						});
					}}
				/>
			</artists>
			duration
			<range-slider>
				<RangeSlider
					id="always"
					float
					range
					hoverable={false}
					formatter={(ms) => {
						if (ms === init_duration_limits.min) {
							return '00:00';
						}
						if (ms === init_duration_limits.max) {
							return '+inf&nbsp;';
						}
						return ms_to_min_sec(ms);
					}}
					min={init_duration_limits.min}
					max={init_duration_limits.max}
					values={[init_duration_limits.min, init_duration_limits.max]}
					springValues={{ stiffness: 1, damping: 1 }}
					on:change={(e) => {
						const new_values = e.detail.values;
						duration_limits = {
							min: new_values[0] === init_duration_limits.min ? 0 : new_values[0],
							max: new_values[1] === init_duration_limits.max ? Infinity : new_values[1]
						};
						get_tracks(duration_limits, release_year_limits, required_artists).then((t) => {
							filtered_tracks = t;
						});
					}}
				/>
			</range-slider>
			release year
			<range-slider>
				<RangeSlider
					id="always"
					float
					range
					hoverable={false}
					formatter={(year) => {
						if (year === init_release_year_limits.min) {
							return '-inf';
						}
						if (year === init_release_year_limits.max) {
							return '+inf';
						}
						return year.toString();
					}}
					min={init_release_year_limits.min}
					max={init_release_year_limits.max}
					values={[release_year_limits.min, release_year_limits.max]}
					springValues={{ stiffness: 1, damping: 1 }}
					on:change={(e) => {
						const new_values = e.detail.values;
						release_year_limits = {
							min: new_values[0] === init_release_year_limits.min ? -Infinity : new_values[0],
							max: new_values[1] === init_release_year_limits.max ? Infinity : new_values[1]
						};
						get_tracks(duration_limits, release_year_limits, required_artists).then((t) => {
							filtered_tracks = t;
						});
					}}
				/>
			</range-slider>
			<filtered-tracks>
				{#if filtered_tracks !== undefined}
					{#if filtered_tracks.length === 0}
						<p>No tracks</p>
					{:else}
						<p>{filtered_tracks.length} tracks found</p>
					{/if}
				{/if}
			</filtered-tracks>
		{/await}
	{/if}
</container>

<style>
	container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	artists {
		width: 100%;
	}

	range-slider {
		width: 60%;
		margin-top: 0.5em;
		margin-bottom: 1em;
	}

	:global(#always.rangeSlider) {
		border-radius: 0%;
		height: 0.25em;
	}

	:global(#always .rangeBar) {
		height: 0.25em;
	}

	:global(#always.rangeSlider .rangeHandle .rangeNub) {
		width: 3em;
		border-radius: 0%;
		padding: 0.5em;
		transform: translate(-1.5em, -0.55em);
		background-color: #ffffff;
		border: 1px solid #000000;
	}

	:global(#always .rangeFloat) {
		opacity: 1;
		transition: none;
		background: transparent;
		top: 50%;
		transform: translate(-2em, -50%);
		color: #000000;
		font-size: 1em;
	}

	:global(:root) {
		--range-slider: #d7dada; /* slider main background color */
		--range-handle-inactive: #000000; /* inactive handle color */
		--range-handle: #ffffff; /* non-focussed handle color */
		--range-handle-focus: #000000; /* focussed handle color */
	}

	filtered-tracks {
		margin-top: 2em;
	}
</style>

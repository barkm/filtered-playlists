<script lang="ts">
	import { type Playlist, type Track } from '$lib/spotify/api';
	import { authorizedRequest } from '$lib/spotify/authorization';
	import { filterTracks, getTracksFromPlaylists } from '$lib/synchronized';
	import RangeSlider from 'svelte-range-slider-pips';

	interface Props {
		included_playlists: Playlist[];
		excluded_playlists: Playlist[];
		required_playlists: Playlist[];
		duration_limits?: { min: number; max: number };
	}
	import { ms_to_min_sec } from '$lib/duration';

	let {
		included_playlists,
		excluded_playlists,
		required_playlists,
		duration_limits = $bindable()
	}: Props = $props();

	let included_tracks = $derived(getTracksFromPlaylists(authorizedRequest, included_playlists));
	let excluded_tracks = $derived(getTracksFromPlaylists(authorizedRequest, excluded_playlists));
	let required_tracks = $derived(getTracksFromPlaylists(authorizedRequest, required_playlists));

	let tracks = $derived.by(async () => {
		let [included, excluded, required] = await Promise.all([
			included_tracks,
			excluded_tracks,
			required_tracks
		]);
		return filterTracks(included, excluded, required);
	});

	let durations = $derived.by(async () => {
		let tracks_resolved = await tracks;
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
</script>

<container>
	{#await Promise.all([tracks, durations])}
		<p>Loading...</p>
	{:then [tracks, durations]}
		{#if included_playlists.length !== 0}
			{#if tracks.length === 0}
				<p>No tracks found</p>
			{:else}
				duration
				<range-slider>
					<RangeSlider
						id="always"
						float
						range
						hoverable={false}
						formatter={(ms) => {
							if (duration_limits === undefined) {
								if (ms === durations.min) {
									return '-inf';
								}
								if (ms === durations.max) {
									return '+inf';
								}
							}
							return ms_to_min_sec(ms);
						}}
						min={durations.min}
						max={durations.max}
						values={[durations.min, durations.max]}
						springValues={{ stiffness: 1, damping: 1 }}
						on:change={(e) => {
							const new_values = e.detail.values;
							if (new_values[0] === durations.min && new_values[1] === durations.max) {
								duration_limits = undefined;
								return;
							}
							duration_limits = {
								min: e.detail.values[0],
								max: e.detail.values[1]
							};
						}}
					/>
				</range-slider>
			{/if}
		{/if}
	{/await}
</container>

<style>
	container {
		width: 60%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2em;
	}

	range-slider {
		width: 100%;
		margin-top: 0.5em;
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
		transform: translate(-1.65em, -50%);
		color: #000000;
		font-size: 1em;
	}

	:global(:root) {
		--range-slider: #d7dada; /* slider main background color */
		--range-handle-inactive: #000000; /* inactive handle color */
		--range-handle: #ffffff; /* non-focussed handle color */
		--range-handle-focus: #000000; /* focussed handle color */
	}
</style>

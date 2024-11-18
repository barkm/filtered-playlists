<script lang="ts">
	import { type Playlist, type Track } from '$lib/spotify/api';
	import { authorizedRequest } from '$lib/spotify/authorization';
	import { filterTracks, getTracksFromPlaylists } from '$lib/synchronized';
	import RangeSlider from 'svelte-range-slider-pips';
	import { ms_to_min_sec, type DurationLimits } from '$lib/duration';

	interface Props {
		included_playlists: Playlist[];
		excluded_playlists: Playlist[];
		required_playlists: Playlist[];
		duration_limits: DurationLimits;
	}

	let {
		included_playlists,
		excluded_playlists,
		required_playlists,
		duration_limits = $bindable()
	}: Props = $props();

	let included_tracks = $derived(getTracksFromPlaylists(authorizedRequest, included_playlists));
	let excluded_tracks = $derived(getTracksFromPlaylists(authorizedRequest, excluded_playlists));
	let required_tracks = $derived(getTracksFromPlaylists(authorizedRequest, required_playlists));

	const get_tracks = async (limits: DurationLimits) => {
		let [included, excluded, required] = await Promise.all([
			included_tracks,
			excluded_tracks,
			required_tracks
		]);
		return filterTracks(included, excluded, required, limits);
	};

	let tracks = $derived.by(async () => get_tracks({ min: 0, max: Infinity }));

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

	let filtered_tracks: Track[] | undefined = $state(undefined);

	$effect(() => {
		get_tracks({ min: 0, max: Infinity }).then((t) => {
			filtered_tracks = t;
		});
	});
</script>

<container>
	{#await durations}
		<p>Loading...</p>
	{:then durations}
		{#if included_playlists.length !== 0}
			duration
			<range-slider>
				<RangeSlider
					id="always"
					float
					range
					hoverable={false}
					formatter={(ms) => {
						if (ms === durations.min) {
							return '00:00';
						}
						if (ms === durations.max) {
							return '&nbsp;inf&nbsp;';
						}
						return ms_to_min_sec(ms);
					}}
					min={durations.min}
					max={durations.max}
					values={[durations.min, durations.max]}
					springValues={{ stiffness: 1, damping: 1 }}
					on:change={(e) => {
						const new_values = e.detail.values;
						duration_limits = {
							min: new_values[0] === durations.min ? 0 : new_values[0],
							max: new_values[1] === durations.max ? Infinity : new_values[1]
						};
						get_tracks(duration_limits).then((t) => {
							filtered_tracks = t;
						});
					}}
				/>
			</range-slider>
		{/if}
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
</container>

<style>
	container {
		width: 60%;
		display: flex;
		flex-direction: column;
		align-items: center;
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

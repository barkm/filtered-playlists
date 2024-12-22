<script lang="ts">
	import { getArtists, type Artist } from '$lib/spotify/api';
	import { authorizedRequest } from '$lib/spotify/authorization';
	import { RequestCacher } from '$lib/spotify/cache';
	import DropDown from './DropDown.svelte';

	interface Props {
		artists: Artist[];
		selected_artists: Artist[];
	}

	let { artists, selected_artists = $bindable() }: Props = $props();
	let request_cacher = new RequestCacher(authorizedRequest);

	const artists_with_cover = $derived.by(async () => {
		const artist_ids = artists.map((artist) => artist.id);
		return await getArtists(artist_ids, request_cacher.makeRequest);
	});
</script>

{#await artists_with_cover}
	<p>loading...</p>
{:then artists_with_cover}
	<DropDown placeholder="artists" options={artists_with_cover} bind:selected={selected_artists}>
		{#snippet option_snippet(artist: Artist)}
			<artist-option>
				<img src={artist.cover_url} alt="cover" width="20px" />
				<div>
					{artist.name}
				</div>
			</artist-option>
		{/snippet}
	</DropDown>
{/await}

<style>
	artist-option {
		display: flex;
		align-items: center;
		height: 1em;
		margin: 0.1em;
	}

	img {
		margin-right: 0.25em;
	}
</style>

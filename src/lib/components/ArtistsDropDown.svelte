<script lang="ts">
	import type { Artist } from '$lib/spotify/api';
	import DropDown from './DropDown.svelte';

	interface Props {
		artists: Artist[];
		selected_artists: Artist[];
	}

	let { artists, selected_artists = $bindable() }: Props = $props();
</script>

<DropDown placeholder="artists" options={artists} bind:selected={selected_artists}>
	{#snippet option_snippet(artist: Artist)}
		{artist.name}
	{/snippet}
</DropDown>

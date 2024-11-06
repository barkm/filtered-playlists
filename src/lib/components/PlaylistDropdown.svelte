<script lang="ts">
	import type { Playlist } from '$lib/spotify/api';
	import { onMount } from 'svelte';
	import { MultiSelect } from 'svelte-multiselect';

	interface Props {
		placeholder: string;
		playlists: Playlist[];
		selected_playlists: Playlist[];
	}

	let { placeholder, playlists, selected_playlists = $bindable() }: Props = $props();

	const to_options = (ps: Playlist[]) => {
		return ps.map((playlist) => ({
			label: playlist.name,
			value: playlist
		}));
	};

	let options: { label: string; value: Playlist }[] = $state(to_options(playlists));
	let selected: { label: string; value: Playlist }[] = $state(to_options(selected_playlists));

	$effect(() => {
		options = to_options(playlists);
		selected = to_options(selected_playlists);
	});
</script>

<MultiSelect
	{placeholder}
	{options}
	bind:selected
	let:option
	on:change={() => {
		selected_playlists = selected.map((s) => s.value);
	}}
	on:removeAll={() => {
		selected_playlists = [];
		selected = [];
	}}
>
	<playlistoption>
		<img src={option.value.cover_url} alt="cover" width="20px" />
		<div>
			{option.value.name}
		</div>
	</playlistoption>
</MultiSelect>

<style>
	playlistoption {
		display: flex;
		align-items: center;
		height: 1em;
		margin: 0.1em;
	}

	img {
		margin-right: 0.25em;
	}
</style>

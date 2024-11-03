<script lang="ts">
	import type { Playlist } from '$lib/spotify/api';
	import { MultiSelect } from 'svelte-multiselect';

	interface Props {
		playlists: Playlist[];
		selected_playlists: Playlist[];
	}

	let { playlists, selected_playlists = $bindable() }: Props = $props();

	let selected: { label: string; value: Playlist }[] = $state([]);

	let options = playlists.map((playlist) => ({
		label: playlist.name,
		value: playlist
	}));
</script>

<MultiSelect
	{options}
	bind:selected
	let:option
	on:change={() => {
		selected_playlists = selected.map((s) => s.value);
	}}
>
	<img src={option.value.cover_url} alt="cover" width="20px" />
	{option.value.name}
</MultiSelect>

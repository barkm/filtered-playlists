<script lang="ts">
	import type { Playlist } from '$lib/spotify/api';
	import { MultiSelect, type ObjectOption } from 'svelte-multiselect';
	export let playlists: Playlist[];
	export let selected_playlists: Playlist[];

	let selected: ObjectOption[];

	let options: ObjectOption[] = playlists.map((playlist) => ({
		label: playlist.name,
		value: playlist
	}));
</script>

<MultiSelect
	{options}
	bind:selected
	on:change={() => {
		selected_playlists = selected.map((s: ObjectOption) => {
			return s.value as Playlist;
		});
	}}
/>

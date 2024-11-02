<script lang="ts">
	import { synchronize, type SynchronizedPlaylist } from '$lib/synchronized';

	interface Props {
		synchronized_playlists: SynchronizedPlaylist[];
	}

	let { synchronized_playlists }: Props = $props();
</script>

<ul>
	{#each synchronized_playlists as playlist}
		<li>
			{playlist.playlist.name}
			<button onclick={() => synchronize(playlist)}>sync</button>
		</li>
		<ul>
			{#each playlist.included_playlists as included_playlist}
				<li>Included: {included_playlist.name}</li>
			{/each}
			{#each playlist.excluded_playlists as excluded_playlist}
				<li>Excluded: {excluded_playlist.name}</li>
			{/each}
			{#each playlist.required_playlists as required_playlist}
				<li>Required: {required_playlist.name}</li>
			{/each}
		</ul>
	{/each}
</ul>

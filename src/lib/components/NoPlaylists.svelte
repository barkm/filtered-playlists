<script lang="ts">
	import { getScopes } from '$lib/spotify/authorization';
	import ErrorPage from './ErrorPage.svelte';

	let scopes = getScopes();
</script>

<container>
	{#if scopes.includes('playlist-read-private') || scopes.includes('playlist-read-private')}
		<ErrorPage error_message={'no playlists found'} />
	{:else}
		<ErrorPage error_message={'no public playlists found'} />
	{/if}
</container>

<style>
	container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex-grow: 1;
	}
</style>

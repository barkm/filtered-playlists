<script lang="ts">
	import { login } from '$lib/spotify/authorization';
	import { onMount } from 'svelte';
	import Main from './Main.svelte';
	import { is_logged_in } from '$lib/store';
	import { isLoggedIn } from '$lib/spotify/api';

	onMount(async () => {
		$is_logged_in = await isLoggedIn();
	});
</script>

{#if $is_logged_in === null}
	<p>Loading...</p>
{:else if $is_logged_in}
	<Main />
{:else}
	<p>You are not logged in.</p>
	<button onclick={login}>Log in</button>
{/if}

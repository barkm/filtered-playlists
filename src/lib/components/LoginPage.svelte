<script lang="ts">
	import { login } from '$lib/spotify/authorization';
	import { onMount } from 'svelte';
	import Main from './Main.svelte';
	import { is_logged_in } from '$lib/store';
	import { isLoggedIn } from '$lib/spotify/api';
	import Loading from './Loading.svelte';

	onMount(async () => {
		$is_logged_in = await isLoggedIn();
	});
</script>

<page>
	{#if $is_logged_in === null}
		<Loading />
	{:else if $is_logged_in}
		<Main />
	{:else}
		<login>
			<button onclick={login}>log in</button>
		</login>
	{/if}
</page>

<style>
	login {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	login button {
		background-color: transparent;
		border: 1px solid #000000;
		border-radius: 0;
		padding: 0.5em 1em;
		width: 30%;
		max-width: 100px;
		font-size: 1em;
	}

	login button:hover {
		background-color: black;
		color: white;
	}
</style>

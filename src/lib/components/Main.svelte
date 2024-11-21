<script lang="ts">
	import { getUser, NoAccessError, type User } from '$lib/spotify/api';
	import { onMount } from 'svelte';
	import SynchronizedPlaylists from './SynchronizedPlaylists.svelte';
	import NoAccess from './NoAccess.svelte';

	interface Props {
		logout: () => void;
	}

	let { logout }: Props = $props();

	let has_access = $state(true);
	let user: User | null = $state(null);

	onMount(async () => {
		try {
			user = await getUser();
		} catch (error) {
			if (error instanceof NoAccessError) {
				has_access = false;
			} else {
				throw error;
			}
		}
	});
</script>

<div class="container">
	<div class="content">
		{#if !has_access}
			<NoAccess />
		{:else if user !== null}
			<SynchronizedPlaylists />
		{/if}
	</div>
	<div class="footer">
		<button onclick={logout}>log out</button>
		{#if user !== null}
			<div>signed in as {user.display_name}</div>
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 95vh;
		padding: 2.5vh;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 75%;
		min-width: 300px;
		max-width: 500px;
		flex-grow: 1;
		margin-bottom: 1em;
	}

	.footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.footer div {
		margin-top: 0.5em;
		font-size: 0.8em;
	}
</style>

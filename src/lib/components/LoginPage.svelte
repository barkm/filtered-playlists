<script lang="ts">
	import { login } from '$lib/spotify/authorization';
	import { onMount } from 'svelte';
	import Main from './Main.svelte';
	import { is_logged_in } from '$lib/store';
	import { isLoggedIn } from '$lib/spotify/authorization';
	import PermissionsSelector from './MultiSelector.svelte';

	const default_scopes = ['ugc-image-upload'];

	let permissions = $state([
		{
			scope: 'playlist-modify-public',
			label_data: 'public playlists - create & edit',
			value: false
		},
		{
			scope: 'playlist-read-private',
			label_data: 'private playlists - list & read',
			value: false
		},
		{
			scope: 'playlist-modify-private',
			label_data: 'private playlists - create & edit',
			value: false
		}
	]);

	let scopes = $derived(
		default_scopes.concat(...permissions.filter((p) => p.value).map((p) => p.scope))
	);

	let login_enabled = $derived(scopes.filter((p) => p.includes('modify')).length > 0);

	onMount(async () => {
		$is_logged_in = await isLoggedIn();
	});
</script>

{#snippet label(data: string)}
	{data}
{/snippet}

<page>
	{#if $is_logged_in}
		<Main />
	{:else}
		<login>
			<p>allow access to</p>
			<PermissionsSelector {label} bind:selections={permissions}></PermissionsSelector>
			<login-button>
				<button onclick={() => login(scopes)} disabled={!login_enabled}>
					<login-text> log in </login-text>
				</button>
			</login-button>
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

	login-button {
		margin-top: 1em;
	}

	login-text {
		font-size: 1em;
		margin: 5em;
	}
</style>

<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	interface Props {
		label: Snippet<[T]>;
		selections: { label_data: T; value: boolean }[];
	}
	let { label, selections = $bindable() }: Props = $props();
</script>

<choices>
	{#each selections as { label_data, value }, i}
		<choice>
			<button
				aria-label={'choice'}
				onclick={() => (selections[i].value = !value)}
				style="background-color:{value ? 'black' : 'transparent'}"><div></div></button
			>
			{@render label(label_data)}
		</choice>
	{/each}
</choices>

<style>
	choices {
		display: flex;
		justify-content: center;
		flex-direction: column;
	}

	choice {
		display: flex;
		align-items: center;
		margin-left: 1em;
		margin-right: 1em;
		margin-bottom: 1em;
	}

	button {
		border-radius: 0;
		border: 1px solid black;
		margin-right: 10px;
		padding: 0;
		width: 1em;
		height: 1em;
	}
</style>

<script lang="ts">
	interface Props {
		is_public: boolean;
	}
	let { is_public = $bindable(true) }: Props = $props();

	const toggle_is_public = () => {
		is_public = !is_public;
	};
</script>

<choices>
	<choice>
		<button aria-label="public" onclick={toggle_is_public}
			><div style="background-color:{is_public ? 'black' : 'transparent'}"></div></button
		>
		<span>public</span>
	</choice>
	<choice>
		<button aria-label="public" onclick={toggle_is_public}
			><div style="background-color:{is_public ? 'transparent' : 'black'}"></div></button
		>
		<span>private</span>
	</choice>
</choices>

<style>
	choices {
		display: flex;
		justify-content: center;
	}

	choice {
		display: flex;
		align-items: center;
		margin-left: 1em;
		margin-right: 1em;
	}

	button {
		border-radius: 0;
		border: 1px solid black;
		margin-right: 10px;
		padding: 0;
	}

	button div {
		width: 1em;
		height: 1em;
	}
</style>

<script lang="ts">
	import RandomSquare from './RandomSquare.svelte';
</script>

<container>
	<RandomSquare update_ms={200} --width="30%" --max-width="300px" />
</container>

<style>
	container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100vh;
	}
</style>

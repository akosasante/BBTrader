<template>
	<div id="app" v-bind:class="$route.name">
		<div class="header-title title">{{ title }}</div>
		<hr>
		<router-view></router-view>
	</div>
</template>

<script>
	export default {
    name: 'app',
		data() {
			return {
				title: this.$route.name === 'tradeSubmit' ? 
				'Submit a new trade' : this.$route.name === 'tradeConfirm' ?
				'Confirm a submitted trade' : 'Finalize the trade below'
				}
			}
		}
</script>

<style>
	html {
		background: #fafafa;
	}
	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	#app.tradeSubmit {
		border-top: 0.7rem solid #ff3860;
	}
	#app.tradeConfirm {
		border-top: 0.7rem solid #bb3899;
	}
	#app.tradeSend {
		border-top: 0.7rem solid #aa3860;
	}
	#app .header-title {
		padding-left: 2rem;
		padding-top: 1rem;
		font-size: 2.5rem;
	}
</style>
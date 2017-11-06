<template>
<div>
{{ threePlayers ? "3 Player Trade" : "2 Player Trade" }}
  <b-switch v-model="threePlayers" @input="updateNumPlayers"></b-switch>
</div>
</template>

<script>
export default {
  name: 'player-switch',
  data() {
    return {
      threePlayers: false
      }
  },
  methods: {
    updateNumPlayers(val) {
      this.$emit('num-players-changed', !val ? 2 : 3);
    }
  }

}
</script>

<style>

</style>

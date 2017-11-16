<template>
<div>
  <b-field>
    <b-radio-button type="is-primary" v-model="numTeams" native-value="2" @input="updateNumPlayers"><span>2-Team Trade</span></b-radio-button>
    <b-radio-button type="is-primary" v-model="numTeams" native-value="3" @input="updateNumPlayers"><span>3-Team Trade</span></b-radio-button>
  </b-field>
</div>
</template>

<script>
export default {
  name: 'player-switch',
  data() {
    return {
      numTeams: "2"
      }
  },
  methods: {
    updateNumPlayers(val) {
      this.$emit('num-players-changed', Number(this.numTeams));
    }
  }

}
</script>

<style>

</style>

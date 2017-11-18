<template>
<div class="trade-submit">
  <div class="trade-submit__container">
    Select number of participants in this trade:
    <player-switch @num-players-changed="updateNumPlayers"></player-switch>
    <div class="trade-submit__dropdowns">
      <player-select :playerNo="0" :players="availPlayers" @selected-player="updatePlayer"></player-select>
      <player-select :playerNo="1" :players="availPlayers" @selected-player="updatePlayer"></player-select>
      <player-select :playerNo="2" :players="availPlayers" v-if="numPlayers !==2" @selected-player="updatePlayer"></player-select>
    </div>
    <div class="trade-submit__trade-preview" v-if="selectedPlayers.length > 1">
      <player-trade :num-players="numPlayers" :all-players="allPlayers" :all-traders="selectedPlayers" :player="selectedPlayers[0]"></player-trade>
      <player-trade :num-players="numPlayers" :all-players="allPlayers" :all-traders="selectedPlayers" :player="selectedPlayers[1]"></player-trade>
      <player-trade :num-players="numPlayers" :all-players="allPlayers" :all-traders="selectedPlayers" :player="selectedPlayers[2]" v-if="selectedPlayers[2]"></player-trade>
      <div class="button-container">
        <b-tooltip class="tooltip__trade-submit" animated multilined position="is-bottom" label="This will send the above trade information to the selected users">
          <button v-show="!loading" v-bind:class="{ 'is-success': successLoading, 'is-dark' : !loadingComplete, 'is-danger': errorLoading}" class="button btn__trade-submit" @click="submitTrade" :disabled="successLoading">
            <span style="margin-right: 0.5rem;">Submit Trade</span>
            <i v-show="successLoading" class="mdi mdi-check"></i>
            <i v-show="errorLoading" class="mdi mdi-alert"></i>
          </button>
        </b-tooltip>
        <sync-loader class="spinner" :loading="loading" :color="spinnerColor" :size="spinnerSize"></sync-loader>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import PlayerSwitch from './PlayerSwitch.vue'
import PlayerSelect from './PlayerSelect.vue'
import PlayerTrade from './PlayerTrade.vue'
import TradeStore from '../stores/TradeStore'
import PlayersStore from '../stores/PlayersStore'
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'

export default {
  name: 'trade-submit',
  components: {PlayerSwitch, PlayerSelect, PlayerTrade, SyncLoader},
  data() {
    return {
      numPlayers: 2,
      selectedPlayers: [],
      allPlayers: PlayersStore.members,
      savedData: TradeStore.data,
      loading: false,
      spinnerColor: '#7957d5',
      spinnerSize: '10px',
      loadingComplete: false,
      errorLoading: false,
      successLoading: false
    }
  },
  methods: {
    updateNumPlayers(number) {
      this.numPlayers = number
    },
    updatePlayer(selectedPlayer, playerNo) {
      this.selectedPlayers[playerNo] = selectedPlayer;
      this.selectedPlayers= this.selectedPlayers.slice();
    },
    submitTrade() {
      // console.log(TradeStore.data)
      this.loading = true;
      this.$http.post(`/mailer/tradeRequest`, [TradeStore.data, this.selectedPlayers])
        .then(resp => {
          this.$snackbar.open({
            message: "Trade has been requested and emails sent to the other participants!",
            type: "is-light",
            position: "is-top-right"
          });
          this.loading = false;
          this.loadingComplete = true;
          this.successLoading = true;
          console.log(resp);
        })
        .catch(err => {
          this.$snackbar.open({
            message: "Something went wrong. Please try again, or contact your commissioner.",
            type: "is-warning",
            position: "is-top-right"
          });
          this.loading = false;
          this.loadingComplete = true;
          this.errorLoading = true;
          console.error(err);
        });
    }
  },
  computed: {
    availPlayers: function() {
      return this.allPlayers.filter(player => {
        return this.selectedPlayers.every(selPlayer => selPlayer.name !== player.name);
      });
    }
  }
}
</script>

<style>
.trade-submit {
  display: flex;
  margin-left: 3rem;
  font-size: 1.2rem;
}

.trade-submit__container {
  width: 90vw;
}

.trade-submit__dropdowns {
  display: flex;
  justify-content: space-evenly;
  max-width: 80vw;
}

.trade-submit__trade-preview {
  display: flex;
  flex-direction: column;
  max-width: 100vw;
}

.btn__trade-submit {
  margin-top: 5rem;
}

.button-container {
  padding-left: 50%;
}

.spinner {
  margin-top: 5%;
  margin-left: 5%;
}

.is-success {
  background-color: green !important;
}

.tooltip__trade-submit {
  justify-content: center;
}

@media (max-width: 960px) {
  .trade-submit__dropdowns {
  flex-direction: column;
  min-height: 10rem;
  }
}
</style>

<template>
<div class="trade-send">
  <div class="trade-send__box box" v-for="trade in trades">
    <h2 class="header"><strong>{{trade.sender.name}}</strong> will send:</h2>
    <hr>
    <p><strong>Players:</strong>
    <p v-if="trade.players" v-for="player in trade.players">{{player.player}} <em>to </em> {{player.rec.name}}</p>
    </p>
    <p><strong>Prospects:</strong>
    <p v-if="trade.prospects" v-for="prospect in trade.prospects">{{prospect.prospect}} <em>to </em> {{prospect.rec.name}}</em></p>
    </p>
    <p><strong>Picks:</strong>
    <p v-if="trade.picks" v-for="pick in trade.picks"><em>Round </em>{{pick.round}}, {{pick.pick}}'s pick <em>to </em> {{pick.rec.name}}</p>
    </p>
  </div>
  <div class="button-container">
    <b-tooltip class="tooltip__trade" animated multilined position="is-bottom" label="This will send the final trade info to the #announcements Slack channel.">
      <button v-show="!loading" v-bind:class="{ 'is-success': successLoading, 'is-dark' : !loadingComplete, 'is-danger': errorLoading}" class="trade-send__button button btn__trade-submit" @click="sendToSlack" :disabled="successLoading">
        <span>I Agree</span>
        <i v-show="successLoading" class="mdi mdi-check"></i>
        <i v-show="errorLoading" class="mdi mdi-alert"></i>
      </button>
    </b-tooltip>
    <sync-loader class="submit-spinner spinner" :loading="loading" :color="spinnerColor" :size="spinnerSize"></sync-loader>
  </div>
</div>
</template>

<script>
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'

const example = [{"_id":"59ff80267b1e4835f36984a2","sender":"cam","__v":0,"picks":[],"prospects":[],"players":[{"player":"fsfdsfs","rec":"mike","_id":"59ff80267b1e4835f36984a4"},{"player":"fsdfsf","rec":"john","_id":"59ff80267b1e4835f36984a3"}]},{"_id":"59ff80267b1e4835f36984a5","sender":"mike","__v":0,"picks":[],"prospects":[{"prospect":"sdfdsfdf","rec":"cam","_id":"59ff80267b1e4835f36984a6"}],"players":[{"player":"sfdsfs","rec":"john","_id":"59ff80267b1e4835f36984a7"}]},{"_id":"59ff80267b1e4835f36984a8","sender":"john","__v":0,"picks":[{"pick":"john","round":17,"rec":"cam","_id":"59ff80267b1e4835f36984a9"}],"prospects":[],"players":[{"player":"sfdsfs","rec":"mike","_id":"59ff80267b1e4835f36984aa"}]}];

async function fetchTrade(tradeIds) {
  try {
    const resp = await this.$http.post(`/models/getTrade`, tradeIds);
    // console.log(resp);
    return resp.data.response;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export default {
  name: 'trade-send',
  components: {SyncLoader},
  data() {
    return {
      trades: example,
      loadingComplete: false,
      errorLoading: false,
      successLoading: false,
      spinnerColor: '#7957d5',
      spinnerSize: '10px',
      loading: false
    };
  },
  created() {
    const promisedTrades = fetchTrade.bind(this, this.$route.query);
        promisedTrades().then((result) => {
          if(result) {
            this.trades = result;
          }
        });
  },
  methods: {
    sendToSlack() {
      this.loading = true;
      this.$http.post(`/tradebot/postTrade`, {trades: this.trades, sender: this.$route.params.sender})
        .then(resp => {
          console.log(resp);
          this.$snackbar.open({
            message: "Trade has been sent to the announcements channel in slack!",
            type: "is-light",
            position: "is-top-right"
          });
          this.loading = false;
          this.loadingComplete = true;
          this.successLoading = true;
          return resp.data.response;
        })
        .catch(err => {
          this.$snackbar.open({
            message: "Something went wrong. Please refresh the page and try again, or contact your commissioner.",
            type: "is-warning",
            position: "is-top-right"
          });
          this.loading = false;
          this.loadingComplete = true;
          this.errorLoading = true;
          console.log(err);
          return null;
        });
    }
  }
}
</script>

<style>
.trade-send__button {
  margin-left: 50%;
}
.trade-send__box {
  margin-left: 10%;
  width: 80%;
}

.button-container {
  padding-left: 50%;
}

.spinner {
  margin-top: 5%;
  margin-left: 5%;
}

.tooltip__trade {
  justify-content: center;
}

</style>

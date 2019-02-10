<template>
<div class="trade-confirm section">
  <div class="trade-confirm__box box" v-for="trade in trades">
    <h2 class="header"><strong>{{trade.sender.name}}</strong> will send:</h2>
    <hr>
    <h3 style="margin-bottom: 0.5rem;"><strong>Players:</strong></h3>
    <p v-if="trade.players && trade.players.length">
      <span v-for="player in trade.players">{{player.player}} <em>to </em> {{player.rec.name}} <br></span>
    </p>
    <p v-else>None</p>
    <h3 style="margin-bottom: 0.5rem; margin-top:0.75rem;"><strong>Prospects:</strong></h3>
    <p v-if="trade.prospects && trade.prospects.length">
      <span v-for="prospect in trade.prospects">{{prospect.prospect}} <em>to </em> {{prospect.rec.name}} <br></span>
    </p>
    <p v-else>None</p>
    <h3 style="margin-bottom: 0.5rem; margin-top:0.75rem;"><strong>Picks:</strong></h3>
    <div v-if="trade.picks && trade.picks.length">
      <p v-if="picksByType[trade._id].major && picksByType[trade._id].major.length">
        <span><strong>Major League Picks:</strong> <br></span>
        <span class="tab-left" v-for="pick in picksByType[trade._id].major"><em>Round </em>{{pick.round}}, {{pick.pick}}'s pick <em>to </em> {{pick.rec.name}} <br></span>
      </p>
      <p v-if="picksByType[trade._id].high && picksByType[trade._id].high.length">
        <span><strong>High Minor Picks:</strong> <br></span>
        <span class="tab-left" v-for="pick in picksByType[trade._id].high"><em>Round </em>{{pick.round}}, {{pick.pick}}'s pick <em>to </em> {{pick.rec.name}} <br></span>
      </p>
      <p v-if="picksByType[trade._id].low && picksByType[trade._id].low.length">
        <span><strong>Low Minor Picks:</strong> <br></span>
        <span class="tab-left" v-for="pick in picksByType[trade._id].low"><em>Round </em>{{pick.round}}, {{pick.pick}}'s pick <em>to </em> {{pick.rec.name}} <br></span>
      </p>
    </div>
    <p v-else>None</p>
  </div>
  <div class="button-container">
    <b-tooltip class="tooltip__trade-submit" animated multilined position="is-bottom" label="This will let tradebot know you accept this trade and notify the owner who requested this trade.">
      <button v-show="!loading" v-bind:class="{ 'is-success': successLoading, 'is-dark' : !loadingComplete, 'is-danger': errorLoading || expired}" class="trade-confirm__button button btn__trade-submit" @click="confirmTrade" :disabled="successLoading || expired">
        <span>I Agree</span>
        <i v-show="successLoading" class="mdi mdi-check"></i>
        <i v-show="errorLoading" class="mdi mdi-alert"></i>
      </button>
    </b-tooltip>
    <sync-loader class="submit-spinner spinner" :loading="loading" :color="spinnerColor" :size="spinnerSize"></sync-loader>
  </div>
  <div class="button-container">
    <b-tooltip class="tooltip__trade-submit" animated multilined position="is-bottom" label="This will let tradebot know you decline this trade and notify the owner who requested this trade.">
      <button v-show="!loadingDecline" v-bind:class="{ 'is-success': successDeclining, 'is-warning' : !declineComplete, 'is-danger': errorDeclining || expired}" class="trade-confirm__button button btn__trade-submit" @click="declineTrade" :disabled="successDeclining || expired">
        <span>Decline Trade</span>
        <i v-show="successDeclining" class="mdi mdi-check"></i>
        <i v-show="errorDeclining" class="mdi mdi-alert"></i>
      </button>
      <b-field class="decline-input">
        <b-input v-model="declineReason" type="textarea" min-length="5" max-length="250" placeholder="Reason for declining trade (optional)"></b-input>
      </b-field>
      <sync-loader class="submit-spinner spinner" :loading="loadingDecline" :color="spinnerColor" :size="spinnerSize"></sync-loader>
    </b-tooltip>
  </div>
</div>
</template>

<script>
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'

const example = [
        {
          "_id":"59ff80267b1e4835f36984a2",
          "sender": {name: "cam"},
          "__v":0,
          "picks":[],
          "prospects":[],
          "players": [{"player":"fsfdsfs","rec": {name: "mike"},"_id":"59ff80267b1e4835f36984a4"},{"player":"fsdfsf","rec": {name: "john"},"_id":"59ff80267b1e4835f36984a3"}]
        },
        {
          "_id":"59ff80267b1e4835f36984a5",
          "sender":{name: "mike"},
          "__v":0,
          "picks":[],
          "prospects":[{"prospect":"sdfdsfdf","rec": {name: "cam"},"_id":"59ff80267b1e4835f36984a6"}],
          "players":[{"player":"sfdsfs","rec": {name: "john"},"_id":"59ff80267b1e4835f36984a7"}]
        },
        {
          "_id":"59ff80267b1e4835f36984a8",
          "sender": {name: "john"},
          "__v":0,
          "picks":[
                  {"type": "major", "pick":"john","round":17,"rec": {name: "cam"},"_id":"59ff80267b1e4835f36984a9"},
                  {"type": "high", "pick":"john","round":1,"rec": {name: "cam"},"_id":"59ff80267b1e4835f36984a9"},
                  {"type": "low", "pick":"john","round":5,"rec": {name: "cam"},"_id":"59ff80267b1e4835f36984a9"},
          ],
          "prospects":[],
          "players":[{"player":"sfdsfs","rec": {name: "mike"},"_id":"59ff80267b1e4835f36984aa"}]
        }
];


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
  name: 'trade-confirm',
  components: {SyncLoader},
  data() {
    return {
      trades: example,
      recipient: this.$route.params.recipient,
      loadingComplete: false,
      errorLoading: false,
      successLoading: false,
      declineComplete: false,
      successDeclining: false,
      errorDeclining: false,
      spinnerColor: '#7957d5',
      spinnerSize: '10px',
      loading: false,
      loadingDecline: false,
      expired: false,
      declineReason: null,
      roundTypes: [
        {key: "major", display: "Major League"},
        {key: "high", display: "High Minors"},
        {key: "low", display: "Low Minors"}
      ],
      picksByType: {},
    };
  },
  created() {
    const promisedTrades = fetchTrade.bind(this, this.$route.query);
    promisedTrades().then(result => {
      if(result) {
        this.trades = result;
        this.picksByType = this.getPicksByType(this.trades);
        return Promise.resolve(result);
      }
      this.picksByType = this.getPicksByType(this.trades);
    }).then(result => {
      this.$http.post(`/models/checkTradeValid`, {recip: this.recipient, trades: result})
        .then(resp => {
          console.log(resp);
        })
        .catch(err => {
          if (err) {
            let msg = err && err.response && err.response.data && err.response.data.error;
            if (msg && err.response.data.error.reason === "Expired") {
              msg = "This trade has expired, you cannot accept/decline it anymore";
              // msg = err.response.data.error.reason === "Expired" ?
              //         "This trade has expired, you cannot accept/decline it anymore" : "This trade was declined; it is no longer valid";
              this.expired = true;
            }
            return this.$snackbar.open({
              message: msg,
              type: "is-warning",
              position: "is-top-right"
            });
            console.log(err.response)
          }
        });
    });
  },
  methods: {
    confirmTrade() {
      this.loading = true;
      const confirmationData = { recip: this.recipient, trades: this.trades };
      this.$http.post(`/models/updateConfirmation`, confirmationData)
        .then(resp => {
          console.log(resp);
          this.$snackbar.open({
            message: "You have confirmed the details of this trade. Once all participants have done so, the original trade requester will submit the trade to slack.",
            type: "is-light",
            position: "is-top-right"
          });
          this.loading = false;
          this.loadingComplete = true;
          this.errorLoading = false;
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
          this.successLoading = false;
          console.log(err);
          return null;
        });
    },
    declineTrade() {
      this.loadingDecline = true;
      const declinationData = { recip: this.recipient, trades: this.trades, reason: this.declineReason };
      this.$http.post(`/models/declineTrade`, declinationData)
        .then(resp => {
          console.log(resp);
          this.$snackbar.open({
            message: "You have declined the details of this trade. All trade participants will be informed",
            type: "is-light",
            position: "is-top-right"
          });
          this.loadingDecline = false;
          this.declineComplete = true;
          this.errorDeclining = false;
          this.successDeclining = true;
          this.declineReason = null;
          return resp.data.response;
        })
        .catch(err => {
          this.$snackbar.open({
            message: "Something went wrong. Please refresh the page and try again, or contact your commissioner.",
            type: "is-warning",
            position: "is-top-right"
          });
          this.loadingDecline = false;
          this.declineComplete = true;
          this.errorDeclining = true;
          this.successDeclining = false;
          this.declineReason = null;
          console.log(err);
          return null;
        });
    },
    getPicksByType(trades) {
      const createPickObject = (picks) => picks.reduce((obj, pick) => {
        obj[pick.type] = (obj[pick.type] || []).concat(pick);
        return obj;
      }, {});
      const picks = trades.reduce((obj, trade) => {
        const id = trade["_id"];
        obj[id] = createPickObject(trade.picks);
        return obj;
      }, {});
      return picks;
    }
  }
};
</script>

<style>
/* .trade-confirm__button {
  margin-left: 50%;
} */
.trade-confirm__box {
  margin-left: 10%;
  width: 80%;
}

.button-container {
  display: inline-block;
  margin-left: 20%;
  margin-top: 5%;
}

.spinner {
  margin-top: 5%;
  margin-left: 5%;
}

.decline-input {
  margin-left: 1rem;
}

.tooltip__trade {
  justify-content: center;
}
.tab-left {
  padding-left: 1rem;
}
</style>

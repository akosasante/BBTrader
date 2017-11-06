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
  <button class="trade-send__button button is-dark btn__trade-submit" @click="sendToSlack">I Agree</button>
</div>
</template>

<script>
import axios from 'axios';
const example = [{"_id":"59ff80267b1e4835f36984a2","sender":"cam","__v":0,"picks":[],"prospects":[],"players":[{"player":"fsfdsfs","rec":"mike","_id":"59ff80267b1e4835f36984a4"},{"player":"fsdfsf","rec":"john","_id":"59ff80267b1e4835f36984a3"}]},{"_id":"59ff80267b1e4835f36984a5","sender":"mike","__v":0,"picks":[],"prospects":[{"prospect":"sdfdsfdf","rec":"cam","_id":"59ff80267b1e4835f36984a6"}],"players":[{"player":"sfdsfs","rec":"john","_id":"59ff80267b1e4835f36984a7"}]},{"_id":"59ff80267b1e4835f36984a8","sender":"john","__v":0,"picks":[{"pick":"john","round":17,"rec":"cam","_id":"59ff80267b1e4835f36984a9"}],"prospects":[],"players":[{"player":"sfdsfs","rec":"mike","_id":"59ff80267b1e4835f36984aa"}]}];

async function fetchTrade(tradeIds) {
  try {
    const resp = await axios.post("http://0.0.0.0:3000/models/getTrade", tradeIds);
    // console.log(resp);
    return resp.data.response;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export default {
  name: 'trade-send',
  data() {
    return {
      trades: example
    };
  },
  created() {
    const promisedTrades = fetchTrade(this.$route.query);
        promisedTrades.then((result) => {
          this.trades = result
          console.log(this.trades);
        });
  },
  methods: {
    sendToSlack() {
      axios.post("http://0.0.0.0:3000/tradebot/postTrade", {trades: this.trades, sender: this.$route.params.sender})
        .then(resp => {
          console.log(resp);
          this.$snackbar.open({
            message: "Trade has been sent to the announcements channel in slack!",
            type: "is-light",
            position: "is-top-right"
          });
          return resp.data.response;
        })
        .catch(err => {
          this.$snackbar.open({
            message: "Something went wrong. Please refresh the page and try again, or contact your commissioner.",
            type: "is-warning",
            position: "is-top-right"
          });
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
</style>

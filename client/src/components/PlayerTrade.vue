<template>
<div class="player-trade">
  <h2>{{player.name}} sends:</h2>
  <div class="trade-container box">
    <h1 class="heading">Players:</h1>
    <ul class="trade-container__players">
      <li v-for="player in players">{{player.player}} <strong><em>to</em></strong> {{player.rec.name}}</li>
    </ul>
    <h1 class="heading">Prospects:</h1>
    <ul class="trade-container__prospects">
      <li v-for="prospect in prospects">{{prospect.prospect}} <strong><em>to</em></strong> {{prospect.rec.name}}</li>
    </ul>
    <h1 class="heading">Picks:</h1>
    <ul class="trade-container__picks">
      <li v-for="pick in picks">Round {{pick.round}}, {{pick.pick}}'s pick <strong><em>to</em></strong> {{pick.rec.name}}</li>
    </ul>
  </div>
  <b-field class="trade-field__grouped" grouped group-multiline>
    <b-field class="trade-label" label="Enter Player">
      <b-input class="trade-input" v-model="inputtedPlayer" placeholder="Add a player"></b-input>
      <b-select v-if="numPlayers > 2" v-model="playerTo" placeholder="Select a recipient">
        <option v-for="trader in traders" :value="trader">
            {{ trader.name }}
        </option>
      </b-select>
      <p class="control">
        <button class="button is-primary" @click="addPlayer">Add Player</button>
      </p>
    </b-field>
    <b-field class="trade-label" label="Enter Prospect">
      <b-input class="trade-input" v-model="inputtedProspect" placeholder="Add a prospect"></b-input>
      <b-select v-if="numPlayers > 2" v-model="prospectTo" placeholder="Select a recipient">
        <option v-for="trader in traders" :value="trader">
            {{ trader.name }}
        </option>
      </b-select>
      <p class="control">
        <button class="button is-primary" @click="addProspect">Add Prospect</button>
      </p>
    </b-field>
    <b-field class="trade-label" label="Enter Pick">
      <b-input class="trade-input" v-model="inputtedPickRound" placeholder="Round" type="number" min="16" max="25"></b-input>
      <b-select v-model="inputtedPick" placeholder="Pick">
        <option v-for="player in allPlayers" :value="player">
            {{ player.name }}
        </option>
      </b-select>
      <b-select v-if="numPlayers > 2" v-model="pickTo" placeholder="Select a recipient">
        <option v-for="trader in traders" :value="trader">
            {{ trader.name }}
        </option>
      </b-select>
      <p class="control">
        <button class="button is-primary" @click="addPick">Add Pick</button>
      </p>
    </b-field>
  </b-field>
</div>
</template>

<script>
import TradeStore from '../stores/TradeStore'
import _ from 'lodash'

function updateSavedData(player, tradeType, tradeData) {
  let savedIndex = _.findIndex(TradeStore.data, ['sender', player._id.$oid]);
  //If sender hasn't been saved before, then add them
  if(savedIndex === -1) {
    TradeStore.data.push({sender: player._id.$oid});
  }
  savedIndex = _.findIndex(TradeStore.data, ['sender', player._id.$oid]);
  const trades = tradeData.map(trade => {
    const newTrade = _.clone(trade);
    newTrade.rec = trade.rec._id.$oid;
    return newTrade;
  });
  TradeStore.data[savedIndex][tradeType] = trades;
}

export default {
  name: "player-trade",
  props: ['player', 'all-traders', 'all-players', 'num-players'],
  data() {
    return {
      players: [],
      prospects: [],
      picks: [],
      inputtedPlayer: null,
      inputtedProspect: null,
      inputtedPick: null,
      inputtedPickRound: null,
      playerTo: null,
      prospectTo: null,
      pickTo: null
    }
  },
  methods: {
    addPlayer() {
      if(this.numPlayers === 2) {
        this.playerTo = this.traders[0];
      }
      if(this.inputtedPlayer && this.playerTo) {
        const player = this.playerTo;
        const trade = { player: this.inputtedPlayer, rec: player };
        
        console.log(trade);
        this.players.push(trade);
        updateSavedData(this.player, "players", this.players);        
      }
      this.inputtedPlayer = null;
      this.playerTo = null;
    },
    addProspect() {
      if(this.numPlayers === 2) {
        this.prospectTo = this.traders[0];
      }
      if(this.inputtedProspect && this.prospectTo) {
        const trade = { prospect: this.inputtedProspect, rec: this.prospectTo };
        this.prospects.push(trade);
        updateSavedData(this.player, "prospects", this.prospects);
      }
      this.inputtedProspect = null;
      this.prospectTo = null;
    },
    addPick() {
      if(this.numPlayers === 2) {
        this.pickTo = this.traders[0];
      }
      if(this.inputtedPick && this.pickTo && this.inputtedPickRound) {
        const trade = { pick: this.inputtedPick.name, round: this.inputtedPickRound, rec: this.pickTo };
        this.picks.push(trade);
        updateSavedData(this.player, "picks", this.picks);
      }
      this.inputtedPick = null;
      this.inputtedPickRound = null;
      this.pickTo = null;
    }
  },
  computed: {
    traders: function() {
      return this.allTraders.filter(thisPlayer => thisPlayer._id.$oid !== this.player._id.$oid);
    } 
  }
}
</script>

<style>
.player-trade {
  margin-top: 3rem;
}
.trade-container {
  min-height: 5rem;
  min-width: 35rem;
  /* border-radius: 1rem;
  border: 0.5rem solid rgba(240, 248, 255, 0.50);
  background: rgba(240, 248, 255, 0.50); */
  margin-bottom: 1rem;
}
.trade-label {
  margin-left: 0 !important;
  max-width: 85vw;
}

.trade-label label {
  margin-right: 1rem;
}

.trade-field__grouped {
  justify-content: space-between !important;
}
</style>

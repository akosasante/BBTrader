<template>
<div class="player-select">
  <div class="o-combobox">
    <p class="you-field"><strong>Participant #{{playerNo + 1}}</strong></p>
    <div v-if="playerNo > 0">
      <input class="o-combobox__input" type="search" v-bind:placeholder="placeholder" v-model="selectedPlayer" v-on:click="showAutocompleteDropdown = true" v-on:keyup.enter.prevent="select(selectedIndex)" v-on:keydown.down.prevent="selectNext()" v-on:keydown.up.prevent="selectPrev()" v-on:keyup.8="handleBackspace()" />
      <ul class="o-player-list" v-if="showAutocompleteDropdown">
        <li class="o-player-list__item" v-for="(player, $index) in filteredPlayers" v-on:click="select($index)" v-bind:class="{'o-player-list__item--selected': $index == selectedIndex}">{{ player.name }}</li>
      </ul>
    </div>
    <div v-if="playerNo == 0">
      <input class="o-combobox__input" v-bind:value="defaultPlayer.name" disabled />
    </div>
  </div>
</div>

</template>

<script>
import storageAvailable from 'storage-available'
import currUser from '../stores/CurrUserStore'

function getCurrUser() {
  if(storageAvailable('localStorage')) {
    return JSON.parse(window.localStorage.getItem('currUser'));
  } else {
    return JSON.parse(currUser.username);
  }
};

export default {
  name: 'player-select',
  props: ['players', 'playerNo'],
  data() {
    return {
      placeholder: "Select a player",
      player: '',
      showAutocompleteDropdown: false,
      selectedIndex: 0,
      selectedPlayer: '',
      selectedPlayerObject: {},
      defaultPlayer: getCurrUser()
    }
  },
  created() {
    if(this.playerNo === 0) {
      this.$emit('selected-player', this.defaultPlayer, this.playerNo);
    }
  },
  computed: {
    filteredPlayers: function() {
      return this.players.filter(player => player.name !== this.defaultPlayer.name).filter(player => player.name.toLowerCase().startsWith(this.selectedPlayer)).sort((playerA, playerB) => playerA.name.localeCompare(playerB.name))
    }
  },
  methods: {
    handleBackspace: function () {
        this.showAutocompleteDropdown = true;
    },
    select: function(index) {
      this.showAutocompleteDropdown = false;
      this.selectedPlayerObject = this.filteredPlayers[index];
      this.selectedPlayer = this.selectedPlayerObject.name
      this.$emit('selected-player', this.selectedPlayerObject, this.playerNo);
    },
    selectNext: function() {
      if (this.showAutocompleteDropdown) {
        if (this.selectedIndex < this.filteredPlayers.length - 1) {
        this.selectedIndex++;
      } else {
        this.selectedIndex = 0;
      }        
      } else {
        this.showAutocompleteDropdown = true;
      }

    },
    selectPrev: function() {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
      } else {
        this.selectedIndex = this.filteredPlayers.length - 1;
      }
    }
  }
}
</script>

<style>
.player-select {
  cursor: pointer;
}

.o-combobox__input {
  padding: 0.5rem;
  width: 100%;
  font-size: 15px;
  -webkit-appearance: none;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  text-align: left;
  background: white;
}

.o-combobox__input:focus {
  box-shadow: none;
  -webkit-appearance: none;
  outline: 0;
}

.o-player-list {

  margin-top: 0.5rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  max-height: 10rem;
}

.o-player-list__item {
  margin: 0;
  list-style-type: none;
  padding: 0.5rem;
  font-size: 14px;

  display: block;

  text-align: center;
  cursor: pointer;

}

.o-player-list__item:hover {
  opacity: 0.5;
}

.o-player-list__item--selected {
  background: rgba(0, 0, 0, 0.1);
}

.you-field {
  margin-right: 1rem;
}
</style>

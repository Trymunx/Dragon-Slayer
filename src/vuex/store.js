import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    messages: [],
    player: {},
    inputText: "",
    commandMode: "text",
    splash: true,
    world: null,
    creatures: {},
    displayOrigin: {},
    highlit: [],
  },

  getters: {
    playerName: state => state.player.name,
    messages: state => state.messages,
    instantMode: state => (state.commandMode === "instant" ? true : false),
    inputText: state => state.inputText,
    splash: state => state.splash,
    player: state => state.player,
    playerPos: state => state.player.pos,
    playerLevel: state => state.player.level,
    displayOrigin: state => state.displayOrigin,
    world: state => state.world,
    worldExists: state => state.world !== null,
    highlit: state => state.highlit,
    creatures: state => state.creatures,
    creaturesWithinRadius: state => (pos, radius = 10) => {
      if (!pos) {
        return state.creatures;
      }
      const creatures = new Map();
      for (let y = pos.y - radius; y < pos.y + radius; y++) {
        for (let x = pos.x - radius; x < pos.x + radius; x++) {
          if (state.creatures[[x, y]]) {
            creatures.set([x, y], state.creatures[[x, y]]);
          }
        }
      }
      return creatures;
    },
    creaturesAt: state => (x, y) => {
      return state.creatures[[x, y]];
    },
    surroundings: state => (radius = 2) => {
      let surr = {
        items: [],
        creatures: [],
      };

      function getDir(x, y) {
        let dir = [];
        if (y < 0) dir.push("north");
        else if (y > 0) dir.push("south");
        if (x < 0) dir.push("west");
        else if (x > 0) dir.push("east");
        if (!x && !y) dir.push("here");
        return dir.join(" ");
      }

      Object.keys(state.creatures).forEach(key => {
        let pos = key.split(",");
        let x = parseInt(pos[0]) - state.player.pos.x;
        let y = parseInt(pos[1]) - state.player.pos.y;

        if (Math.abs(x) <= radius && Math.abs(y) <= radius && state.creatures[key].length > 0) {
          state.creatures[key].forEach(creature => {
            creature.dir = getDir(x, y);
            creature.dist = Math.abs(x) + Math.abs(y);
            creature.loc = [x, y];
            surr.creatures.push(creature);
          });
        }
      });

      surr.creatures.sort((a, b) => {
        return a.dist - b.dist === 0 ? b.level - a.level : a.dist - b.dist;
      });

      let items = {
        total: 0,
        stacked: {},
      };
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          let tile = state.world.getTile(state.player.pos.x + x, state.player.pos.y + y);
          if (tile.items.length) {
            items.total += tile.items.length;
            tile.items.forEach(item => {
              if (items.stacked[item.name]) {
                items.stacked[item.name].count++;
                items.stacked[item.name].locations[
                  [state.player.pos.x + x, state.player.pos.y + y]
                ] = {};
                if (items.stacked[item.name].expanded[[x, y, item.name]]) {
                  items.stacked[item.name].expanded[[x, y, item.name]].count++;
                  items.stacked[item.name].expanded[[x, y, item.name]].totalValue += item.val;
                } else {
                  items.stacked[item.name].expanded[[x, y, item.name]] = {
                    name: item.name,
                    plural: item.plural,
                    count: 1,
                    totalValue: item.val,
                    dir: getDir(x, y),
                    loc: {
                      [[state.player.pos.x + x, state.player.pos.y + y]]: {},
                    },
                  };
                }
              } else {
                items.stacked[item.name] = {
                  name: item.name,
                  plural: item.plural,
                  count: 1,
                  locations: {
                    [[state.player.pos.x + x, state.player.pos.y + y]]: {},
                  },
                  expanded: {
                    [[x, y, item.name]]: {
                      name: item.name,
                      plural: item.plural,
                      count: 1,
                      totalValue: item.val,
                      dir: getDir(x, y),
                      loc: {
                        [[state.player.pos.x + x, state.player.pos.y + y]]: {},
                      },
                    },
                  },
                };
              }
            });
          }
        }
      }
      surr.items = items;

      return surr;
    },
  },

  actions: {
    setPlayerName({ commit }, name) {
      commit("SET_PLAYER_NAME", name);
    },
    addMessage({ commit }, data) {
      commit("ADD_MESSAGE", data);
    },
    sendMessageAtPosition({ commit, state }, data) {
      // Only send messages when player is there
      if (state.player.pos.x === data.position[0] && state.player.pos.y === data.position[1]) {
        commit("ADD_MESSAGE", { entity: data.entity, message: data.message });
      }
    },
    enterCommand({ commit, state }, text) {
      commit("ADD_MESSAGE", {
        entity: state.playerName,
        message: text,
      });
      commit("SET_INPUT_TEXT", "");
    },
    setCommandMode({ commit }, mode) {
      commit("SET_COMMAND_MODE", mode);
    },
    setInputText({ commit }, text) {
      commit("SET_INPUT_TEXT", text);
    },
    startGame({ commit }) {
      // commit("START_GAME");
    },
    receiveInput({ commit }, input) {
      // gsMan.receiveInput(input);
    },
    parseCommand({ commit }, command) {
      console.log("Parsing", command);
    },
    setPlayer({ commit }, player) {
      commit("SET_PLAYER", player);
    },
    setWorld({ commit }, world) {
      commit("SET_WORLD", world);
    },
    setSplash({ commit }, val) {
      commit("SET_SPLASH", val);
    },
    movePlayer({ commit, state }, dir) {
      switch (dir.toUpperCase()) {
        case "UP":
          commit("MOVE_PLAYER", [0, -1]);
          break;
        case "DOWN":
          commit("MOVE_PLAYER", [0, 1]);
          break;
        case "LEFT":
          commit("MOVE_PLAYER", [-1, 0]);
          break;
        case "RIGHT":
          commit("MOVE_PLAYER", [1, 0]);
          break;
      }
    },
    setDisplayOrigin({ commit }, pos) {
      commit("SET_DISPLAY_ORIGIN", pos);
    },
    addCreature({ commit }, creature) {
      commit("ADD_CREATURE", creature);
    },
    moveCreature({ commit }, data) {
      commit("MOVE_CREATURE", data);
    },
    highlight({ commit }, tiles) {
      if (tiles) {
        commit("HIGHLIGHT_TILES", tiles);
      } else {
        commit("CLEAR_HIGHLIGHTED");
      }
    },
  },

  mutations: {
    SET_PLAYER_NAME(state, name) {
      state.player.name = name;
    },
    ADD_MESSAGE(state, data) {
      state.messages.push({
        entity: data.entity,
        message: data.message,
      });
    },
    SET_COMMAND_MODE(state, mode) {
      state.commandMode = mode;
    },
    SET_INPUT_TEXT(state, text) {
      state.inputText = text;
    },
    START_GAME(state) {
      console.log("Probably not going to work here buddy");
    },
    SET_PLAYER(state, player) {
      state.player = player;
    },
    SET_WORLD(state, world) {
      state.world = world;
    },
    SET_SPLASH(state, val) {
      state.splash = val;
    },
    SET_DISPLAY_ORIGIN(state, pos) {
      state.displayOrigin = pos;
    },
    MOVE_PLAYER(state, delta) {
      const pos = {
        x: state.player.pos.x + delta[0],
        y: state.player.pos.y + delta[1],
      };
      state.player = Object.assign({}, state.player, { pos });
    },
    ADD_CREATURE(state, creature) {
      if (state.creatures[creature.pos]) {
        state.creatures[creature.pos].push(creature);
        state.creatures[creature.pos].sort((a, b) => b.level - a.level);
      } else {
        Vue.set(state.creatures, creature.pos, [creature]);
      }
    },
    MOVE_CREATURE(state, data) {
      if (state.creatures[data.newPos]) {
        state.creatures[data.newPos].push(
          ...state.creatures[data.creature.pos].splice(
            state.creatures[data.creature.pos].indexOf(data.creature),
            1
          )
        );
        state.creatures[data.newPos].sort((a, b) => b.level - a.level);
      } else {
        Vue.set(
          state.creatures,
          data.newPos,
          state.creatures[data.creature.pos].splice(
            state.creatures[data.creature.pos].indexOf(data.creature),
            1
          )
        );
      }
    },
    HIGHLIGHT_TILES(state, tiles) {
      state.highlit = tiles;
    },
    CLEAR_HIGHLIGHTED(state) {
      state.highlit = [];
    },
  },
});

export default store;

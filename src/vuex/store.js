import Vue from "vue";
import Vuex from "vuex";
import createGamePlugin from "./gamePlugin"
import { eventBus } from "../game/api";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    messages: [
      { entity: "Test messages follow:", message: "" },
      { entity: "Alpvax", message: "I'm helping you develop your game." },
      { entity: "p-Dandy", message: "I'm fixing your broken shit." },
      {
        entity:
          "This is a really long name that should break over a few lines",
        message:
          "I'm trying to help fix your broken shit. I'm trying to help fix your broken shit. I'm trying to help fix your broken shit. I'm trying to help fix your broken shit. I'm trying to help fix your broken shit."
      },
      { entity: "Me", message: "Thanks guys." },
      { entity: "Quest giver", message: "You receive a quest, it's to go and pick up a whole load of shit then fight some monsters and collect something from them and craft that stuff together to make an item." },
      { entity: "", message: "You collect the stuff." },
      { entity: "", message: "You hit the rat for so much damage, numbers etc." },
      { entity: "Rat", message: "The rat attacks you." },
      { entity: "", message: "You fight the creatures, gathering their whatever." },
      { entity: "Update", message: "You craft the item." },
      { entity: "Quest giver", message: "You hand the item to the quest giver and they give you some gold and a life lesson." }
    ],
    playerName: "Player Name",
    contextMenu: {
      show: false,
      pos: {x: 0, y: 0},
      items: () => []
    }
  },

  plugins: [createGamePlugin(eventBus, [["evt", "TEST_EVENT"], ["event1", "event2", "event3"], "ADD_MESSAGE", new Map([["mapE", "mapM"]]), {"obE": "obM"}], {"ADD_MESSAGE": (m) => eventBus.emit("evt", m)})],

  getters: {
    playerName: (state) => state.playerName,
    messages: (state) => state.messages,
    contextMenu: (state) => state.contextMenu
  },

  actions: {
    addMessage({ commit }, data) {
      commit("ADD_MESSAGE", data);
    },
    setContextMenuItems({ commit }, items) {
      commit("SET_CONTEXT_MENU_ITEMS", items);
    },
    showContextMenu({ commit }, pos) {
      commit("SET_CONTEXT_MENU_POS", pos);
      commit("SHOW_CONTEXT_MENU");
    },
    hideContextMenu({ commit }) {
      commit("HIDE_CONTEXT_MENU");
    }
  },

  mutations: {
    ADD_MESSAGE(state, data) {
      state.messages.push({
        entity: data.entity,
        message: data.message
      });

      // Have to wait for DOM to be updated before scrolling
      Vue.nextTick(() => {
        document.getElementById("output").lastChild.scrollIntoView();
      });
    },
    SET_CONTEXT_MENU_ITEMS(state, items) {
      state.contextMenu.items = items;
      if(items.length < 1)
      {
        state.contextMenu.show = false;
      }
    },
    SET_CONTEXT_MENU_POS(state, pos) {
      state.contextMenu.pos = pos;
    },
    SHOW_CONTEXT_MENU(state) {
      state.contextMenu.show = true;
    },
    HIDE_CONTEXT_MENU(state) {
      state.contextMenu.show = false;
    },
    TEST_EVENT(state) {
      console.log("TEST_EVENT mutation committed");
    }
  }
});

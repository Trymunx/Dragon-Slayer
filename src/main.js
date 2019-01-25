// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import store from "./vuex/store";
import game from "./game/vue-game-plugin";
import contextmenu from "vue-contextmenu-plugin";

Vue.config.productionTip = false;
Vue.use(game);
Vue.use(contextmenu);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  game,
  components: { App },
  template: '<App/>'
})

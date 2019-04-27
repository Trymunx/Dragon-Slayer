// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import App from "./App";
import { mixin as contextMixin } from "./components/ContextMenu.vue";
import game from "./game/vue-game-plugin";
import store from "./vuex/store";
import Vue from "vue";

Vue.config.productionTip = false;
Vue.use(game);
Vue.mixin(contextMixin);

/* eslint-disable no-new */
new Vue({
  el: "#app",
  store,
  game,
  components: { App },
  template: "<App/>",
});

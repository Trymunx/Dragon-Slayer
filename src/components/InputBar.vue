<template>
  <div id="input-bar">
    > <input type="text" id="input-text" placeholder="_"
     v-model="inputText" @keypress.enter="submit"
     @focus="inputBar('focus')" @blur="inputBar('blur')"/>
  </div>
</template>

<script>
export default {
  computed: {
    inputText: {
      get() {
        return this.$store.getters.inputText;
      },
      set(newValue) {
        this.$store.dispatch("setInputText", newValue);
      },
    },
  },
  methods: {
    inputBar(state) {
      const colours = ["#434241", "#262626"];
      let colour;

      switch (state) {
        case "focus":
          colour = colours[0];
          this.$store.dispatch("setCommandMode", "text");
          break;
        case "blur":
          colour = colours[1];
          this.$store.dispatch("setCommandMode", "instant");
          break;
      }

      document.querySelector("#input-bar").style["background-color"] = colour;
      document.querySelector("#input-text").style["background-color"] = colour;
    },
    submit() {
      // Only submit if there are non-whitespace chars
      if (!/^\s*$/.test(this.inputText)) {
        let input = this.inputText.trim();
        this.$store.dispatch("enterCommand", input);
        this.$game.receiveInputText(input);
      }
    },
  },
  mounted() {
    document.querySelector("#input-text").focus();
  },
};
</script>

<style scoped>
#input-bar {
  padding: 4px 10px 4px 10px;
  color: var(--text);
  background-color: var(--ui-darker);
  font-family: "Ubuntu Mono", monospace;
}

#input-text {
  width: 92%;
  resize: auto;
  padding: 4px 0px 4px 0px;
  border-style: none;
  outline: none;
  background-color: var(--ui-darker);
  /* Text */
  color: var(--text);
  font-size: 0.95em;
  font-family: "Ubuntu Mono", monospace;
  caret-color: var(--text-blur);
}
</style>

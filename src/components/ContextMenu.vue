<template>
  <div id="context-menu" v-show="show" ref="menu" :style="style">
    <div v-for="(item, i) in this.items" :key="i">
      <div @click.stop="handleAction(item)" class="context-item">
        {{item.text}}
      </div>
    </div>
  </div>
</template>

<script>
let data = {
  items: [],
  pos: {
    x: 0,
    y: 0,
  },
};

export const mixin = {
  methods: {
    contextMenuItems(vm, menuItems, event) {},
    hideContextMenu() {
      data.items = [];
    },
    showContextMenu(event) {
      let pos = { x: event.x, y: event.y };
      let items = [];
      let comp = this;
      while (comp) {
        let e = comp.contextMenuItems(comp, items, event) || [];
        items = [].concat(items, e);
        comp = comp.$parent;
      }
      data.items = items;
      this.$nextTick(() => {
        data.pos = pos;
      });
    },
  },
};
export default {
  computed: {
    show() {
      return this.items.length > 0;
    },
    style() {
      const { offsetWidth, offsetHeight } = document.getElementById(
        "context-menu"
      ) || { offsetHeight: 0, offsetWidth: 0 };
      const [posX, posY] = [this.pos.x, this.pos.y];
      return {
        left:
          posX + offsetWidth < window.innerWidth
            ? `${posX}px`
            : `${posX - offsetWidth}px`,
        top:
          posY + offsetHeight < window.innerHeight
            ? `${posY}px`
            : `${posY - offsetHeight}px`,
      };
    },
  },
  data() {
    return data;
  },
  methods: {
    handleAction(item) {
      if (item.isParent) {
        item.action();
      } else {
        item.action();
        this.hideContextMenu();
      }
    },
  },
};
</script>

<style>
#context-menu {
  position: absolute;
  max-width: 240px;
  max-height: 90vh;
  color: var(--text-blur);
  background: var(--ui-border);
  padding: 10px 0px;
  z-index: 1;
  border-radius: 4px;
  box-shadow: 0px 2px 15px 0px #232323;
}

.context-item {
  padding: 10px;
  margin: 0;
  cursor: pointer;
}

.context-item:hover {
  background: var(--ui-dark);
}
</style>

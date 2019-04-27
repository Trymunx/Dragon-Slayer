import { chunkSize } from "../config/world";
import genCreatures from "../creatures/genCreatures";
import parseDirection from "../utils/ParseDirection";
import store from "../../vuex/store";
import Tile from "./Tile";

export default class Chunk {
  constructor(x, y, world) {
    this.x = x;
    this.y = y;
    this.world = world;
    this.tiles = [];
    for (let i = 0; i < chunkSize; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < chunkSize; j++) {
        if (Math.random() > 0.4) {
          this.tiles[i][j] = new Tile(i, j, this, "forest");
        } else {
          this.tiles[i][j] = new Tile(i, j, this);
        }
      }
    }

    this.generate();
  }

  static chunkKey(x, y) {
    return x + "," + y;
  }

  static get size() {
    return chunkSize;
  }

  getAdjChunk(direction) {
    let offset = parseDirection(direction);
    return this.world.getChunk(this.x + offset.x, this.y + offset.y);
  }

  getTile(x, y) {
    return this.tiles[x][y];
  }

  getTileFromWorldCoords(tile_x, tile_y) {
    return this.getTile(
      Math.abs((Chunk.size + tile_x) % Chunk.size),
      Math.abs((Chunk.size + tile_y) % Chunk.size)
    );
  }

  generate() {
    console.log("Generating: %O", this);
    // Terrain -> structure -> creatures -> player
    let pLvl = store.getters.playerLevel;
    genCreatures(Chunk.size, this.x, this.y, pLvl);
  }
}

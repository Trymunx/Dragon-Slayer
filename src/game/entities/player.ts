import { dispatchAction } from "../../vuex/actions";
import Position from "../world/position";
import { RNG } from "../utils/RNG";
import store from "../../vuex/store";
import { ActivityState, Entity, EntityType, HumanoidBody, isPlayer } from "./entity";
import { attackSuccessChance, maxDamage } from "../utils/fighting";
import { Creature, CreatureName } from "./creatures";

// export interface Player {
//   creaturesSlain: { [key in CreatureName]?: number };
//   inventory?: any;
//   slots?: any;
// }

export class Player extends Entity {
  creaturesSlain: { [key in CreatureName]?: number };
  name: string;
  xp: number;

  constructor(name: string = "", level: number = 1) {
    super({
      attributes: {
        armour: 0,
        attackChance: 0.45,
        attackSpeed: 30,
        damage: 10,
        dodgeChance: 0.15,
      },
      cooldown: 35,
      currentActivityState: ActivityState.MOVING,
      equipmentSlots: {
        arms: [
          {
            fingers: [
              { equipped: null },
              { equipped: null },
              { equipped: null },
              { equipped: null },
            ],
            hand: {
              equipped: null,
            },
            wrist: {
              equipped: null,
            },
          },
          {
            fingers: [
              { equipped: null },
              { equipped: null },
              { equipped: null },
              { equipped: null },
            ],
            hand: {
              equipped: null,
            },
            wrist: {
              equipped: null,
            },
          },
        ],
        back: {
          equipped: null,
        },
        feet: {
          equipped: null,
        },
        heads: [
          {
            head: { equipped: null },
            neck: { equipped: null },
          },
        ],
        legs: { equipped: null },
        torso: { equipped: null },
        waist: { equipped: null },
      },
      hp: {
        current: 100,
        max: 100,
      },
      items: [],
      level: level,
      position: new Position(0, 0),
      symbol: "|",
      type: EntityType.Player,
    });

    this.name = name;
    this.creaturesSlain = {};
    this.xp = 0;
  }

  get xpToNextLevel(): number {
    return Math.round(50 * this.level ** 1.3);
  }

  get isFullHealth(): boolean {
    return this.hp.current >= this.hp.max;
  }

  addXP(xp: number) {
    while (this.xpToNextLevel < xp) {
      xp -= this.xpToNextLevel;
      this.levelUp();
    }
    this.xp = xp;
  }

  attack() {
    if (!this.target || this.target.isDead() || isPlayer(this.target)) {
      dispatchAction.AddMessage({
        entity: "Game",
        message: "There is nothing to attack!",
      });
      this.target = undefined;
      this.currentActivityState = ActivityState.MOVING;
      return;
    }

    const successChance = attackSuccessChance(
      this.attributes.attackChance,
      this.target.attributes.dodgeChance
    );

    if (successChance < RNG()) {
      dispatchAction.AddMessage({
        entity: this.name,
        message: `You missed the ${this.target.species.name}.`,
      });
      return;
    }

    // maxDamage gives value between 1 and this.attributes.damage.
    // We use Math.ceil because we want 1 to be the minimum damage value.
    const maxDmg = maxDamage(this.attributes.damage, this.target.attributes.armour);
    const damage = Math.ceil(RNG(maxDmg));

    dispatchAction.AddMessage({
      entity: this.name,
      message: `You attack the ${this.target.species.name} for ${damage}HP.`,
    });

    this.target.receiveDamage(damage);

    if (this.target.isDead()) {
      this.currentActivityState = ActivityState.MOVING;
    }
  }

  heal(amount: number): number {
    const healed = Math.min(this.hp.max - this.hp.current, amount);
    this.hp.current += healed;

    return healed;
  }

  levelUp() {
    this.level++;
    this.attributes.damage += Math.round(this.level ** 0.5);
    this.attributes.armour += Math.round(this.level ** 0.5);
    this.hp.max = 10 * Math.floor((10 * this.level ** 1.3 + 90) / 10);

    dispatchAction.AddMessage({
      entity: "Level up",
      message: `Congratulations! You are now level ${this.level}.`,
    });
  }

  printHPReport() {
    const totalBarLength = 40;
    const hpPercent = Math.round((this.hp.current / this.hp.max) * 100);
    const currentHPLength = Math.round((totalBarLength / 100) * hpPercent);
    const hpReportString = `[${this.symbol.repeat(currentHPLength).padEnd(totalBarLength)}] (${
      this.hp.current
    }HP)`;
    dispatchAction.AddMessage({
      entity: this.name,
      message: hpReportString,
    });
  }

  receiveDamage(damage: number) {
    this.hp.current = Math.max(0, this.hp.current - damage);
    if (this.hp.current === 0) {
      dispatchAction.AddMessage({
        entity: "",
        message: "Game over.", // Do creature report here
      });
      this.currentActivityState = ActivityState.DEAD;
    } else {
      this.printHPReport();
    }
  }

  targetCreature(creature: Creature) {
    this.target = creature;
    creature.currentActivityState = ActivityState.FIGHTING;
    creature.target = this;
  }

  update() {
    if (this.cooldown > 0) {
      this.cooldown--;
      return;
    }

    this.cooldown = this.attributes.attackSpeed;

    switch (this.currentActivityState) {
      case ActivityState.FIGHTING:
        this.attack();
        break;
    }
  }
}

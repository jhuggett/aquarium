import { AppContext, sleep } from "../aquarium.ts";
import { RGB } from "../colors.ts";
import { XY, Box, Squirrel3, MathRandom, OutOfBoundsError } from "../deps.ts";
import { Node } from "../node.ts";
import { Sprite } from "../sprite.ts";
import { mediumFacingLeft, mediumFacingRight } from "./sprites/medium.ts";
import { smallFacingLeft, smallFacingRight } from "./sprites/small.ts";

export type BehaviorType = "fast" | "slow";

export class Fish extends Node {
  currentSprite: Sprite;
  currentLocation: XY;

  primaryColor: RGB;
  eyeColor: RGB;

  direction: "right" | "left" = "right";

  spriteForDirection() {
    if (this.direction === "right")
      switch (this.size) {
        case "medium": {
          return mediumFacingRight(this.primaryColor, this.eyeColor);
        }
        case "small": {
          return smallFacingRight(this.primaryColor, this.eyeColor);
        }
      }
    if (this.direction === "left")
      switch (this.size) {
        case "medium": {
          return mediumFacingLeft(this.primaryColor, this.eyeColor);
        }
        case "small": {
          return smallFacingLeft(this.primaryColor, this.eyeColor);
        }
      }
  }

  constructor(
    protected box: Box,
    location: XY,
    private seed: number,
    private size: "small" | "medium" = "medium",
    public behavior: BehaviorType
  ) {
    super();
    const random = new Squirrel3(this.seed, 0);

    this.primaryColor = random.getRandomRGB();
    this.eyeColor = random.getRandomRGB();
    this.currentLocation = location;
    this.currentSprite = this.spriteForDirection()!;
  }
}

export const fishLoop = async (context: AppContext, fish: Fish) => {
  const movement = {
    x: 1,
    y: 1,
  };

  const random = new MathRandom();
  // const random = new Squirrel3(0, 0);

  while (!context.requestingExit) {
    switch (fish.behavior) {
      case "fast": {
        if (random.getRandomBool(0.6)) {
          movement.x = random.getRandomItem([0, 1, -1]);
        }

        if (random.getRandomBool(0.6)) {
          movement.y = random.getRandomItem([0, 1, -1]);
        }
        break;
      }
      case "slow": {
        if (random.getRandomBool(0.2)) {
          movement.x = random.getRandomItem([0, 1, -1]);
        }

        if (random.getRandomBool(0.2)) {
          movement.y = random.getRandomItem([0, 1, -1]);
        }
      }
    }

    if (movement.x === 1 && fish.direction === "left") {
      fish.direction = "right";
      fish.switchSprites(fish.spriteForDirection()!);
    }
    if (movement.x === -1 && fish.direction === "right") {
      fish.direction = "left";
      fish.switchSprites(fish.spriteForDirection()!);
    }

    try {
      fish.moveSprite(movement);
    } catch (error) {
      if (!(error instanceof OutOfBoundsError)) {
        throw error;
      }
      if (error.axis === "x") {
        movement.x = movement.x * -1;
      }
      if (error.axis === "y") {
        movement.y = movement.y * -1;
      }
    }

    switch (fish.behavior) {
      case "fast": {
        await sleep(random.getRandomItem([200, 250, 500]));
        break;
      }
      case "slow": {
        await sleep(random.getRandomItem([600, 800]));
      }
    }
  }
};

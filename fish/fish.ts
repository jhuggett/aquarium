import { AppContext, sleep } from "../aquarium.ts";
import { RGB } from "../colors.ts";
import { XY, Box, Squirrel3, MathRandom, OutOfBoundsError } from "../deps.ts";
import { Node } from "../node.ts";
import { Sprite } from "../sprite.ts";
import { largeFacingLeft, largeFacingRight } from "./sprites/large.ts";
import { smallFacingLeft, smallFacingRight } from "./sprites/small.ts";

export class Fish extends Node {
  sprites: Sprite[];
  currentLocation: XY;

  primaryColor: RGB;

  direction: "right" | "left" = "right";

  spriteForDirection() {
    if (this.direction === "right")
      switch (this.size) {
        case "large": {
          return largeFacingRight(this.primaryColor, this.seed, "right");
        }
        case "small": {
          return smallFacingRight(this.primaryColor, this.seed);
        }
      }
    if (this.direction === "left")
      switch (this.size) {
        case "large": {
          return largeFacingLeft(this.primaryColor, this.seed);
        }
        case "small": {
          return smallFacingLeft(this.primaryColor, this.seed);
        }
      }
  }

  constructor(
    protected box: Box,
    location: XY,
    private seed: number,
    private size: "small" | "large" = "small",
    public moveChance: () => number,
    public timeBetweenMoves: () => number
  ) {
    super();
    const random = new Squirrel3(this.seed, 0);

    const minColor = 25;
    const maxColor = 125;

    this.primaryColor = {
      r: random.getRandomNumber(minColor, maxColor),
      g: random.getRandomNumber(minColor, maxColor),
      b: random.getRandomNumber(minColor, maxColor),
    };

    this.currentLocation = location;
    this.sprites = [this.spriteForDirection()!];
  }
}

export const fishLoop = async (context: AppContext, fish: Fish) => {
  const movement = {
    x: 1,
    y: 1,
  };

  const random = new MathRandom();

  while (!context.requestingExit) {
    if (random.getRandomBool(fish.moveChance())) {
      movement.x = random.getRandomItem([0, 1, -1]).item;
    }

    if (movement.x !== 0 && random.getRandomBool(fish.moveChance())) {
      movement.y = random.getRandomItem([0, 1, -1]).item;
    } else {
      movement.y = 0;
    }

    try {
      if (movement.x === 1 && fish.direction === "left") {
        fish.direction = "right";
        fish.switchSprites([fish.spriteForDirection()!]);
      }
      if (movement.x === -1 && fish.direction === "right") {
        fish.direction = "left";
        fish.switchSprites([fish.spriteForDirection()!]);
      }
    } catch (error) {
      if (!(error instanceof OutOfBoundsError)) {
        throw error;
      }
    }

    try {
      fish.moveBy(movement);
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

    await sleep(fish.timeBetweenMoves());
  }
};

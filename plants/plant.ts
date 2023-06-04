import { AppContext, sleep } from "../aquarium.ts";
import {
  XY,
  Box,
  Squirrel3,
  MathRandom,
  OutOfBoundsError,
  Random,
} from "../deps.ts";
import { Node } from "../node.ts";
import { Sprite } from "../sprite.ts";

const createPlantSprite = (random: Random): Sprite => {
  return new Sprite(
    [{ x: 0, y: 0 }].map((xy) => {
      const gradient = 255 - random.getRandomNumber(150, 175);
      return {
        character: " ",
        coordinate: xy,
        backgroundColor: {
          r: 0,
          g: gradient,
          b: 0,
        },
      };
    })
  );
};

export class Plant extends Node {
  sprites: Sprite[] = [];

  constructor(
    height: number,
    protected box: Box,
    public currentLocation: XY,
    seed: number
  ) {
    super();
    const random = new Squirrel3(seed, 0);
    for (let i = 0; i <= height; i++) {
      const piece = createPlantSprite(random);
      piece.offset.y = i;
      this.sprites.push(piece);
    }
    this.sprites.reverse();
  }
}

export const plantLoop = async (context: AppContext, plant: Plant) => {
  const random = new MathRandom();

  while (!context.requestingExit) {
    try {
      if (!plant.isAtBottomOfBox) {
        plant.moveDown();
      } else {
        // wiggle

        const { index, item: piece } = random.getRandomItem(
          plant.sprites.slice(1)
        );

        // remember, index is behind by 1
        // because its a slice of pieces
        const prev = plant.sprites[index];
        const next = plant.sprites[index + 2];

        const distanceToPrev = prev ? piece.offset.x - prev.offset.x : 0;
        const distanceToNext = next ? piece.offset.x - next.offset.x : 0;

        const options = [0];

        const combinedDistance = distanceToPrev + distanceToNext;

        if (combinedDistance < 0) options.push(1);
        else if (combinedDistance > 0) options.push(-1);
        else if (distanceToNext === 0 && distanceToPrev === 0)
          options.push(-1, 1);

        if (options.length > 0) {
          piece.offset.x += random.getRandomItem(options).item;
        }

        plant.drawCurrentSprites();
      }
    } catch (error) {
      if (error instanceof OutOfBoundsError) {
        // do nothing
      } else {
        throw error;
      }
    }

    await sleep(
      random.getRandomItem(!plant.isAtBottomOfBox ? [50] : [250]).item
    );
  }
};

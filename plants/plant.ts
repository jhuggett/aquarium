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

export class PlantPiece extends Node {
  currentSprite: Sprite;
  currentLocation: XY;

  constructor(protected box: Box, location: XY, private seed: number) {
    super();
    const random = new Squirrel3(this.seed, 0);

    this.currentSprite = createPlantSprite(random);
    this.currentLocation = location;
  }
}

export class Plant {
  pieces: PlantPiece[] = [];

  constructor(height: number, box: Box, location: XY, seed: number) {
    for (let i = 0; i <= height; i++) {
      this.pieces.push(
        new PlantPiece(box, { ...location, y: location.y + i }, seed + i)
      );
    }
    this.pieces.reverse();
  }

  drawCurrentSprite() {
    this.pieces.forEach((piece) => piece.drawCurrentSprite());
  }
}

export const plantLoop = async (context: AppContext, plant: Plant) => {
  const movement = {
    x: 0,
    y: 1,
  };

  const random = new MathRandom();

  while (!context.requestingExit) {
    try {
      if (movement.y) {
        plant.pieces.forEach((piece) => piece.moveSprite(movement));
      } else {
        // wiggle
        const { index, item: piece } = random.getRandomItem(
          plant.pieces.slice(1)
        );

        // remember, index is behind by 1
        // because its a slice of pieces
        const prev = plant.pieces[index];
        const next = plant.pieces[index + 2];

        const distanceToPrev = prev
          ? piece.currentLocation.x - prev.currentLocation.x
          : 0;
        const distanceToNext = next
          ? piece.currentLocation.x - next.currentLocation.x
          : 0;

        const options = [0];

        const combinedDistance = distanceToPrev + distanceToNext;

        if (combinedDistance < 0) options.push(1);
        else if (combinedDistance > 0) options.push(-1);
        else if (distanceToNext === 0 && distanceToPrev === 0)
          options.push(-1, 1);

        piece.moveSprite({
          y: 0,
          x: random.getRandomItem(options).item,
        });
      }
    } catch (error) {
      if (error instanceof OutOfBoundsError) {
        movement.y = 0;
      } else throw error;
    }

    await sleep(random.getRandomItem(movement.y ? [50] : [250]).item);
  }
};

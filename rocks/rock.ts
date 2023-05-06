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

const createRockSprite = (random: Random): Sprite => {
  const xyToString = ({ x, y }: XY) => `${x},${y}`;
  const adjacentXY = ({ x, y }: XY) => [
    { x, y: y + 1 },
    { x, y: y - 1 },
    { x: x + 1, y },
    { x: x - 1, y },
  ];

  let lowestX = 0;
  let largestY = 0;
  const points: XY[] = [];
  const pointSet = new Set<string>();

  let growthPoints: XY[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const maxSize = random.getRandomNumber(5, 20);

  while (growthPoints.length > 0 && points.length < maxSize) {
    const newGrowthPoints: XY[] = [];

    for (const growthPoint of growthPoints) {
      for (const xy of adjacentXY(growthPoint)) {
        if (
          xy.y >= 0 &&
          !pointSet.has(xyToString(xy)) &&
          random.getRandomBool(0.7)
        ) {
          newGrowthPoints.push(xy);
          points.push(xy);
          pointSet.add(xyToString(xy));
          if (xy.x < lowestX) lowestX = xy.x;
          if (xy.y > largestY) largestY = xy.y;
        }
      }
    }

    growthPoints = [...newGrowthPoints];
  }

  for (const xy of points) {
    xy.x += Math.abs(lowestX);
    xy.y = largestY - xy.y;
  }

  return new Sprite(
    points.map((xy) => {
      const gradient = 255 - random.getRandomNumber(150, 175);
      return {
        character: " ",
        coordinate: xy,
        backgroundColor: {
          r: gradient,
          g: gradient,
          b: gradient,
        },
      };
    })
  );
};

export class Rock extends Node {
  currentSprite: Sprite;
  currentLocation: XY;

  constructor(protected box: Box, location: XY, private seed: number) {
    super();
    const random = new Squirrel3(this.seed, 0);

    this.currentSprite = createRockSprite(random);
    this.currentLocation = location;
  }
}

export const rockLoop = async (context: AppContext, rock: Rock) => {
  const movement = {
    x: 0,
    y: 1,
  };

  const random = new MathRandom();

  while (!context.requestingExit) {
    try {
      rock.moveSprite(movement);
    } catch (error) {
      if (error instanceof OutOfBoundsError) {
        return;
      }
      throw error;
    }

    await sleep(random.getRandomItem([50]).item);
  }
};

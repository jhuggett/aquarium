import { RGB } from "../../colors.ts";
import { Squirrel3 } from "../../deps.ts";
import { Sprite } from "../../sprite.ts";

/*
▄ ▄
█████
▀
*/

export const smallFacingRight = (primaryColor: RGB, seed: number) => {
  const random = new Squirrel3(seed, 0);

  const getTailColor = (): RGB => {
    const gradient = random.getRandomNumber(0, 40) - 20;

    const tailColorOffset = 60;

    return {
      r: Math.max(0, primaryColor.r + tailColorOffset - gradient),
      g: Math.max(0, primaryColor.g + tailColorOffset - gradient),
      b: Math.max(0, primaryColor.b + tailColorOffset - gradient),
    };
  };

  const getBodyColor = (): RGB => {
    const gradient = random.getRandomNumber(0, 40) - 20;

    return {
      r: Math.max(0, primaryColor.r - gradient),
      g: Math.max(0, primaryColor.g - gradient),
      b: Math.max(0, primaryColor.b - gradient),
    };
  };

  const getEyeColor = (): RGB => {
    const gradient = -100;

    return {
      r: primaryColor.r - gradient,
      g: primaryColor.g - gradient,
      b: primaryColor.b - gradient,
    };
  };

  return new Sprite([
    {
      coordinate: {
        x: 4,
        y: 1,
      },
      character: "o",
      foregroundColor: getEyeColor(),
      backgroundColor: getBodyColor(),
    },
    {
      coordinate: {
        x: 3,
        y: 1,
      },
      character: " ",
      backgroundColor: getBodyColor(),
    },
    {
      coordinate: {
        x: 2,
        y: 1,
      },
      character: " ",
      backgroundColor: getBodyColor(),
    },
    {
      coordinate: {
        x: 1,
        y: 1,
      },
      character: " ",
      backgroundColor: getBodyColor(),
    },
    {
      coordinate: {
        x: 0,
        y: 1,
      },
      character: " ",
      backgroundColor: getTailColor(),
    },
    {
      coordinate: {
        x: 2,
        y: 0,
      },
      character: "▄",
      foregroundColor: getTailColor(),
    },
    {
      coordinate: {
        x: 0,
        y: 0,
      },
      character: "▄",
      foregroundColor: getTailColor(),
    },
    {
      coordinate: {
        x: 0,
        y: 2,
      },
      character: "▀",
      foregroundColor: getTailColor(),
    },
  ]);
};

export const smallFacingLeft = (primaryColor: RGB, seed: number) => {
  const base = smallFacingRight(primaryColor, seed);

  const largestX = base.points.sort(
    (a, b) => a.coordinate.x - b.coordinate.x
  )[0].coordinate.x;

  return new Sprite(
    base.points.map((point) => ({
      ...point,
      coordinate: { ...point.coordinate, x: largestX - point.coordinate.x },
    }))
  );
};

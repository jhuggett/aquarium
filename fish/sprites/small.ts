import { RGB } from "../../colors.ts";
import { Sprite } from "../../sprite.ts";

export const smallFacingRight = (primaryColor: RGB, eyeColor: RGB) =>
  new Sprite([
    {
      coordinate: {
        x: 1,
        y: 0,
      },
      character: ".",
      backgroundColor: primaryColor,
      foregroundColor: eyeColor,
    },
    {
      coordinate: {
        x: 0,
        y: 0,
      },
      character: "<",
      backgroundColor: primaryColor,
      foregroundColor: eyeColor,
    },
  ]);

export const smallFacingLeft = (primaryColor: RGB, eyeColor: RGB) =>
  new Sprite([
    {
      coordinate: {
        x: 0,
        y: 0,
      },
      character: ".",
      backgroundColor: primaryColor,
      foregroundColor: eyeColor,
    },
    {
      coordinate: {
        x: 1,
        y: 0,
      },
      character: ">",
      backgroundColor: primaryColor,
      foregroundColor: eyeColor,
    },
  ]);

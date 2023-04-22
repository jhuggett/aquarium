import { RGB } from "../../colors.ts";
import { Sprite } from "../../sprite.ts";

export const mediumFacingRight = (primaryColor: RGB, eyeColor: RGB) =>
  new Sprite([
    {
      coordinate: {
        x: 4,
        y: 1,
      },
      character: ".",
      backgroundColor: primaryColor,
      foregroundColor: eyeColor,
    },
    {
      coordinate: {
        x: 3,
        y: 1,
      },
      character: " ",
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 2,
        y: 1,
      },
      character: "<",
      foregroundColor: eyeColor,
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 1,
        y: 1,
      },
      character: "|",
      backgroundColor: primaryColor,
      foregroundColor: eyeColor,
    },
    {
      coordinate: {
        x: 0,
        y: 1,
      },
      character: " ",
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 2,
        y: 0,
      },
      character: "_",
      foregroundColor: eyeColor,
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 0,
        y: 0,
      },
      character: " ",
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 0,
        y: 2,
      },
      character: " ",
      backgroundColor: primaryColor,
    },
  ]);

export const mediumFacingLeft = (primaryColor: RGB, eyeColor: RGB) =>
  new Sprite([
    {
      coordinate: {
        x: 0,
        y: 1,
      },
      character: ".",
      backgroundColor: primaryColor,
      foregroundColor: eyeColor,
    },
    {
      coordinate: {
        x: 1,
        y: 1,
      },
      character: " ",
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 2,
        y: 1,
      },
      character: ">",
      foregroundColor: eyeColor,
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 3,
        y: 1,
      },
      character: "|",
      backgroundColor: primaryColor,
      foregroundColor: eyeColor,
    },
    {
      coordinate: {
        x: 4,
        y: 1,
      },
      character: " ",
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 2,
        y: 0,
      },
      character: "_",
      foregroundColor: eyeColor,
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 4,
        y: 0,
      },
      character: " ",
      backgroundColor: primaryColor,
    },
    {
      coordinate: {
        x: 4,
        y: 2,
      },
      character: " ",
      backgroundColor: primaryColor,
    },
  ]);

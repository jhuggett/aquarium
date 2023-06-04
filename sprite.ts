import { Point, combine } from "./deps.ts";

export class Sprite {
  constructor(public points: Omit<Point, "zIndex">[]) {}

  get offsetPoints() {
    return this.points.map((point) => ({
      ...point,
      coordinate: combine([point.coordinate, this.offset]),
    }));
  }

  offset = {
    x: 0,
    y: 0,
  };
}

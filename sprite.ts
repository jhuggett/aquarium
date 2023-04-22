import { Point, XY } from "./deps.ts";

export class Sprite {
  constructor(public points: Omit<Point, "zIndex">[]) {}

  getRelativePointsRelativeTo({ x, y }: XY) {
    const relativePoints = this.points.map((point) => ({
      ...point,
      coordinate: {
        x: point.coordinate.x + x,
        y: point.coordinate.y + y,
      },
    }));

    return relativePoints;
  }
}

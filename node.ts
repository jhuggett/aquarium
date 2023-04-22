import { Box, XY } from "./deps.ts";
import { Sprite } from "./sprite.ts";

export abstract class Node {
  abstract currentSprite: Sprite;

  protected abstract box: Box;

  drawnPoints: XY[] = [];

  abstract currentLocation: XY;

  drawCurrentSprite() {
    for (const point of this.currentSprite.getRelativePointsRelativeTo(
      this.currentLocation
    )) {
      this.box.moveCursorTo(point.coordinate);
      this.box.bufferedWriteCharacter(point);
      this.drawnPoints.push(point.coordinate);
    }
  }

  switchSprites(sprite: Sprite) {
    /*
      - clear old drawn points
      - draw new sprite
    */
    for (const point of this.drawnPoints) {
      this.box.clear(point);
    }
    this.currentSprite = sprite;
    this.drawCurrentSprite();
  }

  moveSprite(by: XY) {
    /*
      - shift sprite
    */
    this.drawnPoints = this.box.shift(this.drawnPoints, by);
    this.currentLocation.x += by.x;
    this.currentLocation.y += by.y;
  }
}

import { Box, OutOfBoundsError, XY, XYSet, combine } from "./deps.ts";
import { Sprite } from "./sprite.ts";

export abstract class Node {
  abstract sprites: Sprite[];

  protected abstract box: Box;

  drawnPoints: XYSet = XYSet.empty();
  shape: XYSet = XYSet.empty();

  invalidatePreviouslyDrawnPoints() {
    this.drawnPoints = XYSet.empty();
  }

  abstract currentLocation: XY;

  clear() {
    this.drawnPoints.coordinates.map((point) => {
      this.box.clear(point);
    });
    this.invalidatePreviouslyDrawnPoints();
  }

  drawCurrentSprites() {
    const previouslyDrawnPoints = this.drawnPoints.copy();
    try {
      this.drawnPoints = XYSet.empty();
      this.shape = XYSet.empty();

      this.sprites.forEach((sprite) => {
        sprite.offsetPoints.forEach((point) => {
          const relativeCoordinate = point.coordinate;
          const actualCoordinate = combine([
            this.currentLocation,
            relativeCoordinate,
          ]);

          this.box.bufferedWriteCharacter(point, actualCoordinate);

          this.drawnPoints.add(actualCoordinate);
          this.shape.add(relativeCoordinate);
        });
      });

      previouslyDrawnPoints.exclude(this.drawnPoints).forEach((point) => {
        this.box.clear(point);
      });
    } catch (error) {
      if (!(error instanceof OutOfBoundsError)) {
        throw error;
      }
      this.clear();
      previouslyDrawnPoints.coordinates.map((point) => {
        this.box.clear(point);
      });
      throw error;
    }
  }

  switchSprites(sprites: Sprite[]) {
    this.sprites = sprites;
    this.drawCurrentSprites();
  }

  /**
   * Move to a location
   */
  moveTo({ x, y }: XY) {
    const prev = { ...this.currentLocation };

    try {
      this.currentLocation.x = x;
      this.currentLocation.y = y;

      this.drawCurrentSprites();
    } catch (error) {
      this.currentLocation = prev;
      this.drawCurrentSprites();

      throw error;
    }
  }

  /**
   * Move by amount
   */
  moveBy({ x, y }: XY) {
    this.moveTo({
      x: x + this.currentLocation.x,
      y: y + this.currentLocation.y,
    });
  }

  moveUp() {
    this.moveBy({ x: 0, y: -1 });
  }

  moveDown() {
    this.moveBy({ x: 0, y: 1 });
  }

  moveRight() {
    this.moveBy({ x: 1, y: 0 });
  }

  moveLeft() {
    this.moveBy({ x: -1, y: 0 });
  }

  get isAtBottomOfBox() {
    const currentLowest = this.drawnPoints.bottommost?.y;

    return (
      this.box.height - 1 ===
      (currentLowest ? currentLowest : this.currentLocation.y)
    );
  }

  get distanceToBottomOfBox() {
    const currentLowest = this.shape.bottommost;

    return (
      this.box.height -
      ((currentLowest
        ? combine([currentLowest, this.currentLocation]).y
        : this.currentLocation.y) +
        1)
    );
  }
}

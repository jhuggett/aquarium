import { sandColor, waterColor } from "./colors.ts";
import {
  Box,
  DenoShell,
  MathRandom,
  OutOfBoundsError,
  Squirrel3,
  userInput,
  UnknownKeyCodeError,
} from "./deps.ts";
import { Fish, fishLoop } from "./fish/fish.ts";
import { Node } from "./node.ts";
import { Plant, plantLoop } from "./plants/plant.ts";
import { Rock, rockLoop } from "./rocks/rock.ts";

const setup = (shell: DenoShell) => {
  shell.setRaw(true);
  shell.showCursor(false);
  shell.clear();
};

const teardown = (shell: DenoShell) => {
  shell.clear();
  shell.setRaw(false);
  shell.showCursor(true);
};

const showInstructions = (layer: Box) => {
  const instructionGradient = 255;

  layer.moveCursorTo({ x: 2, y: 1 });
  layer.bufferedWriteString(
    [
      `Add small fish (s)`,
      `Add large fish (l)`,
      `Add rock (r)`,
      `Add plant (p)`,
      `Toggle help (t)`,
      `Quit (Esc)`,
    ].join("   "),
    {
      foregroundColor: {
        r: instructionGradient,
        g: instructionGradient,
        b: instructionGradient,
      },
    }
  );
};

const hideInstructions = (layer: Box) => {
  layer.clear();
};

let instructionsAreShown = true;

export const sleep = (amount: number) =>
  new Promise((resolve) => setTimeout(() => resolve(undefined), amount));

const inputLoop = async (context: AppContext, shell: DenoShell) => {
  while (!context.requestingExit) {
    try {
      await userInput(shell, {
        Escape: () => {
          context.requestingExit = true;
        },
        l: () => {
          addFish("large");
        },
        s: () => {
          addFish("small");
        },
        r: () => {
          addRock();
        },
        p: () => {
          addPlant();
        },
        t: () => {
          if (instructionsAreShown) {
            hideInstructions(instructionsLayer);
          } else {
            showInstructions(instructionsLayer);
          }
          instructionsAreShown = !instructionsAreShown;
        },
      });
    } catch (error) {
      if (!(error instanceof UnknownKeyCodeError)) throw error;
    }
  }
};

const renderLoop = async (context: AppContext, shell: DenoShell) => {
  while (!context.requestingExit) {
    if (shell.hasChangedPoints && !pauseRendering) {
      try {
        shell.render();
      } catch (e) {
        if (!(e instanceof OutOfBoundsError)) throw e;
      }
    }
    await sleep(1000 / 60);
  }
};

export interface AppContext {
  requestingExit: boolean;
}

const appContext: AppContext = {
  requestingExit: false,
};

const addFish = (size: "small" | "large") => {
  const fishLayer = waterLayer.newLayer({ newZIndexGroup: false });

  const random = new MathRandom();

  const fish = new Fish(
    fishLayer,
    {
      x: random.getRandomNumber(15, waterLayer.width - 15),
      y: random.getRandomNumber(5, waterLayer.height - 5),
    },
    seed,
    size,
    () => random.getRandomNumber(25, 75) / 100,
    () => random.getRandomNumber(500, 750)
  );
  fish.drawCurrentSprites();

  seed++;
  nodes.push(fish);
  loops.push(fishLoop(appContext, fish));
};

const addRock = () => {
  const rockLayer = waterLayer.newLayer({ newZIndexGroup: false });

  const random = new MathRandom();

  const rock = new Rock(
    rockLayer,
    { x: random.getRandomNumber(10, waterLayer.width - 10), y: 0 },
    seed
  );
  try {
    rock.drawCurrentSprites();
  } catch (error) {
    if (error instanceof OutOfBoundsError) return;
    throw error;
  }

  seed++;
  nodes.push(rock);
  loops.push(rockLoop(appContext, rock));
};

const addPlant = () => {
  const plantLayer = waterLayer.newLayer({ newZIndexGroup: false });

  const random = new MathRandom();

  const plant = new Plant(
    random.getRandomNumber(3, 9),
    plantLayer,
    { x: random.getRandomNumber(10, waterLayer.width - 10), y: 0 },
    seed
  );
  try {
    plant.drawCurrentSprites();
  } catch (error) {
    if (error instanceof OutOfBoundsError) return;
    throw error;
  }

  seed++;
  nodes.push(plant);
  loops.push(plantLoop(appContext, plant));
};

const drawTank = () => {
  const random = new Squirrel3(0, 0);

  waterLayer.fill(() => {
    const gradient = random.getRandomNumber(0, 3);
    const color = {
      r: waterColor.r - gradient,
      g: waterColor.g - gradient,
      b: waterColor.b - gradient,
    };
    return { character: " ", backgroundColor: color };
  });

  sandLayer.fill(() => {
    const gradient = random.getRandomNumber(0, 30);
    const color = {
      r: sandColor.r - gradient,
      g: sandColor.g - gradient,
      b: sandColor.b - gradient,
    };
    return { character: " ", backgroundColor: color };
  });
};

// ------------------------------------------

let pauseRendering = false;

const shell = new DenoShell();

setup(shell);

const fullShell = shell.getBoxRepresentation();

// const { left: contentLayer, right: debugLayer } = fullShell.splitHorizontally()
const contentLayer = fullShell.newLayer({});

const tankLayer = contentLayer.newLayer({});

const { top: waterLayer, bottom: sandLayer } = tankLayer.splitVertically({
  bottomHeight: 2,
});

// export const debug = {
//   log: (content: any) => {
//     try {
//       debugLayer.bufferedWriteString(JSON.stringify(content), {
//         foregroundColor: { r: 0, g: 255, b: 0 },
//       });
//       debugLayer.carriageReturn();
//     } catch (error) {
//       if (error instanceof OutOfBoundsError) {
//         debugLayer.clear();
//         debugLayer.moveCursorTo({ x: "start", y: "start" });
//       } else {
//         throw error;
//       }
//     }
//   },
// };

const nodes: Node[] = [];

drawTank();

const instructionsLayer = tankLayer.newLayer({});

showInstructions(instructionsLayer);

let seed = 0;

shell.render();

let resizeTimeoutId: number | undefined = undefined;
shell.onWindowResize(() => {
  if (resizeTimeoutId !== undefined) clearTimeout(resizeTimeoutId);
  resizeTimeoutId = setTimeout(() => {
    pauseRendering = true;
    shell.clear();

    const previousTankWidth = tankLayer.width;
    const previousTankHeight = tankLayer.height;

    shell.invalidateCachedSize();
    fullShell.invalidateCachedDimensions();

    const newTankWidth = tankLayer.width;
    const newTankHeight = tankLayer.height;

    drawTank();

    if (instructionsAreShown) {
      showInstructions(instructionsLayer);
    }

    for (const node of nodes) {
      node.invalidatePreviouslyDrawnPoints();

      node.currentLocation.x = Math.floor(
        (node.currentLocation.x / previousTankWidth) * newTankWidth
      );
      node.currentLocation.y = Math.floor(
        (node.currentLocation.y / previousTankHeight) * newTankHeight
      );
      if (node.distanceToBottomOfBox < 0) {
        node.currentLocation.y += node.distanceToBottomOfBox;
      }
      try {
        node.drawCurrentSprites();
      } catch (e) {
        if (!(e instanceof OutOfBoundsError)) {
          throw e;
        }
      }
    }
    pauseRendering = false;
  }, 300);
});

const loops = [renderLoop(appContext, shell), inputLoop(appContext, shell)];

await Promise.all(loops);

teardown(shell);

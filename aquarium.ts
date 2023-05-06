import { UnknownKeyCodeError } from "../terminal/user-input.ts";
import { sandColor, waterColor } from "./colors.ts";
import {
  Box,
  DenoShell,
  MathRandom,
  OutOfBoundsError,
  Squirrel3,
  userInput,
} from "./deps.ts";
import { Fish, fishLoop } from "./fish/fish.ts";
import { Plant, plantLoop } from "./plants/plant.ts";
import { Rock, rockLoop } from "./rocks/rock.ts";

const shell = new DenoShell();

const setup = (shell: DenoShell) => {
  shell.setRaw(true);
  shell.showCursor(false);
  shell.clear();

  const fullShell = shell.getBoxRepresentation();

  const contentLayer = fullShell.newLayer({});

  const tankLayer = contentLayer.newLayer({});

  const { top: waterLayer, bottom: sandLayer } = tankLayer.splitVertically({
    bottomHeight: 2,
  });

  const instructionsLayer = tankLayer.newLayer({});

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

  return {
    waterLayer,
    instructionsLayer,
  };
};

const teardown = (shell: DenoShell) => {
  shell.clear();
  shell.setRaw(false);
  shell.showCursor(true);
};

const showInstructions = (layer: Box) => {
  const instructionGradient = 200;

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

export const sleep = (amount: number) =>
  new Promise((resolve) => setTimeout(() => resolve(undefined), amount));

const inputLoop = async (context: AppContext, shell: DenoShell) => {
  let instructionsAreShown = true;

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
    if (shell.hasChangedPoints) shell.render();
    await sleep(1000 / 60);
  }
};

const { waterLayer, instructionsLayer } = setup(shell);

showInstructions(instructionsLayer);

let seed = 0;

shell.render();

export interface AppContext {
  requestingExit: boolean;
}

const appContext: AppContext = {
  requestingExit: false,
};

const loops = [renderLoop(appContext, shell), inputLoop(appContext, shell)];

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
  fish.drawCurrentSprite();

  seed++;

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
    rock.drawCurrentSprite();
  } catch (error) {
    if (error instanceof OutOfBoundsError) return;
    throw error;
  }

  seed++;
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
    plant.drawCurrentSprite();
  } catch (error) {
    if (error instanceof OutOfBoundsError) return;
    throw error;
  }

  seed++;
  loops.push(plantLoop(appContext, plant));
};

await Promise.all(loops);

teardown(shell);

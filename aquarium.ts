import { UnknownKeyCodeError } from "../terminal/user-input.ts";
import { sandColor, waterColor } from "./colors.ts";
import { DenoShell, MathRandom, userInput } from "./deps.ts";
import { Fish, fishLoop } from "./fish/basic-fish.ts";

const shell = new DenoShell();

const setup = (shell: DenoShell) => {
  shell.setRaw(true);
  shell.showCursor(false);
  shell.clear();

  const fullShell = shell.getBoxRepresentation();

  const main = fullShell.newLayer({
    xOffset: "middle",
    yOffset: "middle",
  });

  const { top: tankLayer, bottom: instructionsLayer } = main.splitVertically({
    bottomHeight: 4,
  });

  instructionsLayer.moveCursorVertically(1);
  instructionsLayer.bufferedWriteString(
    [`Add small fish (s)`, `Add medium fish (m)`, `Quit (Esc)`].join("   ")
  );

  const { top: waterLayer, bottom: sandLayer } = tankLayer.splitVertically({
    bottomHeight: 2,
  });

  waterLayer.fill({ character: " ", backgroundColor: waterColor });
  sandLayer.fill({ character: " ", backgroundColor: sandColor });

  shell.render();

  return {
    waterLayer,
  };
};

const teardown = (shell: DenoShell) => {
  shell.clear();
  shell.setRaw(false);
  shell.showCursor(true);
};

export const sleep = (amount: number) =>
  new Promise((resolve) => setTimeout(() => resolve(undefined), amount));

const mainLoop = async (context: AppContext, shell: DenoShell) => {
  while (!context.requestingExit) {
    try {
      await userInput(shell, {
        Escape: () => {
          context.requestingExit = true;
        },
        m: () => {
          addFish("medium");
        },
        s: () => {
          addFish("small");
        },
      });
    } catch (error) {
      if (!(error instanceof UnknownKeyCodeError)) throw error;
    }
  }
};

const renderLoop = async (context: AppContext, shell: DenoShell) => {
  while (!context.requestingExit) {
    shell.render();
    await sleep(25);
  }
};

const { waterLayer } = setup(shell);

let seed = 0;

shell.render();

export interface AppContext {
  requestingExit: boolean;
}

const appContext: AppContext = {
  requestingExit: false,
};

const loops = [renderLoop(appContext, shell), mainLoop(appContext, shell)];

const addFish = (size: "small" | "medium") => {
  const fishLayer = waterLayer.newLayer({});

  const random = new MathRandom();

  const fish = new Fish(
    fishLayer,
    { x: random.getRandomNumber(10, waterLayer.width - 10), y: 0 },
    seed,
    size,
    random.getRandomItem(["fast", "slow"])
  );
  fish.drawCurrentSprite();

  seed++;
  loops.push(fishLoop(appContext, fish));
};

await Promise.all(loops);

teardown(shell);

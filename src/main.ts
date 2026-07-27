import { GameApp } from "./app/GameApp";
import "./styles.css";

const canvas = document.querySelector("#game-canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("The game canvas is missing.");
}

const app = new GameApp(canvas);

try {
  await app.start();
} catch (error) {
  const status = document.querySelector("#status-message");
  if (status) {
    status.textContent = "Unable to start the game foundation";
  }
  throw error;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => app.stop());
}

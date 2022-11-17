import World from "./World";
import "./assets/styles/style.css";
import pkg from "../package.json";

const world = new World();

async function loadGame() {
    const versionDiv = document.getElementById("version");
    versionDiv!.textContent = pkg.version;

    await world.loadWorld();

    world.createWorldMap();

    window.requestAnimationFrame(() => {
        world.updateWorld();
    });
}

window.addEventListener("load", () => {
    loadGame();
});

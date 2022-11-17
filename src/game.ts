import World from "./World";
import "./assets/styles/style.css";
import pkg from "../package.json";

const world = new World();

async function loadGame() {
    const packageName = pkg.name;
    const packageVersion = pkg.version;
    const versionDiv = document.getElementById("version");
    versionDiv!.textContent = `${packageName} version: ${packageVersion}`;

    await world.loadWorld();

    world.createWorldMap();

    window.requestAnimationFrame(() => {
        world.updateWorld();
    });
}

window.addEventListener("load", () => {
    loadGame();
});

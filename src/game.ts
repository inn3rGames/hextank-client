import World from "./World";
import "./assets/styles/style.css";

const world = new World();

async function loadGame() {
    await world.loadWorld();

    world.createWorldMap();

    window.requestAnimationFrame(() => {
        world.updateWorld();
    });
}

window.addEventListener("load", () => {
    loadGame();
});

import World from "./World";

const world = new World();

async function loadGame() {
    await world.loadWorld();
    world.createWorldMap();

    await world.connectWorld();

    window.requestAnimationFrame(() => {
        world.updateWorld();
    });
}

window.addEventListener("load", () => {
    loadGame();
});

import World from "./World";

const world = new World();

async function loadGame() {
    await world.loadWorld();
    world.createWorldMap();

    window.requestAnimationFrame(() => {
        world.updateWorld();
    });

    await world.connectWorld();
}

window.addEventListener("load", () => {
    loadGame();
});

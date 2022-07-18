import World from "./World";

const world = new World();

async function loadGame() {
    world.initWorld();

    await world.createWorld();
    
    window.requestAnimationFrame(() => {
        world.updateWorld();
    });
}

window.addEventListener("load", () => {
    loadGame();
});

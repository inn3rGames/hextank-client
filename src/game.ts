import World from "./world/World";
import "./assets/styles/style.css";
import pkg from "../package.json";

const mainContainer = document.getElementById("main-container") as HTMLElement;

mainContainer.addEventListener("mousedown", (event) => {
    event.preventDefault();
});
mainContainer.addEventListener("mousemove", (event) => {
    event.preventDefault();
});
mainContainer.addEventListener("mouseup", (event) => {
    event.preventDefault();
});
mainContainer.addEventListener("mouseleave", (event) => {
    event.preventDefault();
});

mainContainer.addEventListener("touchstart", (event) => {
    event.preventDefault();
});
mainContainer.addEventListener("toucmove", (event) => {
    event.preventDefault();
});
mainContainer.addEventListener("touchend", (event) => {
    event.preventDefault();
});
mainContainer.addEventListener("touchcancel", (event) => {
    event.preventDefault();
});

mainContainer.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

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

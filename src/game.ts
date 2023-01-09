import World from "./world/World";
import "./assets/styles/style.css";
import pkg from "../package.json";

window.addEventListener("mousedown", (event) => {
    event.preventDefault();
});
window.addEventListener("mousemove", (event) => {
    event.preventDefault();
});
window.addEventListener("mouseup", (event) => {
    event.preventDefault();
});
window.addEventListener("mouseleave", (event) => {
    event.preventDefault();
});

window.addEventListener("touchstart", (event) => {
    event.preventDefault();
});
window.addEventListener("toucmove", (event) => {
    event.preventDefault();
});
window.addEventListener("touchend", (event) => {
    event.preventDefault();
});
window.addEventListener("touchcancel", (event) => {
    event.preventDefault();
});

window.addEventListener("contextmenu", (event) => {
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

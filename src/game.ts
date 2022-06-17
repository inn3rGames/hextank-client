import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { LoadFile } from "@babylonjs/core";

//import ok from "./hextankFinal.glb";


const canvas: HTMLCanvasElement = document.getElementById(
    "hextankgame"
) as HTMLCanvasElement;
const engine = new Engine(canvas, true);

function createScene(): Scene {
    var scene: Scene = new Scene(engine);

    var camera: ArcRotateCamera = new ArcRotateCamera(
        "Camera",
        -Math.PI / 2,
        Math.PI / 2,
        4,
        new Vector3(0, 0.5, 0),
        scene
    );
    camera.attachControl(canvas, true);

    var light1: HemisphericLight = new HemisphericLight(
        "light1",
        new Vector3(1, 1, 0),
        scene
    );

        var hextank = SceneLoader.ImportMesh(null, "assets/", "hextankFinal.glb", scene)
    console.log(hextank);

   
    return scene;
}

var scene: Scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});

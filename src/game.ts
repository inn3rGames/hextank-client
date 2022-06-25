import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
/* import "@babylonjs/loaders/glTF/2.0/glTFLoader"; */
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";

import hextankModel from "./assets/models/hextankFinalDraco.glb";

import skyboxPx from "./assets/textures/skybox/skybox_px.jpg";
import skyboxPy from "./assets/textures/skybox/skybox_py.jpg";
import skyboxPz from "./assets/textures/skybox/skybox_pz.jpg";
import skyboxNx from "./assets/textures/skybox/skybox_nx.jpg";
import skyboxNy from "./assets/textures/skybox/skybox_ny.jpg";
import skyboxNz from "./assets/textures/skybox/skybox_nz.jpg";

const skyboxArray = [
    skyboxPx,
    skyboxPy,
    skyboxPz,
    skyboxNx,
    skyboxNy,
    skyboxNz,
];

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

    var skybox = MeshBuilder.CreateBox(
        "skyBox",
        {
            size: 1000,
        },
        scene
    );
    var skyboxMaterial = new StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture(
        "",
        scene,
        null,
        undefined,
        skyboxArray
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = Color3.FromHexString("#000000");
    skyboxMaterial.specularColor = Color3.FromHexString("#000000");
    skybox.material = skyboxMaterial;

    var hextank = SceneLoader.ImportMesh(
        null,
        "",
        hextankModel,
        scene,
        (meshes) => {
            meshes[0].scaling = new Vector3(0.5, 0.5, -0.5);
        }
    );
    //console.log(hextank);

    return scene;
}

var scene: Scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});

canvas.addEventListener("mousemove", (e) => {
    e.preventDefault();
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
});

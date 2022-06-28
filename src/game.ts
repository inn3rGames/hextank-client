import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
/* import "@babylonjs/loaders/glTF/2.0/glTFLoader"; */
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";

import hextankModel from "./assets/models/hextankFinalDraco.glb";

/* import skyboxPx from "./assets/textures/skybox/skybox_px.jpg";
import skyboxPy from "./assets/textures/skybox/skybox_py.jpg";
import skyboxPz from "./assets/textures/skybox/skybox_pz.jpg";
import skyboxNx from "./assets/textures/skybox/skybox_nx.jpg";
import skyboxNy from "./assets/textures/skybox/skybox_ny.jpg";
import skyboxNz from "./assets/textures/skybox/skybox_nz.jpg"; */

import skyboxPx from "./assets/textures/skybox3/skybox_px.png";
import skyboxPy from "./assets/textures/skybox3/skybox_py.png";
import skyboxPz from "./assets/textures/skybox3/skybox_pz.png";
import skyboxNx from "./assets/textures/skybox3/skybox_nx.png";
import skyboxNy from "./assets/textures/skybox3/skybox_ny.png";
import skyboxNz from "./assets/textures/skybox3/skybox_nz.png";

const skyboxArray = [
    skyboxPx,
    skyboxPy,
    skyboxPz,
    skyboxNx,
    skyboxNy,
    skyboxNz,
];

import sand from "./assets/textures/sand.png";

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
        new Vector3(0, 1, 0),
        scene
    );
    light1.diffuse = Color3.FromHexString("#FFFFFF");
    light1.specular = Color3.FromHexString("#FFFFFF");
    light1.groundColor = Color3.FromHexString("#FFFFFF");
    light1.intensity = 2.5;

    /* var light2: DirectionalLight = new DirectionalLight(
        "light2",
        new Vector3(0, -1, 0),
        scene
    );
    light2.diffuse = Color3.FromHexString("#FFFFFF");
    light2.specular = Color3.FromHexString("#FFFFFF");
    //light2.intensity = 10; */

    //console.log(light1);

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

    var groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = Color3.FromHexString("#D18212");
    let sandTexture = new Texture(sand, scene);
    sandTexture.uScale = 20;
    sandTexture.vScale = 20;
    groundMaterial.diffuseTexture = sandTexture;
    

    var ground = MeshBuilder.CreateGround("ground", { height: 200, width: 200, subdivisions: 0 });
    ground.material = groundMaterial;

    for (let i = 0; i < 100; i++) {
        var hextank = SceneLoader.ImportMesh(
            null,
            "",
            hextankModel,
            scene,
            (meshes) => {
                //meshes[0].scaling = new Vector3(0.5, 0.5, -0.5);
                let hextankMesh = meshes[0];
                hextankMesh.position.x += i * 2;
                /* scene.onKeyboardObservable.add((kbInfo) => {
                    switch (kbInfo.type) {
                        case KeyboardEventTypes.KEYDOWN:
                            console.log("KEY DOWN: ", kbInfo.event.key);
                            hextankMesh.position.x += 0.01;
                            break;
                        case KeyboardEventTypes.KEYUP:
                            console.log("KEY UP: ", kbInfo.event.code);
                            break;
                    }
                }); */
                // console.log(hextankMesh);
            }
        );
    //console.log(hextank);

    }

   
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

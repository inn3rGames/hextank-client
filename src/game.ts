import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";

import hextankModel from "./assets/models/hextankFinalDraco.glb";

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
        Math.PI / 2.2,
        15,
        new Vector3(0, 0.5, 0),
        scene
    );
    camera.lowerBetaLimit = 0.5;
    camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 50;
    camera.attachControl(canvas, true);

    var worldLight: HemisphericLight = new HemisphericLight(
        "worldLight",
        new Vector3(0, 1, 0),
        scene
    );
    worldLight.diffuse = Color3.FromHexString("#FFFFFF");
    worldLight.specular = Color3.FromHexString("#FFFFFF");
    worldLight.groundColor = Color3.FromHexString("#FFFFFF");
    worldLight.intensity = 2.5;

    var directionalLight = new DirectionalLight(
        "directionalLight",
        new Vector3(-0.87, -1, 0),
        scene
    );
    directionalLight.position = new Vector3(0, 10, 0);
    directionalLight.diffuse = Color3.FromHexString("#FFFFFF");
    directionalLight.specular = Color3.FromHexString("#FFFFFF");
    directionalLight.intensity = 2.5;

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

    var groundMaterial = new PBRMetallicRoughnessMaterial(
        "groundMaterial",
        scene
    );
    groundMaterial.baseColor = Color3.FromHexString("#D18212");
    let sandTexture = new Texture(sand, scene);
    sandTexture.uScale = 10;
    sandTexture.vScale = 10;
    groundMaterial.baseTexture = sandTexture;
    groundMaterial.metallic = 0;
    groundMaterial.roughness = 0;

    var ground = MeshBuilder.CreateGround("ground", {
        height: 200,
        width: 200,
        subdivisions: 0,
    });
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    var hextank = SceneLoader.ImportMesh(
        null,
        "",
        hextankModel,
        scene,
        (meshes) => {
            let hextankMesh = meshes[0];
            shadowGenerator.addShadowCaster(hextankMesh, true);
        }
    );

    var torus = MeshBuilder.CreateTorus("torus");
    torus.position.y = 5;
    torus.position.x = 2;

    var shadowGenerator = new ShadowGenerator(1024, directionalLight);
    shadowGenerator.addShadowCaster(torus);
    shadowGenerator.useExponentialShadowMap = false;
    shadowGenerator.usePoissonSampling = false;

    var fpsTexture = AdvancedDynamicTexture.CreateFullscreenUI("FPS");

    var fpsText = new TextBlock();
    fpsText.text = "0";
    fpsText.color = "#FFFFFF";
    fpsText.fontSize = 32;
    fpsText.textHorizontalAlignment = 0;
    fpsText.textVerticalAlignment = 0;
    fpsText.left = 10;
    fpsText.top = 5;
    fpsText.outlineColor = "#000000";
    fpsText.outlineWidth = 5;
    fpsTexture.addControl(fpsText);

    console.log(fpsText);

    scene.registerBeforeRender(function () {
        torus.rotation.x += 0.01;
        torus.rotation.z += 0.02;
        fpsText.text = engine.getFps().toFixed().toString();
    });

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

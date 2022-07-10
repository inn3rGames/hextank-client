import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Culling/ray";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";
//import "@babylonjs/loaders/glTF/glTFFileLoader";

import { Client, Room } from "colyseus.js";

import skyboxPx from "./assets/textures/skybox3/skybox_px.png";
import skyboxPy from "./assets/textures/skybox3/skybox_py.png";
import skyboxPz from "./assets/textures/skybox3/skybox_pz.png";
import skyboxNx from "./assets/textures/skybox3/skybox_nx.png";
import skyboxNy from "./assets/textures/skybox3/skybox_ny.png";
import skyboxNz from "./assets/textures/skybox3/skybox_nz.png";
import sand from "./assets/textures/sand.png";

import HexTank from "./HexTank";

export default class World {
    private _canvas: HTMLCanvasElement;

    private _engine: Engine;

    private _scene: Scene;

    private _camera!: UniversalCamera;

    private _wordlLight!: HemisphericLight;
    private _directionalLight!: DirectionalLight;

    private _skyboxArray!: Array<string>;
    private _skybox!: Mesh;
    private _skyboxMaterial!: StandardMaterial;

    private _groundMaterial!: PBRMetallicRoughnessMaterial;
    private _sandTexture!: Texture;
    private _ground!: Mesh;

    private _torus!: Mesh;

    private _shadowGenerator!: ShadowGenerator;

    private _fpsTexture!: AdvancedDynamicTexture;
    private _fpsText!: TextBlock;

    private _hexTanks!: { [tankId: string]: AbstractMesh };

    private _client!: Client;
    private _room!: Room;

    constructor() {
        this._canvas = document.getElementById(
            "hextankgame"
        ) as HTMLCanvasElement;

        this._engine = new Engine(this._canvas, true);

        this._scene = new Scene(this._engine);
    }

    initWorld() {
        /* this._camera = new ArcRotateCamera(
            "Camera",
            -Math.PI / 2,
            Math.PI / 2.2,
            15,
            new Vector3(0, 0.5, 0),
            this._scene
        ); */
        this._camera = new UniversalCamera(
            "Camera",
            new Vector3(0, 2, 0),
            this._scene
        );
        /* this._camera.lowerBetaLimit = 0.5;
        this._camera.upperBetaLimit = (Math.PI / 2) * 0.9;
        this._camera.lowerRadiusLimit = 3;
        this._camera.upperRadiusLimit = 50; */
        //this._camera.attachControl(this._canvas, true);

        this._wordlLight = new HemisphericLight(
            "wordlLight",
            new Vector3(0, 1, 0),
            this._scene
        );
        this._wordlLight.diffuse = Color3.FromHexString("#FFFFFF");
        this._wordlLight.specular = Color3.FromHexString("#FFFFFF");
        this._wordlLight.groundColor = Color3.FromHexString("#FFFFFF");
        this._wordlLight.intensity = 2.5;

        this._directionalLight = new DirectionalLight(
            "directionalLight",
            new Vector3(-0.87, -1, 0),
            this._scene
        );
        this._directionalLight.position = new Vector3(0, 10, 0);
        this._directionalLight.diffuse = Color3.FromHexString("#FFFFFF");
        this._directionalLight.specular = Color3.FromHexString("#FFFFFF");
        this._directionalLight.intensity = 2.5;

        this._skyboxArray = [
            skyboxPx,
            skyboxPy,
            skyboxPz,
            skyboxNx,
            skyboxNy,
            skyboxNz,
        ];
        this._skybox = MeshBuilder.CreateBox(
            "skyBox",
            {
                size: 1000,
            },
            this._scene
        );
        this._skyboxMaterial = new StandardMaterial("skyBox", this._scene);
        this._skyboxMaterial.backFaceCulling = false;
        this._skyboxMaterial.reflectionTexture = new CubeTexture(
            "",
            this._scene,
            null,
            undefined,
            this._skyboxArray
        );
        this._skyboxMaterial.reflectionTexture.coordinatesMode =
            Texture.SKYBOX_MODE;
        this._skyboxMaterial.diffuseColor = Color3.FromHexString("#000000");
        this._skyboxMaterial.specularColor = Color3.FromHexString("#000000");
        this._skybox.material = this._skyboxMaterial;

        this._groundMaterial = new PBRMetallicRoughnessMaterial(
            "groundMaterial",
            this._scene
        );
        this._sandTexture = new Texture(sand, this._scene);
        this._sandTexture.uScale = 10;
        this._sandTexture.vScale = 10;
        this._groundMaterial.baseTexture = this._sandTexture;
        this._groundMaterial.metallic = 0;
        this._groundMaterial.roughness = 0;
        this._groundMaterial.baseColor = Color3.FromHexString("#D18212");
        this._ground = MeshBuilder.CreateGround("ground", {
            height: 200,
            width: 200,
            subdivisions: 0,
        });
        this._ground.material = this._groundMaterial;
        this._ground.receiveShadows = true;

        this._torus = MeshBuilder.CreateTorus("torus");
        this._torus.position.y = 5;
        this._torus.position.x = 2;

        this._shadowGenerator = new ShadowGenerator(
            1024,
            this._directionalLight
        );
        this._shadowGenerator.useExponentialShadowMap = false;
        this._shadowGenerator.usePoissonSampling = false;
        this._shadowGenerator.addShadowCaster(this._torus);

        this._fpsTexture = AdvancedDynamicTexture.CreateFullscreenUI("FPS");
        this._fpsText = new TextBlock();
        this._fpsText.text = "0";
        this._fpsText.color = "#FFFFFF";
        this._fpsText.fontSize = 32;
        this._fpsText.textHorizontalAlignment = 0;
        this._fpsText.textVerticalAlignment = 0;
        this._fpsText.left = 10;
        this._fpsText.top = 5;
        this._fpsText.outlineColor = "#000000";
        this._fpsText.outlineWidth = 5;
        this._fpsTexture.addControl(this._fpsText);

        this._hexTanks = {};

        window.addEventListener("resize", () => {
            this._engine.resize();
        });

        this._canvas.addEventListener("mousemove", (e) => {
            e.preventDefault();
        });

        this._canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
        });
    }

    async connect() {
        let serverAddress = "wss://gerxml.colyseus.de";
        if (window.location.protocol === "http:") {
            serverAddress = "ws://localhost:2567";
            console.log("%c Development mode.", "background-color: #FFFF00");
        } else {
            console.log("%c Production mode.", "background-color: #00FF00");
        }

        this._client = new Client(serverAddress);
        try {
            this._room = await this._client.join("world_room");
        } catch (e) {
            console.log(e);
        }
    }

    async createWorld() {
        await this.connect();

        console.log(this._client);

        this._room.state.hexTanks.onAdd = async (serverHexTank: any) => {
            var clientHexTank = new HexTank(
                serverHexTank.x,
                serverHexTank.z,
                serverHexTank.id,
                this._scene,
                this._shadowGenerator
            );
            await clientHexTank.loadModel();

            this._hexTanks[serverHexTank.id] = clientHexTank.mesh;

            console.log(`HexTank ${serverHexTank.id} joined at: `, {
                x: serverHexTank.x,
                z: serverHexTank.z,
            });

            serverHexTank.onChange = () => {
                console.log(`HexTank ${serverHexTank.id} moved to: `, {
                    x: serverHexTank.x,
                    z: serverHexTank.z,
                });
            };
        };

        this._room.state.hexTanks.onRemove = (serverHexTank: any) => {
            console.log(`HexTank ${serverHexTank.id} left!`);
            this._hexTanks[serverHexTank.id].dispose();
            delete this._hexTanks[serverHexTank.id];
        };

        this._room.onLeave((code) => {
            //console.log(code);
        });

        this._scene.onPointerDown = (event, pointer) => {
            /* this._room.send("moveHexTank", {
                x: pointer.pickedPoint!.x,
                z: pointer.pickedPoint!.z,
            }); */
        };

        this._scene.onKeyboardObservable.add((keyboardInfo) => {
            if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
                if (
                    keyboardInfo.event.key === "ArrowUp" ||
                    keyboardInfo.event.key === "w" ||
                    keyboardInfo.event.key === "W"
                ) {
                    this._room.send("up");
                }
                if (
                    keyboardInfo.event.key === "ArrowDown" ||
                    keyboardInfo.event.key === "s" ||
                    keyboardInfo.event.key === "S"
                ) {
                    this._room.send("down");
                }
                if (
                    keyboardInfo.event.key === "ArrowLeft" ||
                    keyboardInfo.event.key === "a" ||
                    keyboardInfo.event.key === "A"
                ) {
                    this._room.send("left");
                }
                if (
                    keyboardInfo.event.key === "ArrowRight" ||
                    keyboardInfo.event.key === "d" ||
                    keyboardInfo.event.key === "D"
                ) {
                    this._room.send("right");
                }
            }
        });
    }

    updateWorld(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        this._scene.registerBeforeRender(() => {
            this._torus.rotation.x += 0.01;
            this._torus.rotation.z += 0.02;
            this._fpsText.text = this._engine.getFps().toFixed().toString();

            for (let index in this._hexTanks) {
                this._hexTanks[index].position.x =
                    this._room.state.hexTanks[index].x;
                this._hexTanks[index].position.z =
                    this._room.state.hexTanks[index].z;
                this._hexTanks[index].rotation.y =
                    this._room.state.hexTanks[index].angle;

                if (this._room.sessionId === index) {
                    //this._camera.setTarget(this._hexTanks[index].position);
                    this._camera.position.x =
                        this._hexTanks[index].position.x;
                    this._camera.position.z =
                        this._hexTanks[index].position.z - 7;
                    this._camera.position.y =
                        this._hexTanks[index].position.y + 2;
                    //this._camera.rotation.y += 0.01; 
                }
            }
        });
    }
}
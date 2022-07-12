import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Culling/ray";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";

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

    private _camera!: ArcRotateCamera;

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

    private _up: Boolean = false;
    private _down: Boolean = false;
    private _left: Boolean = false;
    private _right: Boolean = false;

    private _linearInperpolationPercent: number = 0.2;

    constructor() {
        this._canvas = document.getElementById(
            "hextankgame"
        ) as HTMLCanvasElement;

        this._engine = new Engine(this._canvas, true);

        this._scene = new Scene(this._engine);
    }

    initWorld() {
        this._camera = new ArcRotateCamera(
            "Camera",
            0,
            Math.PI / 2 - 5 * (Math.PI / 180),
            7,
            new Vector3(0, 2, 0),
            this._scene
        );

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
            new Vector3(1, -1, 0),
            this._scene
        );
        this._directionalLight.position = new Vector3(0, 100, 0);
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
        this._torus.position.x = 0;

        this._shadowGenerator = new ShadowGenerator(
            1024,
            this._directionalLight
        );
        this._shadowGenerator.useExponentialShadowMap = true;
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

        window.addEventListener("keydown", (event) => {
            if (
                event.key === "ArrowUp" ||
                event.key === "w" ||
                event.key === "W"
            ) {
                this._up = true;
            }
            if (
                event.key === "ArrowDown" ||
                event.key === "s" ||
                event.key === "S"
            ) {
                this._down = true;
            }
            if (
                event.key === "ArrowLeft" ||
                event.key === "a" ||
                event.key === "A"
            ) {
                this._left = true;
            }
            if (
                event.key === "ArrowRight" ||
                event.key === "d" ||
                event.key === "D"
            ) {
                this._right = true;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (
                event.key === "ArrowUp" ||
                event.key === "w" ||
                event.key === "W"
            ) {
                this._up = false;
            }
            if (
                event.key === "ArrowDown" ||
                event.key === "s" ||
                event.key === "S"
            ) {
                this._down = false;
            }
            if (
                event.key === "ArrowLeft" ||
                event.key === "a" ||
                event.key === "A"
            ) {
                this._left = false;
            }
            if (
                event.key === "ArrowRight" ||
                event.key === "d" ||
                event.key === "D"
            ) {
                this._right = false;
            }
        });
    }

    private _monitorKeys() {
        if (this._up === true) {
            this._room.send("up");
        }
        if (this._down === true) {
            this._room.send("down");
        }
        if (this._left === true) {
            this._room.send("left");
        }
        if (this._right === true) {
            this._room.send("right");
        }
    }

    private _linearInterpolation(
        start: number,
        end: number,
        percent: number
    ): number {
        let difference = Math.round(Math.abs(end - start) * 1000) / 1000;
        if (difference === 0) {
            return end;
        } else {
            return start + (end - start) * percent;
        }
    }

    private _updateHexTanks() {
        for (let index in this._hexTanks) {
            let clientHexTank = this._hexTanks[index];
            let serverHexTank = this._room.state.hexTanks[index];

            clientHexTank.position.x = this._linearInterpolation(
                clientHexTank.position.x,
                serverHexTank.x,
                this._linearInperpolationPercent
            );

            clientHexTank.position.z = this._linearInterpolation(
                clientHexTank.position.z,
                serverHexTank.z,
                this._linearInperpolationPercent
            );
            clientHexTank.rotation.y = this._linearInterpolation(
                clientHexTank.rotation.y,
                serverHexTank.angle,
                this._linearInperpolationPercent
            );

            if (this._room.sessionId === index) {
                this._camera.alpha = -clientHexTank.rotation.y;
                this._camera.target.x = clientHexTank.position.x;
                this._camera.target.z = clientHexTank.position.z;
            }
        }
    }

    updateWorld(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        this._scene.registerBeforeRender(() => {
            this._torus.rotation.x += 0.01;
            this._torus.rotation.z += 0.02;
            this._fpsText.text = this._engine.getFps().toFixed().toString();

            this._monitorKeys();
            this._updateHexTanks();
        });
    }
}

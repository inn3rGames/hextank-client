import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Logger } from "@babylonjs/core/Misc/logger";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Culling/ray";
import "@babylonjs/loaders/glTF/2.0/";

import { Client, Room } from "colyseus.js";

import skyboxPx from "./assets/textures/skybox/skybox_px.png";
import skyboxPy from "./assets/textures/skybox/skybox_py.png";
import skyboxPz from "./assets/textures/skybox/skybox_pz.png";
import skyboxNx from "./assets/textures/skybox/skybox_nx.png";
import skyboxNy from "./assets/textures/skybox/skybox_ny.png";
import skyboxNz from "./assets/textures/skybox/skybox_nz.png";
import sand from "./assets/textures/sand.png";

import body from "./assets/models/hexTankBody.glb";
import jet from "./assets/models/hexTankJet.glb";
import wall from "./assets/models/wall.glb";

import HexTank from "./HexTank";
import StaticCircleEntity from "./StaticCircleEntity";
import StaticRectangleEntity from "./StaticRectangleEntity";

export default class World {
    private _bodyMesh!: Array<Mesh>;
    private _jetMesh!: Array<Mesh>;
    private _wallMesh!: Mesh;

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
    private _worldSize: number = 500;

    private _torus!: Mesh;

    private _shadowGenerator!: ShadowGenerator;
    private _meshesWithShadow: Map<string, AbstractMesh | Mesh> = new Map();

    private _fpsTexture!: AdvancedDynamicTexture;
    private _fpsText!: TextBlock;

    private _hexTanks: Map<string, HexTank> = new Map();
    private _staticCircleEntities: Map<string, StaticCircleEntity> = new Map();
    private _staticRectangleEntities: Map<string, StaticRectangleEntity> =
        new Map();

    private _client!: Client;
    private _room!: Room;

    private _fpsLimit: number = 60;
    private _lastFrame: number = 0;
    private _currentFrame: number = 0;
    private _delta: number = 1000 / this._fpsLimit;
    private _fixedFrameDuration: number = 1000 / this._fpsLimit;
    private _elapsedTime: number = Math.round(this._fixedFrameDuration);
    private _resetElapsedTime: boolean = true;

    private _lastWindowWidth = window.innerWidth;
    private _currentWindowWidth = window.innerWidth;
    private _lastWindowHeight = window.innerHeight;
    private _currentWindowHeight = window.innerHeight;

    private _debug: boolean = false;

    constructor() {
        this._canvas = document.getElementById(
            "hextankgame"
        ) as HTMLCanvasElement;

        const log = console.log;
        console.log = () => {};
        this._engine = new Engine(this._canvas, true);
        console.log = log;

        this._scene = new Scene(this._engine);
        this._scene.detachControl();

        this._scene.clearColor = Color4.FromHexString("#000000");
        this._scene.autoClear = false;
        this._scene.autoClearDepthAndStencil = false;
        this._scene.blockMaterialDirtyMechanism = true;
        this._scene.skipPointerMovePicking = true;
        this._scene.freezeActiveMeshes(true);
    }

    private async _loadMeshes() {
        Logger.LogLevels = Logger.NoneLogLevel;

        const loadedBody = await SceneLoader.ImportMeshAsync(
            null,
            "",
            body,
            this._scene
        );
        this._bodyMesh = loadedBody.meshes as Array<Mesh>;
        this._bodyMesh.forEach((item) => item.setEnabled(false));

        const loadedJet = await SceneLoader.ImportMeshAsync(
            null,
            "",
            jet,
            this._scene
        );
        this._jetMesh = loadedJet.meshes as Array<Mesh>;
        this._jetMesh.forEach((item) => item.setEnabled(false));

        const loadedWall = await SceneLoader.ImportMeshAsync(
            null,
            "",
            wall,
            this._scene
        );
        this._wallMesh = loadedWall.meshes[1] as Mesh;
        this._wallMesh.setEnabled(false);
    }

    async initWorld() {
        await this._loadMeshes();

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
            new Vector3(1, -1, 1),
            this._scene
        );
        this._directionalLight.position = new Vector3(
            -this._worldSize * 0.5,
            100,
            -this._worldSize * 0.5
        );
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
                size: 2500,
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
        this._sandTexture.uScale = 10 * (this._worldSize / 200);
        this._sandTexture.vScale = 10 * (this._worldSize / 200);
        this._groundMaterial.baseTexture = this._sandTexture;
        this._groundMaterial.metallic = 0;
        this._groundMaterial.roughness = 0;
        this._groundMaterial.baseColor = Color3.FromHexString("#D18212");
        this._ground = MeshBuilder.CreateGround("ground", {
            height: this._worldSize,
            width: this._worldSize,
            subdivisions: 0,
        });
        this._ground.material = this._groundMaterial;
        this._ground.receiveShadows = true;

        this._torus = MeshBuilder.CreateTorus("torus");
        this._torus.position.y = 5;
        this._torus.position.x = 0;
        this._meshesWithShadow.set("torus", this._torus);

        this._shadowGenerator = new ShadowGenerator(
            1024,
            this._directionalLight
        );
        this._shadowGenerator.useExponentialShadowMap = true;
        this._shadowGenerator.usePoissonSampling = false;

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
            this._debug = true;
        } else {
            console.log("%c Production mode.", "background-color: #00FF00");
            this._debug = false;
        }

        this._client = new Client(serverAddress);
        try {
            this._room = await this._client.join("world_room");
        } catch (e) {
            if (this._debug === true) {
                console.log(e);
            }
        }
    }

    private _setHexTanksCallbacks() {
        this._room.state.hexTanks.onAdd = (serverHexTank: any) => {
            const clientHexTank = new HexTank(
                serverHexTank,
                this._room,
                this._scene,
                this._camera,
                this._meshesWithShadow,
                this._bodyMesh,
                this._jetMesh,
                this._debug
            );
            clientHexTank.loadMeshes();

            this._hexTanks.set(serverHexTank.id, clientHexTank);

            if (this._room.sessionId === clientHexTank.id) {
                clientHexTank.enableInput();
            }

            if (this._debug === true) {
                console.log(`HexTank ${serverHexTank.id} joined at: `, {
                    x: serverHexTank.x,
                    z: serverHexTank.z,
                });
            }
        };

        this._room.state.hexTanks.onRemove = (serverHexTank: any) => {
            if (this._debug === true) {
                console.log(`HexTank ${serverHexTank.id} left!`);
            }

            if (typeof serverHexTank !== "undefined") {
                if (
                    typeof this._hexTanks.get(serverHexTank.id) !== "undefined"
                ) {
                    this._hexTanks.get(serverHexTank.id)!.deleteMeshes();
                    this._hexTanks.delete(serverHexTank.id);
                }
            }
        };
    }

    private _setStaticCirclesCallbacks() {
        this._room.state.staticCircleEntities.onAdd = (
            serverStaticCircleEntity: any
        ) => {
            const clientStaticEntity = new StaticCircleEntity(
                serverStaticCircleEntity,
                this._scene,
                this._meshesWithShadow
            );
            clientStaticEntity.drawEntity();
            this._staticCircleEntities.set(
                serverStaticCircleEntity.id,
                clientStaticEntity
            );
        };

        this._room.state.staticCircleEntities.onRemove = (
            serverStaticCircleEntity: any
        ) => {
            if (typeof serverStaticCircleEntity !== "undefined") {
                if (
                    typeof this._staticCircleEntities.get(
                        serverStaticCircleEntity.id
                    ) !== "undefined"
                ) {
                    this._staticCircleEntities
                        .get(serverStaticCircleEntity.id)!
                        .deleteMeshes();
                    this._staticCircleEntities.delete(
                        serverStaticCircleEntity.id
                    );
                }
            }
        };
    }

    private _setStaticRetanglesCallbacks() {
        this._room.state.staticRectangleEntities.onAdd = (
            serverStaticRectangleEntity: any
        ) => {
            const clientStaticEntity = new StaticRectangleEntity(
                serverStaticRectangleEntity,
                this._meshesWithShadow,
                this._wallMesh
            );
            clientStaticEntity.loadMesh();
            this._staticRectangleEntities.set(
                serverStaticRectangleEntity.id,
                clientStaticEntity
            );
        };

        this._room.state.staticRectangleEntities.onRemove = (
            serverStaticRectangleEntity: any
        ) => {
            if (typeof serverStaticRectangleEntity !== "undefined") {
                if (
                    typeof this._staticRectangleEntities.get(
                        serverStaticRectangleEntity.id
                    ) !== "undefined"
                ) {
                    this._staticRectangleEntities
                        .get(serverStaticRectangleEntity.id)!
                        .deleteMeshes();
                    this._staticRectangleEntities.delete(
                        serverStaticRectangleEntity.id
                    );
                }
            }
        };
    }

    private _focusRegained() {
        this._resetElapsedTime = true;

        this._lastFrame = performance.now();

        this._hexTanks.forEach((value, key) => {
            const clientHexTank = value;
            const serverHexTank = this._room.state.hexTanks.get(key);
            if (
                typeof clientHexTank !== "undefined" &&
                typeof serverHexTank !== "undefined"
            ) {
                clientHexTank.setPosition(serverHexTank);
            }
        });
    }

    async createWorld() {
        await this.connect();

        if (this._debug === true) {
            console.log(this._client);
        }

        this._setHexTanksCallbacks();
        this._setStaticCirclesCallbacks();
        this._setStaticRetanglesCallbacks();

        for (let i = 0; i < 0; i++) {
            const serverHexTank = {
                x: Math.random() * 500,
                z: Math.random() * 500,
                angle: Math.random() * 500,
                id: Math.random() * 500,
            };
            const clientHexTank = new HexTank(
                serverHexTank,
                this._room,
                this._scene,
                this._camera,
                this._meshesWithShadow,
                this._bodyMesh,
                this._jetMesh,
                this._debug
            );
            clientHexTank.loadMeshes();
        }

        window.addEventListener("focus", () => {
            this._focusRegained();
        });
    }

    private _updateHexTanks() {
        this._hexTanks.forEach((value, key) => {
            const clientHexTank = value;
            const serverHexTank = this._room.state.hexTanks.get(key);
            if (
                typeof clientHexTank !== "undefined" &&
                typeof serverHexTank !== "undefined"
            ) {
                if (this._room.sessionId !== key) {
                    clientHexTank.syncWithServer(serverHexTank);
                } else {
                    clientHexTank.update(serverHexTank);
                }
            }
        });
    }

    private _updateShadows() {
        this._shadowGenerator.getShadowMap()!.renderList!.length = 0;

        this._meshesWithShadow.forEach((value) => {
            const curentMesh = value;

            const dX = this._camera.target.x - curentMesh.position.x;
            const dZ = this._camera.target.z - curentMesh.position.z;

            const distance = Math.sqrt(dX * dX + dZ * dZ);

            if (distance <= 100) {
                /* this._shadowGenerator
                    .getShadowMap()!
                    .renderList!.push(curentMesh); */
                if (
                    curentMesh.name.includes("body") === true ||
                    curentMesh.name.includes("wall") === true
                ) {
                    const children = curentMesh.getChildMeshes();
                    for (let j = 0; j < children.length; j++) {
                        this._shadowGenerator
                            .getShadowMap()!
                            .renderList!.push(children[j]);
                    }
                }
            }
        });
    }

    private _fixedUpdate() {
        this._torus.rotation.x += 0.01;
        this._torus.rotation.z += 0.02;

        this._updateHexTanks();
        this._updateShadows();
        this._scene.render();
    }

    private _handleResize() {
        this._currentWindowWidth = window.innerWidth;
        this._currentWindowHeight = window.innerHeight;

        if (this._currentWindowWidth !== this._lastWindowWidth) {
            this._engine.resize(true);

            this._lastWindowWidth = this._currentWindowWidth;
            this._lastWindowHeight = this._currentWindowHeight;
        }

        if (this._currentWindowHeight !== this._lastWindowHeight) {
            this._engine.resize(true);

            this._lastWindowWidth = this._currentWindowWidth;
            this._lastWindowHeight = this._currentWindowHeight;
        }
    }

    updateWorld(): void {
        this._fpsText.text = `Simulated: ${+this._engine
            .getFps()
            .toFixed()
            .toString()}, Real: ${(
            (this._fixedFrameDuration / this._delta) *
            this._fpsLimit
        )
            .toFixed()
            .toString()}`;

        this._currentFrame = performance.now();
        this._delta = this._currentFrame - this._lastFrame;
        this._lastFrame = this._currentFrame;

        this._elapsedTime += this._delta;

        if (
            Math.abs(this._elapsedTime) >= 200 ||
            this._resetElapsedTime === true
        ) {
            this._resetElapsedTime = false;
            this._elapsedTime = Math.round(this._fixedFrameDuration);
        }

        while (this._elapsedTime >= this._fixedFrameDuration) {
            this._elapsedTime -= this._fixedFrameDuration;
            this._fixedUpdate();
        }

        window.requestAnimationFrame(() => {
            this._handleResize();
            this.updateWorld();
        });
    }
}

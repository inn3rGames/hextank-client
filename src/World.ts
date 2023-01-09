import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ScenePerformancePriority } from "@babylonjs/core/scene";
import { SceneOptimizer } from "@babylonjs/core/Misc/sceneOptimizer";
import { SceneOptimizerOptions } from "@babylonjs/core/Misc/sceneOptimizer";
import { MergeMeshesOptimization } from "@babylonjs/core/Misc/sceneOptimizer";
import { TextureOptimization } from "@babylonjs/core/Misc/sceneOptimizer";
import { PostProcessesOptimization } from "@babylonjs/core/Misc/sceneOptimizer";
import { LensFlaresOptimization } from "@babylonjs/core/Misc/sceneOptimizer";
import { ParticlesOptimization } from "@babylonjs/core/Misc/sceneOptimizer";
import { RenderTargetsOptimization } from "@babylonjs/core/Misc/sceneOptimizer";
import { HardwareScalingOptimization } from "@babylonjs/core/Misc/sceneOptimizer";
import { ShadowsOptimization } from "@babylonjs/core/Misc/sceneOptimizer";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
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
import { Logger } from "@babylonjs/core/Misc/logger";
import { DracoCompression } from "@babylonjs/core/Meshes/Compression/dracoCompression";
import { KhronosTextureContainer2 } from "@babylonjs/core/Misc/khronosTextureContainer2";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Culling/ray";
import "@babylonjs/loaders/glTF/2.0/";
import "@babylonjs/core/Materials/Textures/Loaders/ktxTextureLoader";

import { Client, Room } from "colyseus.js";
import screenfull from "screenfull";
import HubApi, { SignedTransaction } from "@nimiq/hub-api";
import { v1 as uuidv1 } from "uuid";
import Plausible from "plausible-tracker";

import body from "./assets/models/hexTankBody.glb";
import jet from "./assets/models/hexTankJet.glb";
import wall from "./assets/models/wall.glb";
import pyramid from "./assets/models/pyramid.glb";
import oasis from "./assets/models/oasis.glb";
import building1 from "./assets/models/building1.glb";
import building2 from "./assets/models/building2.glb";
import rock1 from "./assets/models/rock1.glb";
import rock2 from "./assets/models/rock2.glb";
import rock3 from "./assets/models/rock3.glb";
import bullet from "./assets/models/bullet.glb";
import bulletExplosion from "./assets/models/bulletExplosion.glb";
import hexTankExplosion from "./assets/models/hexTankExplosion.glb";

import skyboxPx from "./assets/textures/skybox/skybox_px.jpg";
import skyboxPy from "./assets/textures/skybox/skybox_py.jpg";
import skyboxPz from "./assets/textures/skybox/skybox_pz.jpg";
import skyboxNx from "./assets/textures/skybox/skybox_nx.jpg";
import skyboxNy from "./assets/textures/skybox/skybox_ny.jpg";
import skyboxNz from "./assets/textures/skybox/skybox_nz.jpg";
import sand from "./assets/textures/sand.jpg";

import HexTank from "./HexTank";
import StaticCircleEntity from "./StaticCircleEntity";
import StaticRectangleEntity from "./StaticRectangleEntity";
import Bullet from "./Bullet";
import Explosion from "./Explosion";
import Input from "./Input";

DracoCompression.Configuration = {
    decoder: {
        wasmUrl: "./draco/draco_wasm_wrapper_gltf.js",
        wasmBinaryUrl: "./draco/draco_decoder_gltf.wasm",
        fallbackUrl: "./draco/draco_decoder_gltf.js",
    },
};

KhronosTextureContainer2.URLConfig = {
    jsDecoderModule: "./ktx2/babylon.ktx2Decoder.js",
    wasmUASTCToASTC: "./ktx2/uastc_astc.wasm",
    wasmUASTCToBC7: "./ktx2/uastc_bc7.wasm",
    wasmUASTCToRGBA_UNORM: "./ktx2/uastc_rgba32_unorm.wasm",
    wasmUASTCToRGBA_SRGB: "./ktx2/uastc_rgba32_srgb.wasm",
    jsMSCTranscoder: "./ktx2/msc_basis_transcoder.js",
    wasmMSCTranscoder: "./ktx2/msc_basis_transcoder.wasm",
    wasmZSTDDecoder: "./ktx2/zstddec.wasm",
    wasmUASTCToR8_UNORM: null,
    wasmUASTCToRG8_UNORM: null,
};

export default class World {
    private _modelsMeshes: Map<string, Array<Mesh>> = new Map();

    private _canvas: HTMLCanvasElement;
    private _inGameUI: HTMLDivElement;
    private _splashScreen: HTMLDivElement;
    private _splashScreenContent: HTMLDivElement;
    private _splashScreenTimeout: number = 3000;
    private _homeUI: HTMLDivElement;
    private _roomsButtonContainer: HTMLDivElement;
    private _paidDataContainer: HTMLDivElement;
    private _freeDataContainer: HTMLDivElement;
    private _logo: HTMLDivElement;
    private _restartTextContainer: HTMLDivElement;
    private _formContainer: HTMLFormElement;
    private _inputField: HTMLInputElement;
    private _payButtonContainer: HTMLDivElement;
    private _freeButtonContainer: HTMLDivElement;
    private _devButtonContainer: HTMLDivElement;
    private _twitterButtonContainer: HTMLDivElement;
    private _discordButtonContainer: HTMLDivElement;
    private _hudContainer: HTMLDivElement;
    private _leaderboardContainer: HTMLDivElement;
    private _fullscreenButtonContainer: HTMLDivElement;

    private _engine: Engine;

    private _scene: Scene;

    private _options!: SceneOptimizerOptions;
    private _optimizer!: SceneOptimizer;
    private _didOptimizerStart: boolean = false;
    private _updateCyclesCount: number = 0;

    private _camera!: ArcRotateCamera;

    private _pipeline!: DefaultRenderingPipeline;

    private _wordlLight!: HemisphericLight;
    private _directionalLight!: DirectionalLight;

    private _shadowGenerator!: ShadowGenerator;
    private _nodesWithShadow: Map<string, AbstractMesh | Mesh> = new Map();

    private _hexTanks: Map<string, HexTank> = new Map();
    private _fakeClientHexTank!: HexTank | undefined;
    private _bullets: Map<string, Bullet> = new Map();
    private _explosions: Map<string, Explosion> = new Map();
    private _enableExplosions: boolean = true;

    private _skyboxArray!: Array<string>;
    private _skybox!: Mesh;
    private _skyboxMaterial!: StandardMaterial;

    private _groundMaterial!: PBRMetallicRoughnessMaterial;
    private _sandTexture!: Texture;
    private _ground!: Mesh;
    private _worldSize: number = 500;

    private _client!: Client;
    private _room!: Room;
    private _readyToConnect: boolean = true;

    private _roomData!: { name: string; address: string; type: string };
    private _developmentRooms: Map<
        string,
        { name: string; address: string; type: string }
    > = new Map();
    private _freeRooms: Map<
        string,
        { name: string; address: string; type: string }
    > = new Map();
    private _paidRooms: Map<
        string,
        { name: string; address: string; type: string }
    > = new Map();
    private _fetchedData: Array<{
        key: string;
        address: string;
        type: string;
        players: string;
        ping: string;
    }> = [];
    private _isRoomActive: boolean = false;
    private _roomsOldTime = performance.now();

    private _hubApi!: HubApi;

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

    private _input: Input;

    private _production: boolean = false;

    private _plausible = Plausible({ domain: "hextank.io", hashMode: true });

    constructor() {
        this._canvas = document.getElementById(
            "hextankgame"
        ) as HTMLCanvasElement;

        this._splashScreen = document.getElementById(
            "splash-screen"
        ) as HTMLDivElement;
        this._splashScreenContent = document.getElementById(
            "splash-screen-content"
        ) as HTMLDivElement;
        this._setSplashScreenMessage("Loading...");

        this._homeUI = document.getElementById("home-ui") as HTMLDivElement;
        this._roomsButtonContainer = document.getElementById(
            "rooms-button-container"
        ) as HTMLDivElement;
        this._paidDataContainer = document.getElementById(
            "paid-data-container"
        ) as HTMLDivElement;
        this._freeDataContainer = document.getElementById(
            "free-data-container"
        ) as HTMLDivElement;
        this._logo = document.getElementById("logo") as HTMLDivElement;
        this._restartTextContainer = document.getElementById(
            "restart-text-container"
        ) as HTMLDivElement;
        this._formContainer = document.getElementById(
            "form-container"
        ) as HTMLFormElement;
        this._inputField = document.getElementById(
            "input-field"
        ) as HTMLInputElement;
        this._payButtonContainer = document.getElementById(
            "pay-button-container"
        ) as HTMLDivElement;
        this._freeButtonContainer = document.getElementById(
            "free-button-container"
        ) as HTMLDivElement;
        this._devButtonContainer = document.getElementById(
            "dev-button-container"
        ) as HTMLDivElement;
        this._twitterButtonContainer = document.getElementById(
            "twitter-button-container"
        ) as HTMLDivElement;
        this._discordButtonContainer = document.getElementById(
            "discord-button-container"
        ) as HTMLDivElement;

        this._inGameUI = document.getElementById(
            "in-game-ui"
        ) as HTMLDivElement;
        this._hudContainer = document.getElementById(
            "hud-container"
        ) as HTMLDivElement;
        this._leaderboardContainer = document.getElementById(
            "leaderboard-container"
        ) as HTMLDivElement;
        this._fullscreenButtonContainer = document.getElementById(
            "fullscreen-button-container"
        ) as HTMLDivElement;

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
        this._scene.performancePriority = ScenePerformancePriority.Intermediate;
        this._scene.skipFrustumClipping = true;

        this._options = new SceneOptimizerOptions(60, 500);
        this._options.optimizations.push(new ShadowsOptimization());
        this._options.optimizations.push(new MergeMeshesOptimization());
        this._options.optimizations.push(
            new TextureOptimization(undefined, 256)
        );
        this._options.optimizations.push(new PostProcessesOptimization());
        this._options.optimizations.push(new LensFlaresOptimization());
        this._options.optimizations.push(new ParticlesOptimization());
        this._options.optimizations.push(new RenderTargetsOptimization());
        this._options.optimizations.push(
            new HardwareScalingOptimization(undefined, 2, 0.25)
        );
        this._optimizer = new SceneOptimizer(
            this._scene,
            this._options,
            true,
            false
        );
        this._optimizer.onFailureObservable.add(() => {
            this._shadowGenerator.dispose();
            this._showHomeUI();
        });
        this._optimizer.onNewOptimizationAppliedObservable.add((event) => {
            if (event.priority >= 0) {
                this._shadowGenerator.dispose();
            }
            this._setSplashScreenMessage(
                `Optimizing scene step ${event.priority}`
            );
        });
        this._optimizer.onSuccessObservable.add(() => {
            this._showHomeUI();
        });

        this._setDebugMode();
        this._setServerRooms();
        this._setNimiqNetwork();

        this._input = new Input();
        this._setUICallbacks();

        this._fetchData();

        this._plausible.enableAutoPageviews();
    }

    private _setDebugMode() {
        if (window.location.protocol === "https:") {
            console.log("%c Production mode.", "background-color: #00FF00");
            this._production = true;
        } else {
            console.log("%c Development mode.", "background-color: #FFFF00");
            this._production = false;
        }
    }

    private _setServerRooms() {
        this._freeRooms.set("GERMANY", {
            name: "GERMANY",
            address: "wss://wrbnqh.colyseus.de",
            type: "FREE",
        });
        this._freeRooms.set("USA", {
            name: "USA",
            address: "wss://aq4lds.us-east-vin.colyseus.net",
            type: "FREE",
        });

        if (this._production === false) {
            this._developmentRooms.set("DEVELOPMENT", {
                name: "DEVELOPMENT",
                address: "ws://localhost:2567",
                type: "DEV",
            });
        }
    }

    private _setNimiqNetwork() {
        if (this._production === true) {
            this._hubApi = new HubApi("https://hub.nimiq.com");
        } else {
            this._hubApi = new HubApi("https://hub.nimiq-testnet.com");
        }
    }

    private _setRoomData(roomKey: string, type: string) {
        if (type === "PAID") {
            this._roomData = this._paidRooms.get(roomKey) as {
                name: string;
                address: string;
                type: string;
            };
        }
        if (type === "FREE") {
            this._roomData = this._freeRooms.get(roomKey) as {
                name: string;
                address: string;
                type: string;
            };
        }
        if (type === "DEV") {
            this._roomData = this._developmentRooms.get(roomKey) as {
                name: string;
                address: string;
                type: string;
            };
        }
    }

    private async _fetchNearestRoom(
        roomsList: Map<string, { address: string; type: string }>,
        roomsListType: string
    ): Promise<void> {
        let roomKey = "NONE";
        let roomType = "NONE";
        const roomsArray = Array.from(roomsList.entries());

        const localRoomKey = localStorage.getItem(roomsListType);
        if (localRoomKey === null || localRoomKey === "AUTO") {
            try {
                await Promise.any(
                    roomsArray.map(async (roomData) => {
                        const client = new Client(roomData[1].address);
                        const fetchedRooms = await client.getAvailableRooms();

                        if (roomsListType === "PAID") {
                            if (
                                fetchedRooms[0].clients >=
                                fetchedRooms[0].maxClients - 5
                            ) {
                                throw new Error("Room is full!");
                            }
                        } else {
                            if (
                                fetchedRooms[0].clients >=
                                fetchedRooms[0].maxClients
                            ) {
                                throw new Error("Room is full!");
                            }
                        }

                        roomKey = roomData[0];
                        roomType = roomData[1].type;
                        return roomKey;
                    })
                );
            } catch (error) {
                if (this._production === false) {
                    console.log(error);
                }
            }
        } else {
            roomKey = localRoomKey;
            roomType = roomsListType;
        }

        this._setRoomData(roomKey, roomType);
    }

    private async _fetchRoomsData(
        roomsList: Map<string, { address: string; type: string }>,
        roomsListType: string
    ): Promise<void> {
        const roomsArray = Array.from(roomsList.entries());

        this._fetchedData.push({
            key: "AUTO",
            address: "",
            type: roomsListType,
            players: "",
            ping: "",
        });

        await Promise.all(
            roomsArray.map(async (roomData) => {
                const client = new Client(roomData[1].address);
                const oldTime = performance.now();

                try {
                    const data = await client.getAvailableRooms();
                    const presentTime = performance.now();
                    const currentPing = presentTime - oldTime;

                    let fetchedPlayers;
                    if (roomData[1].type === "PAID") {
                        fetchedPlayers = `${data[0].clients}/${
                            data[0].maxClients - 5
                        }`;
                    } else {
                        fetchedPlayers = `${data[0].clients}/${data[0].maxClients}`;
                    }

                    this._fetchedData.push({
                        key: roomData[0],
                        address: roomData[1].address,
                        type: roomData[1].type,
                        players: fetchedPlayers,
                        ping: Math.floor(currentPing).toString(),
                    });
                } catch (error) {
                    if (this._production === false) {
                        console.log(error);
                    }
                }
            })
        );
    }

    private _createOrUpdateRoomDataRow(
        parent: HTMLElement,
        roomType: string,
        key: string,
        players: string,
        ping: string
    ) {
        const id = roomType.toLowerCase() + "-" + key.toLocaleLowerCase();

        if (document.getElementById(id) === null) {
            const label = document.createElement("label");
            label.id = id;
            parent.appendChild(label);

            const roomDataRow = document.createElement("div");
            roomDataRow.className = "room-data-row";
            label.appendChild(roomDataRow);

            const roomDataSelect = document.createElement("div");
            roomDataSelect.className = "room-data-select";
            roomDataRow.appendChild(roomDataSelect);

            const input = document.createElement("input");
            input.type = "radio";
            input.name = roomType;
            input.value = key;
            roomDataSelect.appendChild(input);

            const roomDataKey = document.createElement("div");
            roomDataKey.className = "room-data-key";
            roomDataKey.textContent = key;
            roomDataRow.appendChild(roomDataKey);

            const roomDataPlayers = document.createElement("div");
            roomDataPlayers.className = "room-data-players";
            roomDataPlayers.textContent = players;
            roomDataRow.appendChild(roomDataPlayers);

            const roomDataPing = document.createElement("div");
            roomDataPing.className = "room-data-ping";
            roomDataPing.textContent = ping;
            roomDataRow.appendChild(roomDataPing);
        } else {
            const label = document.getElementById(id) as HTMLElement;

            const roomDataRow = label.children[0];

            const roomDataKey = roomDataRow.children[1];
            roomDataKey.textContent = key;

            const roomDataPlayers = roomDataRow.children[2];
            roomDataPlayers.textContent = players;

            const roomDataPing = roomDataRow.children[3];
            roomDataPing.textContent = ping;
        }
    }

    private _clearRoomDataRows(parent: HTMLElement) {
        const childrenArray = Array.from(parent.children);

        childrenArray.forEach((element) => {
            if (element.tagName === "LABEL") {
                parent.removeChild(element);
            }
        });
    }

    private _clearAllRoomsDataRows() {
        this._clearRoomDataRows(this._paidDataContainer);
        this._clearRoomDataRows(this._freeDataContainer);
    }

    private async _fetchData() {
        this._fetchedData = [];

        await this._fetchRoomsData(this._paidRooms, "PAID");
        await this._fetchRoomsData(this._freeRooms, "FREE");
        await this._fetchRoomsData(this._developmentRooms, "DEV");

        this._fetchedData.forEach((roomData) => {
            if (roomData.type === "PAID") {
                this._createOrUpdateRoomDataRow(
                    this._paidDataContainer,
                    roomData.type,
                    roomData.key,
                    roomData.players,
                    roomData.ping
                );
            }
            if (roomData.type === "FREE") {
                this._createOrUpdateRoomDataRow(
                    this._freeDataContainer,
                    roomData.type,
                    roomData.key,
                    roomData.players,
                    roomData.ping
                );
            }
        });

        this._setRoomsInputState();

        if (this._production === false) {
            console.log(this._fetchedData);
        }
    }

    private async _entryRoom() {
        if (typeof this._roomData === "undefined") {
            this._setSplashScreenMessage(
                "No room found based on your criteria..."
            );
            setTimeout(() => {
                this._showHomeUI();
            }, this._splashScreenTimeout);

            return;
        }
        if (this._roomData.type === "PAID") {
            const options = {
                appName: "HexTank.io",
                recipient: "NQ31 T9EV J5KN KR79 RR3R MNYB D7D0 XCPN 9LCQ",
                value: 500 * 1e5 + 6 * 500,
                shopLogoUrl: window.location.href + "smallLogo.png",
                fee: 500,
                extraData: `HexTank.io entry fee tx-${uuidv1()}`,
            };

            try {
                const signedTransaction = await this._hubApi.checkout(options);
                this._plausible.trackEvent("PAYMENT");
                await this._sessionStart(signedTransaction);
            } catch (error) {
                console.log(error);
            }
        } else {
            this._plausible.trackEvent("FREE_PLAY");
            await this._sessionStart();
        }
    }

    private _setRoomsInputState() {
        if (localStorage.getItem("PAID") === null) {
            localStorage.setItem("PAID", "AUTO");
        }

        if (localStorage.getItem("FREE") === null) {
            localStorage.setItem("FREE", "AUTO");
        }

        const inputs = document.querySelectorAll(`input[type="radio"]`);
        inputs.forEach((input) => {
            const radioButton = input as HTMLInputElement;
            const parent = radioButton.parentElement
                ?.parentElement as HTMLElement;

            if (radioButton.name === "PAID") {
                if (radioButton.value === localStorage.getItem("PAID")) {
                    radioButton.checked = true;
                }
            }

            if (radioButton.name === "FREE") {
                if (radioButton.value === localStorage.getItem("FREE")) {
                    radioButton.checked = true;
                }
            }

            if (radioButton.checked === true) {
                parent.style.backgroundColor = "#B0B000";
            } else {
                parent.style.backgroundColor = "#FFFF00";
            }
        });
    }

    private _setUICallbacks() {
        if (localStorage.getItem("name") === null) {
            localStorage.setItem("name", "");
        }
        this._inputField.value = localStorage.getItem("name")!;
        this._inputField.addEventListener("keyup", () => {
            localStorage.setItem("name", this._inputField.value);
        });

        this._inputField.addEventListener("keydown", (event) => {
            event.stopPropagation();
        });
        this._inputField.addEventListener("keyup", (event) => {
            event.stopPropagation();
        });

        this._inputField.addEventListener("mousedown", (event) => {
            event.stopPropagation();
            this._formContainer.style.backgroundColor = "#000000";
        });
        this._inputField.addEventListener("mousemove", (event) => {
            event.stopPropagation();
        });
        this._inputField.addEventListener("mouseup", (event) => {
            event.stopPropagation();
        });
        this._inputField.addEventListener("mouseleave", (event) => {
            event.stopPropagation();
        });

        this._inputField.addEventListener("touchstart", (event) => {
            this._formContainer.style.backgroundColor = "#000000";
            event.stopPropagation();
        });
        this._inputField.addEventListener("touchmove", (event) => {
            event.stopPropagation();
        });
        this._inputField.addEventListener("touchend", (event) => {
            event.stopPropagation();
        });
        this._inputField.addEventListener("touchcancel", (event) => {
            event.stopPropagation();
        });

        this._homeUI.addEventListener("mousedown", (event) => {
            event.stopPropagation();
            this._formContainer.style.backgroundColor = "#767676";
        });
        this._homeUI.addEventListener("mouseup", (event) => {
            event.stopPropagation();
        });
        this._homeUI.addEventListener("mouseleave", (event) => {
            event.stopPropagation();
        });

        this._homeUI.addEventListener("touchstart", (event) => {
            event.stopPropagation();
            this._formContainer.style.backgroundColor = "#767676";
        });
        this._homeUI.addEventListener("touchend", (event) => {
            event.stopPropagation();
        });
        this._homeUI.addEventListener("touchcancel", (event) => {
            event.stopPropagation();
        });

        this._roomsButtonContainer.addEventListener(
            "mouseup",
            async (event) => {
                event.preventDefault();

                this._isRoomActive = true;
                window.location.hash = "#rooms";

                this._showSplashScreen("Fetching rooms data...");
                await this._fetchData();
                this._setSplashScreenMessage("Rooms data fetched...");

                this._showHomeUI();
            }
        );

        this._roomsButtonContainer.addEventListener(
            "touchend",
            async (event) => {
                event.preventDefault();

                this._isRoomActive = true;
                window.location.hash = "#rooms";

                this._showSplashScreen("Fetching rooms data...");
                await this._fetchData();
                this._setSplashScreenMessage("Rooms data fetched...");

                this._showHomeUI();
            }
        );

        this._paidDataContainer.addEventListener("change", (event) => {
            const paidSelectors =
                document.querySelectorAll(`input[name="PAID"]`);
            paidSelectors.forEach((input) => {
                const radioButton = input as HTMLInputElement;
                const parent = radioButton.parentElement
                    ?.parentElement as HTMLElement;

                if (radioButton.checked === true) {
                    parent.style.backgroundColor = "#B0B000";
                    localStorage.setItem("PAID", radioButton.value);

                    if (this._production === false) {
                        console.log(radioButton.value);
                    }
                } else {
                    parent.style.backgroundColor = "#FFFF00";
                }
            });
        });

        this._freeDataContainer.addEventListener("change", (event) => {
            const freeSelectors =
                document.querySelectorAll(`input[name="FREE"]`);
            freeSelectors.forEach((input) => {
                const radioButton = input as HTMLInputElement;
                const parent = radioButton.parentElement
                    ?.parentElement as HTMLElement;

                if (radioButton.checked === true) {
                    parent.style.backgroundColor = "#B0B000";
                    localStorage.setItem("FREE", radioButton.value);

                    if (this._production === false) {
                        console.log(radioButton.value);
                    }
                } else {
                    parent.style.backgroundColor = "#FFFF00";
                }
            });
        });

        this._formContainer.addEventListener("submit", (event) => {
            event.preventDefault();
        });

        this._payButtonContainer.addEventListener("mouseup", async (event) => {
            event.preventDefault();

            this._showSplashScreen("Finding nearest paid room...");
            await this._fetchNearestRoom(this._paidRooms, "PAID");
            this._setSplashScreenMessage(
                "Finding nearest paid room finished..."
            );
            await this._entryRoom();
        });

        this._payButtonContainer.addEventListener("touchend", async (event) => {
            event.preventDefault();

            this._showSplashScreen("Finding nearest paid room...");
            await this._fetchNearestRoom(this._paidRooms, "PAID");
            this._setSplashScreenMessage(
                "Finding nearest paid room finished..."
            );
            await this._entryRoom();
        });

        this._freeButtonContainer.addEventListener("mouseup", async (event) => {
            event.preventDefault();

            this._showSplashScreen("Finding nearest free room...");
            await this._fetchNearestRoom(this._freeRooms, "FREE");
            this._setSplashScreenMessage(
                "Finding nearest free room finished..."
            );
            await this._entryRoom();
        });

        this._freeButtonContainer.addEventListener(
            "touchend",
            async (event) => {
                event.preventDefault();

                this._showSplashScreen("Finding nearest free room...");
                await this._fetchNearestRoom(this._freeRooms, "FREE");
                this._setSplashScreenMessage(
                    "Finding nearest free room finished..."
                );
                await this._entryRoom();
            }
        );

        if (this._production === true) {
            this._devButtonContainer.style.display = "none";
        }

        this._devButtonContainer.addEventListener("mouseup", async (event) => {
            event.preventDefault();

            this._showSplashScreen("Finding nearest dev room...");
            await this._fetchNearestRoom(this._developmentRooms, "DEV");
            this._setSplashScreenMessage(
                "Finding nearest dev room finished..."
            );
            await this._entryRoom();
        });

        this._devButtonContainer.addEventListener("touchend", async (event) => {
            event.preventDefault();

            this._showSplashScreen("Finding nearest dev room...");
            await this._fetchNearestRoom(this._developmentRooms, "DEV");
            this._setSplashScreenMessage(
                "Finding nearest dev room finished..."
            );
            await this._entryRoom();
        });

        this._twitterButtonContainer.addEventListener("mouseup", (event) => {
            event.preventDefault();
            window.open("https://twitter.com/HexTank_io");
        });

        this._twitterButtonContainer.addEventListener("touchend", (event) => {
            event.preventDefault();
            window.open("https://twitter.com/HexTank_io");
        });

        this._discordButtonContainer.addEventListener("mouseup", (event) => {
            event.preventDefault();
            window.open("https://discord.gg/mStb7HEnbq");
        });

        this._discordButtonContainer.addEventListener("touchend", (event) => {
            event.preventDefault();
            window.open("https://discord.gg/mStb7HEnbq");
        });

        this._fullscreenButtonContainer.addEventListener("mouseup", (event) => {
            event.preventDefault();
            if (screenfull.isEnabled === true) {
                screenfull.toggle();
            }
        });

        this._fullscreenButtonContainer.addEventListener(
            "touchend",
            (event) => {
                event.preventDefault();
                if (screenfull.isEnabled === true) {
                    screenfull.toggle();
                }
            }
        );

        window.addEventListener("focus", () => {
            this._focusRegained();
        });

        window.addEventListener("blur", () => {
            this._focusLost();
        });

        this._input.enableInput();
    }

    private _showSplashScreen(message: string) {
        this._homeUI.style.display = "none";
        this._inGameUI.style.display = "none";
        this._splashScreen.style.display = "flex";
        this._setSplashScreenMessage(message);
    }

    private _setSplashScreenMessage(message: string) {
        this._splashScreenContent.textContent = message;
    }

    private _showHomeUI() {
        if (window.location.hash === "#rooms") {
            this._isRoomActive = true;
        } else {
            this._isRoomActive = false;
        }
        this._splashScreen.style.display = "none";
        this._inGameUI.style.display = "none";
        this._homeUI.style.display = "flex";
        this._logo.style.display = "block";
        this._restartTextContainer.style.display = "none";
        const child = this._restartTextContainer.children[0] as HTMLDivElement;
        child.textContent = "";
        this._setSplashScreenMessage("Ready to play");
    }

    private _showInGameUI() {
        this._isRoomActive = false;
        this._splashScreen.style.display = "none";
        this._homeUI.style.display = "none";
        this._inGameUI.style.display = "flex";
    }

    private _showRestartUI() {
        this._isRoomActive = false;
        this._splashScreen.style.display = "none";
        this._inGameUI.style.display = "none";
        this._homeUI.style.display = "flex";
        this._logo.style.display = "none";
        this._restartTextContainer.style.display = "flex";
    }

    private _clearItems() {
        this._hexTanks.forEach((item) => {
            item.deleteMeshes();
        });
        this._hexTanks.clear();
        this._bullets.forEach((item) => {
            item.deleteMeshes();
        });
        this._bullets.clear();
    }

    private _sessionEnd() {
        this._readyToConnect = true;
        if (typeof this._room !== "undefined") {
            this._room.removeAllListeners();
            this._room.leave();
        }
        this._clearItems();
        this._showRestartUI();

        if (this._production === false) {
            console.clear();
        }
    }

    private async _sessionStart(signedTransaction?: SignedTransaction) {
        if (this._readyToConnect === true) {
            this._showSplashScreen("Connecting. Allow up to 5 minutes...");
            this._readyToConnect = false;
            this._clearItems();
            await this._connectWorld(signedTransaction);
        }
    }

    private async _loadMesh(model: string, name: string) {
        const loadedModel = await SceneLoader.ImportMeshAsync(
            null,
            "",
            model,
            this._scene
        );
        const meshesArray = loadedModel.meshes as Array<Mesh>;
        meshesArray.forEach((item) => {
            item.setEnabled(false);
            item.setParent(null);
        });
        this._modelsMeshes.set(name, meshesArray);
    }

    private async _loadAssets() {
        Logger.LogLevels = Logger.NoneLogLevel;
        let load = 0;
        const maxLoad = 15;

        await this._loadMesh(body, "body");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(jet, "jet");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(wall, "wall");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(pyramid, "pyramid");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(oasis, "oasis");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(building1, "building1");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(building2, "building2");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(rock1, "rock1");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(rock2, "rock2");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(rock3, "rock3");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(bullet, "bullet");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(bulletExplosion, "bulletExplosion");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        await this._loadMesh(hexTankExplosion, "hexTankExplosion");
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

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
        this._skyboxMaterial = new StandardMaterial(
            "skyBoxMaterial",
            this._scene
        );
        this._skyboxMaterial.backFaceCulling = false;
        this._skyboxMaterial.reflectionTexture = new CubeTexture(
            "",
            this._scene,
            null,
            undefined,
            this._skyboxArray
        );
        this._scene.environmentTexture = this._skyboxMaterial.reflectionTexture;
        this._skyboxMaterial.reflectionTexture.coordinatesMode =
            Texture.SKYBOX_MODE;
        this._skyboxMaterial.diffuseColor = Color3.FromHexString("#000000");
        this._skyboxMaterial.specularColor = Color3.FromHexString("#000000");
        this._skybox.material = this._skyboxMaterial;
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        this._groundMaterial = new PBRMetallicRoughnessMaterial(
            "groundMaterial",
            this._scene
        );
        this._sandTexture = new Texture(sand, this._scene);
        this._sandTexture.uScale = 10 * (this._worldSize / 200);
        this._sandTexture.vScale = 10 * (this._worldSize / 200);
        this._groundMaterial.baseTexture = this._sandTexture;
        this._groundMaterial.metallic = 0.0;
        this._groundMaterial.roughness = 1.0;
        this._groundMaterial.baseColor = Color3.FromHexString("#D18212");
        this._ground = MeshBuilder.CreateGround("ground", {
            height: this._worldSize,
            width: this._worldSize,
            subdivisions: 0,
        });
        this._ground.material = this._groundMaterial;
        this._ground.receiveShadows = true;
        load++;
        this._setSplashScreenMessage(
            `Loading assets ${Math.round((load / maxLoad) * 100)}%`
        );

        const fakeServerHexTank = {
            x: 0,
            z: 0,
            angle: 0,
            collisionBody: { radius: 0 },
            id: "abcde",
            name: "guest",
        };
        this._fakeClientHexTank = new HexTank(
            fakeServerHexTank,
            this._scene,
            this._camera,
            this._nodesWithShadow,
            this._modelsMeshes.get("body")!,
            this._modelsMeshes.get("jet")!,
            this._production
        );
    }

    async loadWorld() {
        this._setSplashScreenMessage("Loading assets...");
        await this._loadAssets();
        this._setSplashScreenMessage("Loading assets finished...");
        this._setSplashScreenMessage("Loading world...");

        this._camera = new ArcRotateCamera(
            "Camera",
            0,
            Math.PI / 2 - 5 * (Math.PI / 180),
            7,
            new Vector3(0, 2, 0),
            this._scene
        );
        this._camera.alpha = -(Math.PI + Math.PI / 2);
        this._camera.target.x = 0;
        this._camera.target.z = -25;

        this._pipeline = new DefaultRenderingPipeline(
            "pipeline",
            false,
            this._scene,
            [this._camera]
        );

        this._pipeline.samples = 4;
        this._pipeline.fxaaEnabled = true;

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

        this._shadowGenerator = new ShadowGenerator(
            1024,
            this._directionalLight
        );
        this._shadowGenerator.useExponentialShadowMap = true;
        this._shadowGenerator.usePoissonSampling = false;

        this._setSplashScreenMessage("Loading world finished...");
    }

    createWorldMap() {
        this._setSplashScreenMessage("Creating world map..");
        const collisionBodyOffset = 1.03;

        const wallWidth = this._worldSize / 5;
        const wallHeight = 10;
        for (let i = 1; i <= 5; i++) {
            new StaticRectangleEntity(
                -this._worldSize * 0.5 + i * wallWidth - wallWidth * 0.5,
                -this._worldSize * 0.5 - wallHeight * 0.5,
                wallWidth * collisionBodyOffset,
                wallHeight * collisionBodyOffset,
                "wall1" + i,
                this._modelsMeshes.get("wall")!,
                this._scene,
                this._nodesWithShadow
            );

            new StaticRectangleEntity(
                this._worldSize * 0.5 + wallHeight * 0.5,
                -this._worldSize * 0.5 + i * wallWidth - wallWidth * 0.5,
                wallHeight * collisionBodyOffset,
                wallWidth * collisionBodyOffset,
                "wall2" + i,
                this._modelsMeshes.get("wall")!,
                this._scene,
                this._nodesWithShadow
            );

            new StaticRectangleEntity(
                this._worldSize * 0.5 - i * wallWidth + wallWidth * 0.5,
                this._worldSize * 0.5 + wallHeight * 0.5,
                wallWidth * collisionBodyOffset,
                wallHeight * collisionBodyOffset,
                "wall3" + i,
                this._modelsMeshes.get("wall")!,
                this._scene,
                this._nodesWithShadow
            );

            new StaticRectangleEntity(
                -this._worldSize * 0.5 - wallHeight * 0.5,
                this._worldSize * 0.5 - i * wallWidth + wallWidth * 0.5,
                wallHeight * collisionBodyOffset,
                wallWidth * collisionBodyOffset,
                "wall4" + i,
                this._modelsMeshes.get("wall")!,
                this._scene,
                this._nodesWithShadow
            );
        }

        new StaticRectangleEntity(
            0,
            Math.sqrt(3) * 32 * 0.5,
            50 * collisionBodyOffset,
            50 * collisionBodyOffset,
            "pyramid1",
            this._modelsMeshes.get("pyramid")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            32,
            -Math.sqrt(3) * 32 * 0.5,
            50 * collisionBodyOffset,
            50 * collisionBodyOffset,
            "pyramid2",
            this._modelsMeshes.get("pyramid")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -32,
            -Math.sqrt(3) * 32 * 0.5,
            50 * collisionBodyOffset,
            50 * collisionBodyOffset,
            "pyramid3",
            this._modelsMeshes.get("pyramid")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            0,
            -110,
            43.75 * collisionBodyOffset,
            "oasis1",
            this._modelsMeshes.get("oasis")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            0,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building1",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -25,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building2",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            25,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building3",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -50,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building4",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            50,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building5",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -75,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building6",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            75,
            150,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building7",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            0,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building8",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -25,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building9",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            25,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building10",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -50,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building11",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            50,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building12",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -75,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building13",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            75,
            110,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building14",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            0,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building15",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -25,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building16",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            25,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building17",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -50,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building18",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            50,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building19",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -75,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building20",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            75,
            190,
            20 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building21",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            0,
            130,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building22",
            this._modelsMeshes.get("building2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            0,
            170,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building23",
            this._modelsMeshes.get("building2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            50,
            130,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building24",
            this._modelsMeshes.get("building2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            50,
            170,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building25",
            this._modelsMeshes.get("building2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -50,
            130,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building26",
            this._modelsMeshes.get("building2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -50,
            170,
            12 * collisionBodyOffset,
            12 * collisionBodyOffset,
            "building27",
            this._modelsMeshes.get("building2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            75,
            130,
            12 * collisionBodyOffset,
            20 * collisionBodyOffset,
            "building28",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            75,
            170,
            12 * collisionBodyOffset,
            20 * collisionBodyOffset,
            "building29",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -75,
            130,
            12 * collisionBodyOffset,
            20 * collisionBodyOffset,
            "building30",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticRectangleEntity(
            -75,
            170,
            12 * collisionBodyOffset,
            20 * collisionBodyOffset,
            "building31",
            this._modelsMeshes.get("building1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -150,
            -100,
            12.25 * collisionBodyOffset,
            "rock1",
            this._modelsMeshes.get("rock1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -140,
            -90,
            12.25 * collisionBodyOffset,
            "rock2",
            this._modelsMeshes.get("rock2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -160,
            -100,
            12.25 * collisionBodyOffset,
            "rock3",
            this._modelsMeshes.get("rock3")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -100,
            -210,
            12.25 * collisionBodyOffset,
            "rock4",
            this._modelsMeshes.get("rock1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -100,
            -190,
            12.25 * collisionBodyOffset,
            "rock5",
            this._modelsMeshes.get("rock2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -100,
            -200,
            12.25 * collisionBodyOffset,
            "rock6",
            this._modelsMeshes.get("rock3")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -170,
            120,
            12.25 * collisionBodyOffset,
            "rock7",
            this._modelsMeshes.get("rock1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -160,
            120,
            12.25 * collisionBodyOffset,
            "rock8",
            this._modelsMeshes.get("rock2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -150,
            120,
            12.25 * collisionBodyOffset,
            "rock9",
            this._modelsMeshes.get("rock3")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            60,
            -210,
            12.25 * collisionBodyOffset,
            "rock10",
            this._modelsMeshes.get("rock1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            50,
            -210,
            12.25 * collisionBodyOffset,
            "rock11",
            this._modelsMeshes.get("rock2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            70,
            -210,
            12.25 * collisionBodyOffset,
            "rock12",
            this._modelsMeshes.get("rock3")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            190,
            170,
            12.25 * collisionBodyOffset,
            "rock13",
            this._modelsMeshes.get("rock1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            200,
            180,
            12.25 * collisionBodyOffset,
            "rock14",
            this._modelsMeshes.get("rock2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            210,
            170,
            12.25 * collisionBodyOffset,
            "rock15",
            this._modelsMeshes.get("rock3")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            190,
            -50,
            12.25 * collisionBodyOffset,
            "rock16",
            this._modelsMeshes.get("rock1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            170,
            -50,
            12.25 * collisionBodyOffset,
            "rock17",
            this._modelsMeshes.get("rock2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            180,
            -50,
            12.25 * collisionBodyOffset,
            "rock18",
            this._modelsMeshes.get("rock3")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            190,
            -200,
            12.25 * collisionBodyOffset,
            "rock19",
            this._modelsMeshes.get("rock1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            200,
            -190,
            12.25 * collisionBodyOffset,
            "rock20",
            this._modelsMeshes.get("rock2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            210,
            -200,
            12.25 * collisionBodyOffset,
            "rock21",
            this._modelsMeshes.get("rock3")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -140,
            -20,
            12.25 * collisionBodyOffset,
            "rock22",
            this._modelsMeshes.get("rock1")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -160,
            -20,
            12.25 * collisionBodyOffset,
            "rock23",
            this._modelsMeshes.get("rock2")!,
            this._scene,
            this._nodesWithShadow
        );

        new StaticCircleEntity(
            -150,
            -30,
            12.25 * collisionBodyOffset,
            "rock24",
            this._modelsMeshes.get("rock3")!,
            this._scene,
            this._nodesWithShadow
        );

        this._splashScreenContent.textContent =
            "Creating world map finished...";
    }

    private async _connect(signedTransaction?: SignedTransaction) {
        this._client = new Client(this._roomData.address);

        try {
            this._room = await this._client.join("world_room", {
                name: this._inputField.value,
                signedTransaction: signedTransaction,
            });
        } catch (error) {
            this._showSplashScreen("Room error...");
            setTimeout(() => {
                this._sessionEnd();
            }, this._splashScreenTimeout);
            if (this._production === false) {
                console.log(error);
            }
        }

        this._input.setRoom(this._room, this._production);
    }

    private _setRestartText(damage: number, roomType: string) {
        const child = this._restartTextContainer.children[0] as HTMLDivElement;

        let restartTextString;
        if (roomType === "PAID") {
            restartTextString = `You won ${damage} NIM!`;
        } else {
            restartTextString = `You dealt ${damage} damage!`;
        }

        child.textContent = restartTextString;
        child.style.fontSize = this._computeFontSize(
            restartTextString.length,
            24,
            12
        );
        child.style.textShadow = this._computeFontStroke(child.style.fontSize);
    }

    private _setHexTanksCallbacks() {
        this._room.state.hexTanks.onAdd = (serverHexTank: any) => {
            const clientHexTank = new HexTank(
                serverHexTank,
                this._scene,
                this._camera,
                this._nodesWithShadow,
                this._modelsMeshes.get("body")!,
                this._modelsMeshes.get("jet")!,
                this._production
            );
            this._hexTanks.set(serverHexTank.id, clientHexTank);
            if (clientHexTank.id === this._room.sessionId) {
                this._showInGameUI();
                if (typeof this._fakeClientHexTank !== "undefined") {
                    this._fakeClientHexTank.deleteMeshes();
                    this._fakeClientHexTank = undefined;
                }
            }

            if (this._production === false) {
                console.log(
                    `${serverHexTank.id} ${serverHexTank.name} ${serverHexTank.userFriendlyAddress} joined at: `,
                    {
                        x: serverHexTank.x,
                        z: serverHexTank.z,
                    }
                );
            }
        };

        this._room.state.hexTanks.onRemove = (serverHexTank: any) => {
            if (typeof serverHexTank !== "undefined") {
                if (
                    typeof this._hexTanks.get(serverHexTank.id) !== "undefined"
                ) {
                    this._hexTanks.get(serverHexTank.id)!.deleteMeshes();
                    this._hexTanks.delete(serverHexTank.id);
                    if (this._room.sessionId === serverHexTank.id) {
                        this._setRestartText(
                            serverHexTank.damage,
                            this._roomData.type
                        );
                        this._sessionEnd();
                    }
                }
            }

            if (this._production === false) {
                console.log(
                    `${serverHexTank.id} ${serverHexTank.name} ${serverHexTank.userFriendlyAddress} left!`
                );
            }
        };

        this._room.onLeave((code) => {
            this._input.setRoom(undefined, false);
            if (code >= 1000) {
                this._showSplashScreen("Room disconnected unexpectedly...");
                setTimeout(() => {
                    this._sessionEnd();
                }, this._splashScreenTimeout);
            }

            if (this._production === false) {
                console.log(code);
            }
        });

        this._room.onError((code, message) => {
            this._showSplashScreen(`Room error ${code} ${message}`);
            setTimeout(() => {
                this._sessionEnd();
            }, this._splashScreenTimeout);
        });
    }

    private _setBulletsCallbacks() {
        this._room.state.bullets.onAdd = (serverBullet: any) => {
            const clientBullet = new Bullet(
                serverBullet,
                this._scene,
                this._nodesWithShadow,
                this._modelsMeshes.get("bullet")!
            );
            this._bullets.set(serverBullet.id, clientBullet);
        };

        this._room.state.bullets.onRemove = (serverBullet: any) => {
            if (typeof serverBullet !== "undefined") {
                if (typeof this._bullets.get(serverBullet.id) !== "undefined") {
                    this._bullets.get(serverBullet.id)!.deleteMeshes();
                    this._bullets.delete(serverBullet.id);
                }
            }
        };
    }

    private _setBulletExplosions() {
        this._room.onMessage("bulletExplosion", (serverMessage) => {
            if (this._enableExplosions === true) {
                const currentBulletExplosion = new Explosion(
                    serverMessage,
                    this._scene,
                    this._modelsMeshes.get("bulletExplosion")!,
                    "bulletExplosion"
                );
                this._explosions.set(serverMessage.id, currentBulletExplosion);
            }
        });
    }

    private _setHexTankExplosions() {
        this._room.onMessage("hexTankExplosion", (serverMessage) => {
            if (this._enableExplosions === true) {
                const currenthexTankExplosion = new Explosion(
                    serverMessage,
                    this._scene,
                    this._modelsMeshes.get("hexTankExplosion")!,
                    "hexTankExplosion"
                );
                this._explosions.set(serverMessage.id, currenthexTankExplosion);
            }
        });
    }

    private _focusRegained() {
        this._enableExplosions = true;

        this._resetElapsedTime = true;
        this._lastFrame = performance.now();

        if (typeof this._room !== undefined) {
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
    }

    private _focusLost() {
        this._enableExplosions = false;

        this._formContainer.style.backgroundColor = "#767676";
    }

    private async _connectWorld(signedTransaction?: SignedTransaction) {
        await this._connect(signedTransaction);

        if (typeof this._room !== "undefined") {
            this._setHexTanksCallbacks();
            this._setBulletsCallbacks();
            this._setBulletExplosions();
            this._setHexTankExplosions();
        } else {
            this._showSplashScreen("Room error...");
            setTimeout(() => {
                this._sessionEnd();
            }, this._splashScreenTimeout);
        }

        if (this._production === false) {
            console.log(this._client);
        }
    }

    private _computeFontSize(
        stringLength: number,
        lengthLimit: number,
        defaultSize: number
    ): string {
        if (stringLength > lengthLimit) {
            return `${(lengthLimit / stringLength) * defaultSize}vmin`;
        } else {
            return `${defaultSize}vmin`;
        }
    }

    private _computeFontStroke(fontSize: string): string {
        const strokeSize = parseFloat(fontSize) / 20;
        return `${strokeSize}vmin ${strokeSize}vmin 0vmin #000000, -${strokeSize}vmin -${strokeSize}vmin 0vmin #000000, -${strokeSize}vmin ${strokeSize}vmin 0vmin #000000, ${strokeSize}vmin -${strokeSize}vmin 0vmin #000000`;
    }

    private _updateHexTanks() {
        let currentHexTanks: Array<HexTank> = [];
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
                currentHexTanks.push(clientHexTank);
            }
        });

        currentHexTanks.sort((a, b) => {
            return b.damage - a.damage;
        });

        const hudDamageTitleElement = this._hudContainer.children[2]
            .children[0] as HTMLDivElement;
        const hudRoomElement = this._hudContainer.children[5]
            .children[1] as HTMLDivElement;

        if (typeof this._roomData !== "undefined") {
            if (this._roomData.type === "PAID") {
                hudDamageTitleElement.textContent = "NIM";
            } else {
                hudDamageTitleElement.textContent = "DAMAGE";
            }
            hudRoomElement.textContent = this._roomData.name;
        } else {
            hudDamageTitleElement.textContent = "DAMAGE";
            hudRoomElement.textContent = "AUTO";
        }

        const hudNumberElement = this._hudContainer.children[0]
            .children[1] as HTMLDivElement;
        hudNumberElement.textContent = "";
        const hudNameElement = this._hudContainer.children[1]
            .children[1] as HTMLDivElement;
        hudNameElement.textContent = "";
        const hudDamageElement = this._hudContainer.children[2]
            .children[1] as HTMLDivElement;
        hudDamageElement.textContent = "";
        const hudKillsElement = this._hudContainer.children[3]
            .children[1] as HTMLDivElement;
        hudKillsElement.textContent = "";
        const hudHealthElement = this._hudContainer.children[4]
            .children[1] as HTMLDivElement;
        hudHealthElement.textContent = "";

        const leaderboardRows = Array.from(this._leaderboardContainer.children);
        leaderboardRows.forEach((value, index) => {
            if (index === 0) {
                const leaderboardTitle = value as HTMLDivElement;
                const leaderboardTitleDamage = leaderboardTitle
                    .children[2] as HTMLDivElement;

                if (typeof this._roomData !== "undefined") {
                    if (this._roomData.type === "PAID") {
                        leaderboardTitleDamage.textContent = "NIM";
                    } else {
                        leaderboardTitleDamage.textContent = "DAMAGE";
                    }
                } else {
                    leaderboardTitleDamage.textContent = "DAMAGE";
                }
            }
            if (index >= 1) {
                const leaderboardRow = value as HTMLDivElement;
                leaderboardRow.style.display = "none";
                const leaderboardName = leaderboardRow
                    .children[1] as HTMLDivElement;
                leaderboardName.textContent = "";
                const leaderboardDamage = leaderboardRow
                    .children[2] as HTMLDivElement;
                leaderboardDamage.textContent = "";
                const leaderboardKills = leaderboardRow
                    .children[3] as HTMLDivElement;
                leaderboardKills.textContent = "";
            }
        });

        currentHexTanks.forEach((value, index) => {
            if (value.id === this._room.sessionId) {
                hudNumberElement.textContent =
                    (index + 1).toString() +
                    " / " +
                    currentHexTanks.length.toString();

                const hudNameValue = value.name.toString();
                hudNameElement.textContent = hudNameValue;
                hudNameElement.style.fontSize = this._computeFontSize(
                    hudNameValue.length,
                    8,
                    3.6
                );
                hudNameElement.style.textShadow = this._computeFontStroke(
                    hudNameElement.style.fontSize
                );

                const hudDamageValue = value.damage.toString();
                hudDamageElement.textContent = hudDamageValue;
                hudDamageElement.style.fontSize = this._computeFontSize(
                    hudDamageValue.length,
                    10,
                    3.6
                );
                hudDamageElement.style.textShadow = this._computeFontStroke(
                    hudDamageElement.style.fontSize
                );

                const hudKillsValue = value.kills.toString();
                hudKillsElement.textContent = hudKillsValue;
                hudKillsElement.style.fontSize = this._computeFontSize(
                    hudKillsValue.length,
                    10,
                    3.6
                );
                hudKillsElement.style.textShadow = this._computeFontStroke(
                    hudKillsElement.style.fontSize
                );

                const hudHealthValue = value.health.toString() + " / 5";
                hudHealthElement.textContent = hudHealthValue;
                hudHealthElement.style.fontSize = this._computeFontSize(
                    hudHealthValue.length,
                    10,
                    3.6
                );
                hudHealthElement.style.textShadow = this._computeFontStroke(
                    hudHealthElement.style.fontSize
                );

                const hudRoomValue = hudRoomElement.textContent as string;
                hudRoomElement.style.fontSize = this._computeFontSize(
                    hudRoomValue.length,
                    10,
                    3.6
                );
                hudRoomElement.style.textShadow = this._computeFontStroke(
                    hudRoomElement.style.fontSize
                );

                if (index + 1 <= 3) {
                    if (index + 1 === 1) {
                        hudNumberElement.style.background =
                            "linear-gradient(135deg, #BF9A47 0%, #FFE233 25%, #FEFDE1 50%, #FFE233 75%, #BF9A47 100%)";
                    }
                    if (index + 1 === 2) {
                        hudNumberElement.style.background =
                            "linear-gradient(135deg, #787878 0%, #B5B5B5 25%, #FFFFFF 50%, #E3E3E3 75%, #787878 100%)";
                    }
                    if (index + 1 === 3) {
                        hudNumberElement.style.background =
                            "linear-gradient(135deg, #844414 0%, #CF7D52 25%, #FCD5BE 50%, #CF7D52 75%, #844414 100%)";
                    }
                } else {
                    hudNumberElement.style.background =
                        "linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(0, 0, 0, 0.5) 100%)";
                }
            }

            if (typeof leaderboardRows[index + 1] !== "undefined") {
                const currentRow = leaderboardRows[index + 1] as HTMLDivElement;
                currentRow.style.display = "flex";

                const rowNameValue = value.name.toString();
                const rowNameElement = currentRow.children[1] as HTMLDivElement;
                rowNameElement.textContent = rowNameValue;
                rowNameElement.style.fontSize = this._computeFontSize(
                    rowNameValue.length,
                    5,
                    2.8
                );
                rowNameElement.style.textShadow = this._computeFontStroke(
                    rowNameElement.style.fontSize
                );

                const rowDamageValue = value.damage.toString();
                const rowDamageElement = currentRow
                    .children[2] as HTMLDivElement;
                rowDamageElement.textContent = rowDamageValue;
                rowDamageElement.style.fontSize = this._computeFontSize(
                    rowDamageValue.length,
                    5,
                    2.8
                );
                rowDamageElement.style.textShadow = this._computeFontStroke(
                    rowDamageElement.style.fontSize
                );

                const rowKillsValue = value.kills.toString();
                const rowKillsElement = currentRow
                    .children[3] as HTMLDivElement;
                rowKillsElement.textContent = rowKillsValue;
                rowKillsElement.style.fontSize = this._computeFontSize(
                    rowKillsValue.length,
                    5,
                    2.8
                );
                rowKillsElement.style.textShadow = this._computeFontStroke(
                    rowKillsElement.style.fontSize
                );
            }
        });
    }

    private _updateBullets() {
        this._bullets.forEach((value, key) => {
            const clientBullet = value;
            const serverBullet = this._room.state.bullets.get(key);
            if (
                typeof clientBullet !== "undefined" &&
                typeof serverBullet !== "undefined"
            ) {
                clientBullet.syncWithServer(serverBullet);
            }
        });
    }

    private _updateShadows() {
        if (this._shadowGenerator.getShadowMap() !== null) {
            this._shadowGenerator.getShadowMap()!.renderList!.length = 0;

            this._nodesWithShadow.forEach((value) => {
                const curentMesh = value;
                const dX = this._camera.target.x - curentMesh.position.x;
                const dZ = this._camera.target.z - curentMesh.position.z;

                const distance = Math.sqrt(dX * dX + dZ * dZ);
                if (distance <= 100) {
                    const children = curentMesh.getChildMeshes();
                    for (let j = 0; j < children.length; j++) {
                        this._shadowGenerator
                            .getShadowMap()!
                            .renderList!.push(children[j]);
                    }
                }
            });
        }
    }

    private _updateExplosions() {
        this._explosions.forEach((value, key) => {
            const explosion = value;
            explosion.update();
            if (explosion.type === "bulletExplosion") {
                if (explosion.age >= 52.5) {
                    explosion.deleteMeshes();
                    this._explosions.delete(key);
                }
            }
            if (explosion.type === "hexTankExplosion") {
                if (explosion.age >= 105) {
                    explosion.deleteMeshes();
                    this._explosions.delete(key);
                }
            }
        });
    }

    private _updateRoomsDataRows() {
        if (this._isRoomActive === true) {
            const roomsCurrentTime = performance.now();
            if (roomsCurrentTime - this._roomsOldTime >= 1000) {
                this._roomsOldTime = roomsCurrentTime;
                this._fetchData();
            }
        }
    }

    private _fixedUpdate() {
        this._updateHexTanks();
        this._updateBullets();
        this._updateShadows();
        this._updateExplosions();
        this._scene.render();
        this._input.update();
        this._updateRoomsDataRows();
    }

    private _resizeInGameUI(width: number, height: number) {
        if (this._input.currentDeviceIsMobile === true) {
            if (width >= height) {
                this._roomsButtonContainer.style.right =
                    "calc(100% - 18.75vmin - 10vmin)";
                this._roomsButtonContainer.style.bottom =
                    "calc(100% - 6vmin - 5vmin)";

                this._hudContainer.style.right =
                    "calc(100% - 40vmin - 0.5vmin - 10vmin)";
                this._hudContainer.style.bottom =
                    "calc(100% - 30vmin - 0.5vmin)";

                this._leaderboardContainer.style.left =
                    "calc(100% - 50vmin - 6.9vmin - 1vmin - 10vmin)";
                this._leaderboardContainer.style.bottom =
                    "calc(100% - 40vmin - 0.5vmin)";

                this._fullscreenButtonContainer.style.left =
                    "calc(100% - 6.9vmin - 0.75vmin - 10vmin)";
                this._fullscreenButtonContainer.style.bottom =
                    "calc(100% - 6.9vmin - 0.75vmin)";

                if (typeof this._input.buttonUp !== "undefined") {
                    this._input.buttonUp.style.left = "20vmin";
                }
                if (typeof this._input.buttonDown !== "undefined") {
                    this._input.buttonDown.style.left = "20vmin";
                }
                if (typeof this._input.buttonLeft !== "undefined") {
                    this._input.buttonLeft.style.right =
                        "calc(20vmin + 15vmin + 1vmin)";
                }
                if (typeof this._input.buttonRight !== "undefined") {
                    this._input.buttonRight.style.right = "20vmin";
                }
                if (typeof this._input.buttonShoot !== "undefined") {
                    this._input.buttonShoot.style.right =
                        "calc(20vmin + 7.5vmin + 0.75vmin";
                }
            } else {
                this._roomsButtonContainer.style.right =
                    "calc(100% - 18.75vmin - 5vmin)";
                this._hudContainer.style.right =
                    "calc(100% - 40vmin - 0.5vmin)";
                this._leaderboardContainer.style.left =
                    "calc(100% - 50vmin - 6.9vmin - 1vmin)";
                this._fullscreenButtonContainer.style.left =
                    "calc(100% - 6.9vmin - 0.75vmin)";

                if (screenfull.isFullscreen === true) {
                    this._roomsButtonContainer.style.bottom =
                        "calc(100% - 6vmin - 10vmin)";
                    this._hudContainer.style.bottom =
                        "calc(100% - 30vmin - 0.5vmin - 10vmin)";
                    this._leaderboardContainer.style.bottom =
                        "calc(100% - 40vmin - 0.5vmin - 10vmin)";
                    this._fullscreenButtonContainer.style.bottom =
                        "calc(100% - 6.9vmin - 0.75vmin - 10vmin)";
                } else {
                    this._roomsButtonContainer.style.bottom =
                        "calc(100% - 6vmin - 5vmin)";
                    this._hudContainer.style.bottom =
                        "calc(100% - 30vmin - 0.5vmin)";
                    this._leaderboardContainer.style.bottom =
                        "calc(100% - 40vmin - 0.5vmin)";
                    this._fullscreenButtonContainer.style.bottom =
                        "calc(100% - 6.9vmin - 0.75vmin)";
                }

                if (typeof this._input.buttonUp !== "undefined") {
                    this._input.buttonUp.style.left = "10vmin";
                }
                if (typeof this._input.buttonDown !== "undefined") {
                    this._input.buttonDown.style.left = "10vmin";
                }
                if (typeof this._input.buttonLeft !== "undefined") {
                    this._input.buttonLeft.style.right =
                        "calc(10vmin + 15vmin + 1vmin)";
                }
                if (typeof this._input.buttonRight !== "undefined") {
                    this._input.buttonRight.style.right = "10vmin";
                }
                if (typeof this._input.buttonShoot !== "undefined") {
                    this._input.buttonShoot.style.right =
                        "calc(10vmin + 7.5vmin + 0.75vmin";
                }
            }
        }
    }

    private _handleResize() {
        this._currentWindowWidth = this._canvas.clientWidth;
        this._currentWindowHeight = this._canvas.clientHeight;

        this._resizeInGameUI(
            this._currentWindowWidth,
            this._currentWindowHeight
        );

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
        if (this._updateCyclesCount < this._fpsLimit) {
            this._updateCyclesCount += 1;
            this._setSplashScreenMessage(
                `Starting scene ${Math.round(
                    (this._updateCyclesCount / this._fpsLimit) * 100
                )}%`
            );
        } else {
            if (this._didOptimizerStart === false) {
                this._didOptimizerStart = true;
                this._optimizer.start();
                this._setSplashScreenMessage("Optimizing scene...");
            }
        }

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
            this._engine.beginFrame();
            this._handleResize();
            this.updateWorld();
            this._engine.endFrame();
        });
    }
}

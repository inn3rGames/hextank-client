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

import skyboxPx from "./assets/textures/skybox/skybox_px.jpg";
import skyboxPy from "./assets/textures/skybox/skybox_py.jpg";
import skyboxPz from "./assets/textures/skybox/skybox_pz.jpg";
import skyboxNx from "./assets/textures/skybox/skybox_nx.jpg";
import skyboxNy from "./assets/textures/skybox/skybox_ny.jpg";
import skyboxNz from "./assets/textures/skybox/skybox_nz.jpg";
import sand from "./assets/textures/sand.jpg";

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
};

export default class World {
    private _modelsMeshes: Map<string, Array<Mesh>> = new Map();

    private _canvas: HTMLCanvasElement;
    private _touchButtonsContainer: HTMLDivElement;
    private _splashScreen: HTMLDivElement;
    private _splashScreenContent: HTMLDivElement;
    private _buttonsModal: HTMLDivElement;
    private _startButtonContainer: HTMLDivElement;
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

    private _skyboxArray!: Array<string>;
    private _skybox!: Mesh;
    private _skyboxMaterial!: StandardMaterial;

    private _groundMaterial!: PBRMetallicRoughnessMaterial;
    private _sandTexture!: Texture;
    private _ground!: Mesh;
    private _worldSize: number = 500;

    private _torus!: Mesh;

    private _shadowGenerator!: ShadowGenerator;
    private _nodesWithShadow: Map<string, AbstractMesh | Mesh> = new Map();

    private _hexTanks: Map<string, HexTank> = new Map();
    private _bullets: Map<string, Bullet> = new Map();
    private _explosions: Map<string, Explosion> = new Map();

    private _client!: Client;
    private _room!: Room;
    private _readyToConnect: boolean = true;

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

    private _input!: Input;

    private _debug: boolean = false;

    constructor() {
        this._canvas = document.getElementById(
            "hextankgame"
        ) as HTMLCanvasElement;

        this._touchButtonsContainer = document.getElementById(
            "touch-buttons-container"
        ) as HTMLDivElement;

        this._splashScreen = document.getElementById(
            "splash-screen"
        ) as HTMLDivElement;

        this._splashScreenContent = document.getElementById(
            "splash-screen-content"
        ) as HTMLDivElement;
        this._splashScreenContent.textContent = "Loading...";

        this._buttonsModal = document.getElementById(
            "buttons-modal"
        ) as HTMLDivElement;

        this._startButtonContainer = document.getElementById(
            "start-button-container"
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

            this._gameStart();
        });

        this._optimizer.onNewOptimizationAppliedObservable.add((event) => {
            if (event.priority >= 0) {
                this._shadowGenerator.dispose();
            }

            this._splashScreenContent.textContent = `Optimizing scene step ${event.priority}`;
        });

        this._optimizer.onSuccessObservable.add(() => {
            this._gameStart();
        });

        this._setUICallbacks();
    }

    private _setUICallbacks() {
        this._startButtonContainer.addEventListener(
            "mouseup",
            async (event) => {
                event.preventDefault();

                await this._startSession();
            }
        );

        this._startButtonContainer.addEventListener(
            "touchend",
            async (event) => {
                event.preventDefault();

                await this._startSession();
            }
        );

        this._fullscreenButtonContainer.addEventListener("mouseup", (event) => {
            event.preventDefault();

            if (screenfull.isEnabled) {
                screenfull.toggle();
            }
        });

        this._fullscreenButtonContainer.addEventListener(
            "touchend",
            (event) => {
                event.preventDefault();

                if (screenfull.isEnabled) {
                    screenfull.toggle();
                }
            }
        );

        window.addEventListener("focus", () => {
            this._focusRegained();
        });

        this._input = new Input();
        this._input.enableInput();
    }

    private _gameStart() {
        this._splashScreenContent.textContent = "Game ready";
        this._splashScreen.style.display = "none";
        this._buttonsModal.style.display = "flex";
    }

    private _gameOver() {
        this._room.removeAllListeners();
        this._room.leave();

        this._hexTanks.forEach((item) => {
            item.deleteMeshes();
        });
        this._hexTanks.clear();
        this._bullets.forEach((item) => {
            item.deleteMeshes();
        });
        this._bullets.clear();

        this._readyToConnect = true;

        this._touchButtonsContainer.style.display = "none";
        this._buttonsModal.style.display = "flex";
        this._startButtonContainer.children[0].textContent = "RESTART";

        if (this._debug === true) {
            console.clear();
        }
    }

    private async _startSession() {
        if (this._readyToConnect === true) {
            this._readyToConnect = false;

            this._hexTanks.forEach((item) => {
                item.deleteMeshes();
            });
            this._hexTanks.clear();
            this._bullets.forEach((item) => {
                item.deleteMeshes();
            });
            this._bullets.clear();

            await this._connectWorld();

            this._touchButtonsContainer.style.display = "block";
            this._buttonsModal.style.display = "none";
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

    private async _loadMeshes() {
        Logger.LogLevels = Logger.NoneLogLevel;
        let load = 0;
        const maxLoad = 13;

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(body, "body");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(jet, "jet");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(wall, "wall");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(pyramid, "pyramid");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(oasis, "oasis");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(building1, "building1");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(building2, "building2");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(rock1, "rock1");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(rock2, "rock2");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(rock3, "rock3");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(bullet, "bullet");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(bulletExplosion, "bulletExplosion");

        load++;
        this._splashScreenContent.textContent = `Loading assets ${Math.round(
            (load / maxLoad) * 100
        )}%`;
        await this._loadMesh(hexTankExplosion, "hexTankExplosion");
    }

    async loadWorld() {
        this._splashScreenContent.textContent = "Loading assets...";
        await this._loadMeshes();
        this._splashScreenContent.textContent = "Loading assets finished...";
        this._splashScreenContent.textContent = "Loading world...";

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

        this._scene.environmentTexture = this._skyboxMaterial.reflectionTexture;

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

        this._torus = MeshBuilder.CreateTorus("torus");
        this._torus.position.y = 5;
        this._torus.position.x = 0;
        this._nodesWithShadow.set("torus", this._torus);

        this._shadowGenerator = new ShadowGenerator(
            1024,
            this._directionalLight
        );
        this._shadowGenerator.useExponentialShadowMap = true;
        this._shadowGenerator.usePoissonSampling = false;

        this._canvas.addEventListener("mousemove", (e) => {
            e.preventDefault();
        });

        this._canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
        });

        this._splashScreenContent.textContent = "Loading world finished...";
    }

    createWorldMap() {
        this._splashScreenContent.textContent = "Creating world map..";
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

    private async _connect() {
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

        this._input.setRoom(this._room, this._debug);
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
                this._debug
            );
            this._hexTanks.set(serverHexTank.id, clientHexTank);

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

                    if (this._room.sessionId === serverHexTank.id) {
                        this._gameOver();
                    }
                }
            }
        };

        this._room.onLeave(() => {
            this._input.setRoom(undefined, false);
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
            const currentBulletExplosion = new Explosion(
                serverMessage,
                this._scene,
                this._modelsMeshes.get("bulletExplosion")!,
                "bulletExplosion"
            );
            this._explosions.set(serverMessage.id, currentBulletExplosion);
        });
    }

    private _setHexTankExplosions() {
        this._room.onMessage("hexTankExplosion", (serverMessage) => {
            const currenthexTankExplosion = new Explosion(
                serverMessage,
                this._scene,
                this._modelsMeshes.get("hexTankExplosion")!,
                "hexTankExplosion"
            );
            this._explosions.set(serverMessage.id, currenthexTankExplosion);
        });
    }

    private _focusRegained() {
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

    private async _connectWorld() {
        await this._connect();

        if (this._debug === true) {
            console.log(this._client);
        }

        this._setHexTanksCallbacks();
        this._setBulletsCallbacks();

        this._setBulletExplosions();
        this._setHexTankExplosions();
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

            this._shadowGenerator.getShadowMap()!.renderList!.push(this._torus);

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

    private _fixedUpdate() {
        this._torus.rotation.x += 0.01;
        this._torus.rotation.z += 0.02;

        this._updateHexTanks();
        this._updateBullets();
        this._updateShadows();
        this._updateExplosions();
        this._scene.render();

        this._input.update();
    }

    private _handleResize() {
        this._currentWindowWidth = this._canvas.clientWidth;
        this._currentWindowHeight = this._canvas.clientHeight;

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
            this._splashScreenContent.textContent = `Starting scene ${Math.round(
                (this._updateCyclesCount / this._fpsLimit) * 100
            )}%`;
        } else {
            if (this._didOptimizerStart === false) {
                this._didOptimizerStart = true;
                this._optimizer.start();
                this._splashScreenContent.textContent = "Optimizing scene...";
            }
        }

        /* this._fpsText.text = `FPS: ${this._engine.getFps().toFixed().toString()}`; */

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

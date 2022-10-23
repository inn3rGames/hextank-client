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
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Logger } from "@babylonjs/core/Misc/logger";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Culling/ray";
import "@babylonjs/loaders/glTF/2.0/";
import "@babylonjs/core/Materials/Textures/Loaders/ktxTextureLoader";

import { Client, Room } from "colyseus.js";

import skyboxPx from "./assets/textures/skybox/skybox_px.jpg";
import skyboxPy from "./assets/textures/skybox/skybox_py.jpg";
import skyboxPz from "./assets/textures/skybox/skybox_pz.jpg";
import skyboxNx from "./assets/textures/skybox/skybox_nx.jpg";
import skyboxNy from "./assets/textures/skybox/skybox_ny.jpg";
import skyboxNz from "./assets/textures/skybox/skybox_nz.jpg";
import sand from "./assets/textures/sand.jpg";
import bulletParticle from "./assets/textures/bulletParticle.png";
import hexTankParticle from "./assets/textures/hexTankParticle.png";

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

import HexTank from "./HexTank";
import StaticCircleEntity from "./StaticCircleEntity";
import StaticRectangleEntity from "./StaticRectangleEntity";
import Bullet from "./Bullet";

export default class World {
    private _modelsMeshes: Map<string, Array<Mesh>> = new Map();

    private _canvas: HTMLCanvasElement;

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

    private _fpsTexture!: AdvancedDynamicTexture;
    private _fpsText!: TextBlock;

    private _hexTanks: Map<string, HexTank> = new Map();
    private _staticCircleEntities: Map<string, StaticCircleEntity> = new Map();
    private _staticRectangleEntities: Map<string, StaticRectangleEntity> =
        new Map();
    private _bullets: Map<string, Bullet> = new Map();

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
        });

        this._optimizer.onNewOptimizationAppliedObservable.add((event) => {
            if (event.priority >= 0) {
                this._shadowGenerator.dispose();
            }
        });
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

        await this._loadMesh(body, "body");
        await this._loadMesh(jet, "jet");
        await this._loadMesh(wall, "wall");
        await this._loadMesh(pyramid, "pyramid");
        await this._loadMesh(oasis, "oasis");
        await this._loadMesh(building1, "building1");
        await this._loadMesh(building2, "building2");
        await this._loadMesh(rock1, "rock1");
        await this._loadMesh(rock2, "rock2");
        await this._loadMesh(rock3, "rock3");
        await this._loadMesh(bullet, "bullet");
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
                this._nodesWithShadow,
                this._modelsMeshes.get("body")!,
                this._modelsMeshes.get("jet")!,
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
                this._nodesWithShadow,
                this._modelsMeshes.get(serverStaticCircleEntity.modelType)!
            );
            clientStaticEntity.loadMeshes();
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
                this._scene,
                this._nodesWithShadow,
                this._modelsMeshes.get(serverStaticRectangleEntity.modelType)!
            );
            clientStaticEntity.loadMeshes();
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

    private _setBulletsCallbacks() {
        this._room.state.bullets.onAdd = (serverBullet: any) => {
            const clientBullet = new Bullet(
                serverBullet,
                this._scene,
                this._nodesWithShadow,
                this._modelsMeshes.get("bullet")!
            );
            clientBullet.loadMeshes();
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
        this._room.onMessage("bulletExplosion", (message) => {
            const explosionLocationX = message.x as number;
            const explosionLocationZ = message.z as number;

            const bulletExplosion = new ParticleSystem(
                "bulletParticles",
                25,
                this._scene
            );
            bulletExplosion.particleTexture = new Texture(bulletParticle);

            bulletExplosion.emitter = new Vector3(
                explosionLocationX,
                1.48,
                explosionLocationZ
            );
            bulletExplosion.manualEmitCount = 25;
            bulletExplosion.createSphereEmitter(0.5);

            bulletExplosion.blendMode = ParticleSystem.BLENDMODE_MULTIPLYADD;

            bulletExplosion.maxSize = 0;
            bulletExplosion.minSize = 0;

            bulletExplosion.updateFunction = (particles) => {
                for (let i = 0; i < particles.length; i++) {
                    const particle = particles[i];

                    particle.age += 1;
                    particle.size += 0.05;
                    particle.color = new Color4(
                        1,
                        1,
                        1,
                        Math.max(1 - particle.age / 100, 0)
                    );
                    if (particle.age >= 100) {
                        bulletExplosion.dispose();
                    }
                }
            };

            bulletExplosion.start();
        });
    }

    private _setHexTankExplosions() {
        this._room.onMessage("hexTankExplosion", (message) => {
            const explosionLocationX = message.x as number;
            const explosionLocationZ = message.z as number;

            const hexTankExplosion = new ParticleSystem(
                "hexTankParticles",
                25,
                this._scene
            );
            hexTankExplosion.particleTexture = new Texture(hexTankParticle);

            hexTankExplosion.emitter = new Vector3(
                explosionLocationX,
                1.48,
                explosionLocationZ
            );
            hexTankExplosion.manualEmitCount = 25;
            hexTankExplosion.createSphereEmitter(1);

            hexTankExplosion.blendMode = ParticleSystem.BLENDMODE_STANDARD;

            hexTankExplosion.maxSize = 0;
            hexTankExplosion.minSize = 0;

            hexTankExplosion.updateFunction = (particles) => {
                for (let i = 0; i < particles.length; i++) {
                    const particle = particles[i];

                    particle.age += 1;
                    particle.size += 0.1;
                    particle.color = new Color4(
                        1,
                        1,
                        1,
                        Math.max(1 - particle.age / 200, 0)
                    );
                    if (particle.age >= 200) {
                        hexTankExplosion.dispose();
                    }
                }
            };

            hexTankExplosion.start();
        });
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
        this._setBulletsCallbacks();

        this._setBulletExplosions();
        this._setHexTankExplosions();

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

    private _fixedUpdate() {
        this._torus.rotation.x += 0.01;
        this._torus.rotation.z += 0.02;

        this._updateHexTanks();
        this._updateBullets();
        this._updateShadows();
        this._scene.render();
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
        } else {
            if (this._didOptimizerStart === false) {
                this._didOptimizerStart = true;
                this._optimizer.start();
            }
        }

        this._fpsText.text = `Priority: ${
            this._optimizer.currentPriorityLevel
        }, FPS: ${this._engine.getFps().toFixed().toString()}`;

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

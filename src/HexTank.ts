import { Scene } from "@babylonjs/core/scene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import HexTankModel from "./assets/models/HexTankFinalDraco.glb";

export default class HexTank {
    private _currentScene: Scene;
    private _currentShadowGenerator: ShadowGenerator;
    mesh!: AbstractMesh;

    constructor(scene: Scene, shadowGenerator: ShadowGenerator) {
        this._currentScene = scene;
        this._currentShadowGenerator = shadowGenerator;
    }

    async loadModel() {
        let result  = await SceneLoader.ImportMeshAsync(null, "", HexTankModel, this._currentScene);
        this.mesh = result.meshes[0];
        this._currentShadowGenerator.addShadowCaster(this.mesh, true);
    }
}

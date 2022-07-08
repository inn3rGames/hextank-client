import { Scene } from "@babylonjs/core/scene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import HexTankModel from "./assets/models/HexTankFinalDraco.glb";

export default class HexTank {
    x: number;
    z: number;
    id: string;
    private _currentScene: Scene;
    private _currentShadowGenerator: ShadowGenerator;
    mesh!: AbstractMesh;

    constructor(
        x: number,
        z: number,
        id: string,
        scene: Scene,
        shadowGenerator: ShadowGenerator
    ) {
        this.x = x;
        this.z = z;
        this.id = id;
        this._currentScene = scene;
        this._currentShadowGenerator = shadowGenerator;
    }

    async loadModel() {
        let result = await SceneLoader.ImportMeshAsync(
            null,
            "",
            HexTankModel,
            this._currentScene
        );
        this.mesh = result.meshes[0];
        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;
        this._currentShadowGenerator.addShadowCaster(this.mesh, true);
    }
}

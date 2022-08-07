import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

export default class StaticCircleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _radius: number;

    private _currentScene: Scene;
    private _currentShadowGenerator: ShadowGenerator;

    private _staticCircleBody?: Mesh;
    private _staticCircleMaterial?: StandardMaterial;

    constructor(
        serverStaticCircleEntity: any,
        scene: Scene,
        shadowGenerator: ShadowGenerator
    ) {
        this._x = serverStaticCircleEntity.x;
        this._z = serverStaticCircleEntity.z;
        this.id = serverStaticCircleEntity.id;
        this._radius = serverStaticCircleEntity.collisionBody.radius;
        this._currentScene = scene;
        this._currentShadowGenerator = shadowGenerator;
    }

    drawEntity() {
        this._staticCircleBody = MeshBuilder.CreateCylinder(
            "staticBody",
            {
                height: 10,
                diameterBottom: 2 * this._radius,
                diameterTop: 0,
            },
            this._currentScene
        );
        this._staticCircleMaterial = new StandardMaterial(
            "staticMaterial",
            this._currentScene
        );
        this._staticCircleBody.material = this._staticCircleMaterial;
        this._staticCircleMaterial.diffuseColor =
            Color3.FromHexString("#FF0000");

        this._staticCircleBody.position.x = this._x;
        this._staticCircleBody.position.y = 5;
        this._staticCircleBody.position.z = this._z;

        this._currentShadowGenerator.addShadowCaster(
            this._staticCircleBody,
            true
        );
    }

    deleteMeshes() {
        if (typeof this._staticCircleBody !== "undefined") {
            this._staticCircleBody.dispose();
        }
    }
}

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export default class StaticEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _radius: number;

    private _currentScene: Scene;

    private _staticBody?: Mesh;
    private _staticMaterial?: StandardMaterial;

    constructor(serverStaticEntity: any, scene: Scene) {
        this._x = serverStaticEntity.x;
        this._z = serverStaticEntity.z;
        this.id = serverStaticEntity.id;
        this._radius = serverStaticEntity.collisionBody.radius;
        this._currentScene = scene;
    }

    drawEntity() {
        this._staticBody = MeshBuilder.CreateCylinder(
            "staticBody",
            {
                height: 10,
                diameterBottom: 2 * this._radius,
                diameterTop: 0,
            },
            this._currentScene
        );
        this._staticMaterial = new StandardMaterial(
            "staticMaterial",
            this._currentScene
        );
        this._staticBody.material = this._staticMaterial;
        this._staticMaterial.diffuseColor = Color3.FromHexString("#FF0000");

        this._staticBody.position.x = this._x;
        this._staticBody.position.y = 5;
        this._staticBody.position.z = this._z;
    }

    deleteMeshes() {
        if (typeof this._staticBody !== "undefined") {
            this._staticBody.dispose();
        }
    }
}

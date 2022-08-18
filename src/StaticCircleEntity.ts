import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export default class StaticCircleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _radius: number;

    private _scene: Scene;
    private _meshesWithShadow: Map<string, AbstractMesh | Mesh>;

    private _staticCircleBody?: Mesh;
    private _staticCircleMaterial?: StandardMaterial;

    constructor(
        serverStaticCircleEntity: any,
        scene: Scene,
        meshesWithShadow: Map<string, AbstractMesh | Mesh>
    ) {
        this._x = serverStaticCircleEntity.x;
        this._z = serverStaticCircleEntity.z;
        this.id = serverStaticCircleEntity.id;
        this._radius = serverStaticCircleEntity.collisionBody.radius;
        this._scene = scene;
        this._meshesWithShadow = meshesWithShadow;
    }

    drawEntity() {
        this._staticCircleBody = MeshBuilder.CreateCylinder(
            "staticBody",
            {
                height: 10,
                diameterBottom: 2 * this._radius,
                diameterTop: 0,
            },
            this._scene
        );
        this._staticCircleMaterial = new StandardMaterial(
            "staticMaterial",
            this._scene
        );
        this._staticCircleBody.material = this._staticCircleMaterial;
        this._staticCircleMaterial.diffuseColor =
            Color3.FromHexString("#000000");
        this._staticCircleMaterial.specularColor =
            Color3.FromHexString("#FFFFFF");
        this._staticCircleMaterial.emissiveColor =
            Color3.FromHexString("#FF0000");

        this._staticCircleBody.position.x = this._x;
        this._staticCircleBody.position.y = 5;
        this._staticCircleBody.position.z = this._z;

        this._staticCircleBody.freezeWorldMatrix();
        this._staticCircleBody.material.freeze();
        this._staticCircleBody.doNotSyncBoundingInfo = true;

        this._meshesWithShadow.set(this.id, this._staticCircleBody);
    }

    deleteMeshes() {
        if (typeof this._staticCircleBody !== "undefined") {
            this._staticCircleBody.dispose();
            this._meshesWithShadow.delete(this.id);
        }
    }
}

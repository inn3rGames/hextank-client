import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export default class StaticRectangleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _width: number;
    private _height: number;

    private _scene: Scene;
    private _meshesWithShadow: Map<string, AbstractMesh | Mesh>;

    private _mesh: AbstractMesh;

    private _meshClone!: AbstractMesh;

    constructor(
        serverStaticRectangleEntity: any,
        scene: Scene,
        meshesWithShadow: Map<string, AbstractMesh | Mesh>,
        mesh: AbstractMesh
    ) {
        this._x = serverStaticRectangleEntity.x;
        this._z = serverStaticRectangleEntity.z;
        this.id = serverStaticRectangleEntity.id;
        this._width = serverStaticRectangleEntity.collisionBody.width;
        this._height = serverStaticRectangleEntity.collisionBody.height;
        this._scene = scene;
        this._meshesWithShadow = meshesWithShadow;
        this._mesh = mesh;
    }

    loadMesh() {
        /*  this._staticRectangleBody = MeshBuilder.CreateBox(
            "staticBody",
            {
                width: this._width,
                height: Math.min(this._width, this._height),
                depth: this._height,
            },
            this._scene
        );
        this._staticRectangleMaterial = new StandardMaterial(
            "staticMaterial",
            this._scene
        );
        this._staticRectangleBody.material = this._staticRectangleMaterial;
        this._staticRectangleMaterial.diffuseColor =
            Color3.FromHexString("#000000");
        this._staticRectangleMaterial.specularColor =
            Color3.FromHexString("#FFFFFF");
        this._staticRectangleMaterial.emissiveColor =
            Color3.FromHexString("#FFFF00");

        this._staticRectangleBody.position.x = this._x;
        this._staticRectangleBody.position.y =
            Math.min(this._width, this._height) * 0.5;
        this._staticRectangleBody.position.z = this._z;

        this._staticRectangleBody.freezeWorldMatrix();
        this._staticRectangleBody.material.freeze();
        this._staticRectangleBody.doNotSyncBoundingInfo = true;

        this._meshesWithShadow.set(this.id, this._staticRectangleBody); */

        this._meshClone = this._mesh.clone("mesh", null)!;
        this._meshClone.setEnabled(true);
        this._meshClone.material?.freeze();
        this._meshClone.doNotSyncBoundingInfo = true;

        this._meshClone.position.x = this._x;
        this._meshClone.position.z = this._z;
        this._meshClone.rotationQuaternion!.toEulerAnglesToRef(
            this._meshClone.rotation
        );
        this._meshClone.rotationQuaternion = null;
        this._meshClone.rotation.setAll(0);

        if (this._height > this._width) {
            this._meshClone.rotation.y = Math.PI / 2;
        }

        this._meshesWithShadow.set(this.id, this._meshClone);
    }

    deleteMeshes() {
        if (typeof this._meshClone !== "undefined") {
            this._meshClone.dispose();
            this._meshesWithShadow.delete(this.id);
        }
    }
}

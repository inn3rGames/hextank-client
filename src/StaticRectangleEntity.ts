import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export default class StaticRectangleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _width: number;
    private _height: number;

    private _meshesWithShadow: Map<string, AbstractMesh | Mesh>;

    private _mesh: AbstractMesh;

    private _meshClone!: AbstractMesh;

    constructor(
        serverStaticRectangleEntity: any,
        meshesWithShadow: Map<string, AbstractMesh | Mesh>,
        mesh: AbstractMesh
    ) {
        this._x = serverStaticRectangleEntity.x;
        this._z = serverStaticRectangleEntity.z;
        this.id = serverStaticRectangleEntity.id;
        this._width = serverStaticRectangleEntity.collisionBody.width;
        this._height = serverStaticRectangleEntity.collisionBody.height;
        this._meshesWithShadow = meshesWithShadow;
        this._mesh = mesh;
    }

    loadMesh() {
        this._meshClone = this._mesh.clone("mesh" + this.id, null)!;
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

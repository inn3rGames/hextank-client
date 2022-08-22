import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";

export default class StaticRectangleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _width: number;
    private _height: number;

    private _meshesWithShadow: Map<string, AbstractMesh | Mesh>;

    private _mesh: Mesh;

    private _meshInstance!: InstancedMesh;

    constructor(
        serverStaticRectangleEntity: any,
        meshesWithShadow: Map<string, AbstractMesh | Mesh>,
        mesh: Mesh
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
        this._meshInstance = this._mesh.createInstance("mesh" + this.id);
        this._meshInstance.material?.freeze();

        this._meshInstance.position.x = this._x;
        this._meshInstance.position.z = this._z;
        this._meshInstance.rotationQuaternion!.toEulerAnglesToRef(
            this._meshInstance.rotation
        );
        this._meshInstance.rotationQuaternion = null;
        this._meshInstance.rotation.setAll(0);

        if (this._height > this._width) {
            this._meshInstance.rotation.y = Math.PI / 2;
        }

        this._meshesWithShadow.set(this.id, this._meshInstance);
    }

    deleteMeshes() {
        if (typeof this._meshInstance !== "undefined") {
            this._meshInstance.dispose();
            this._meshesWithShadow.delete(this.id);
        }
    }
}

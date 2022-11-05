import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

export default class Explosion {
    private _x: number;
    private _z: number;
    private _angle: number;
    id: string;
    private _scene: Scene;

    private _mesh: Array<Mesh>;

    private _node!: TransformNode;

    age: number = 0;
    type: string;

    private _instancedMeshes: Array<InstancedMesh> = [];

    constructor(
        serverMessage: any,
        scene: Scene,
        mesh: Array<Mesh>,
        type: string
    ) {
        this._x = serverMessage.x;
        this._z = serverMessage.z;
        this._angle = serverMessage.angle;
        this.id = serverMessage.id;
        this._scene = scene;
        this._mesh = mesh;
        this.type = type;

        this._loadMeshes();
    }

    private _loadMeshes() {
        this._node = new TransformNode("explosion" + this.id, this._scene);
        this._node.rotationQuaternion = null;
        this._node.rotation.setAll(0);

        this._mesh.forEach((item, index) => {
            if (index > 0) {
                const meshInstance = item.createInstance(
                    "explosionMesh" + this.id + index
                );
                meshInstance.setEnabled(true);
                meshInstance.material!.backFaceCulling = false;
                meshInstance.material?.freeze();

                meshInstance.position.x = item.absolutePosition.x;
                meshInstance.position.y = item.absolutePosition.y + 0.002;
                meshInstance.position.z = item.absolutePosition.z;

                const itemRotation =
                    item.absoluteRotationQuaternion.toEulerAngles();
                meshInstance.rotation.x = itemRotation.x;
                meshInstance.rotation.y = itemRotation.y;
                meshInstance.rotation.z = itemRotation.z;

                meshInstance.scaling.x = item.absoluteScaling.x;
                meshInstance.scaling.y = item.absoluteScaling.y;
                meshInstance.scaling.z = item.absoluteScaling.z;

                meshInstance.setParent(this._node);

                this._instancedMeshes.push(meshInstance);
            }
        });

        this._node.position.x = this._x;
        this._node.position.z = this._z;
        this._node.rotation.y = this._angle;
        this._node.position.y = 1.48;

        this._node.scaling.x = 0;
        this._node.scaling.y = 0;
        this._node.scaling.z = 0;
    }

    deleteMeshes() {
        this._node.dispose();
    }

    update() {
        this.age += 1;

        if (this.type === "bulletExplosion") {
            if (this.age <= 50) {
                this._node.scaling.x += 0.05;
                this._node.scaling.y += 0.05;
                this._node.scaling.z += 0.05;
            }
            if (this.age > 50) {
                this._node.scaling.x -= 0.25;
                this._node.scaling.y -= 0.25;
                this._node.scaling.z -= 0.25;
            }
            if (this._node.scaling.x < 0) {
                this._node.scaling.x = 0;
                this._node.scaling.y = 0;
                this._node.scaling.z = 0;
            }
        }

        if (this.type === "hexTankExplosion") {
            if (this.age <= 100) {
                this._node.scaling.x += 0.1;
                this._node.scaling.y += 0.1;
                this._node.scaling.z += 0.1;
            }
            if (this.age > 100) {
                this._node.scaling.x -= 0.5;
                this._node.scaling.y -= 0.5;
                this._node.scaling.z -= 0.5;
            }
            if (this._node.scaling.x < 0) {
                this._node.scaling.x = 0;
                this._node.scaling.y = 0;
                this._node.scaling.z = 0;
            }
        }
    }
}

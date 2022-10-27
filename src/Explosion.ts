import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
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

    private _clonedMeshes: Array<Mesh> = [];

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
    }

    loadMeshes() {
        this._node = new TransformNode("explosion" + this.id, this._scene);
        this._node.rotationQuaternion = null;
        this._node.rotation.setAll(0);

        this._mesh.forEach((item, index) => {
            if (index > 0) {
                const meshClone = item.clone("explosionMesh" + this.id + index);
                meshClone.setEnabled(true);
                meshClone.material!.backFaceCulling = false;
                meshClone.material?.freeze();

                meshClone.position.x = item.absolutePosition.x;
                meshClone.position.y = item.absolutePosition.y + 0.002;
                meshClone.position.z = item.absolutePosition.z;

                const itemRotation =
                    item.absoluteRotationQuaternion.toEulerAngles();
                meshClone.rotation.x = itemRotation.x;
                meshClone.rotation.y = itemRotation.y;
                meshClone.rotation.z = itemRotation.z;

                meshClone.scaling.x = item.absoluteScaling.x;
                meshClone.scaling.y = item.absoluteScaling.y;
                meshClone.scaling.z = item.absoluteScaling.z;

                meshClone.setParent(this._node);

                this._clonedMeshes.push(meshClone);
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
            this._node.scaling.x += 0.025;
            this._node.scaling.y += 0.025;
            this._node.scaling.z += 0.025;
        }

        if (this.type === "hexTankExplosion") {
            this._node.scaling.x += 0.05;
            this._node.scaling.y += 0.05;
            this._node.scaling.z += 0.05;
        }

        for (let i = 0; i < this._clonedMeshes.length; i++) {
            const clone = this._clonedMeshes[i];

            if (this.type === "bulletExplosion") {
                clone.visibility = Math.max(1 - this.age / 100, 0);
            }

            if (this.type === "hexTankExplosion") {
                clone.visibility = Math.max(1 - this.age / 200, 0);
            }
        }
    }
}

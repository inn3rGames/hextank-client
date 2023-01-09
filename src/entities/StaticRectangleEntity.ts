import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

export default class StaticRectangleEntity {
    private _x: number;
    private _z: number;
    private _width: number;
    private _height: number;
    id: string;
    private _mesh: Array<Mesh>;

    private _scene: Scene;

    private _nodesWithShadow: Map<string, TransformNode>;

    private _node!: TransformNode;

    constructor(
        x: number,
        z: number,
        width: number,
        height: number,
        id: string,
        mesh: Array<Mesh>,
        scene: Scene,
        nodesWithShadow: Map<string, TransformNode>
    ) {
        this._x = x;
        this._z = z;
        this.id = id;
        this._width = width;
        this._height = height;
        this._scene = scene;
        this._nodesWithShadow = nodesWithShadow;
        this._mesh = mesh;

        this.loadMeshes();
    }

    loadMeshes() {
        this._node = new TransformNode(
            "staticRectangleNode" + this.id,
            this._scene
        );
        this._node.rotationQuaternion = null;
        this._node.rotation.setAll(0);
        this._nodesWithShadow.set(this._node.id, this._node);

        this._mesh.forEach((item, index) => {
            if (index > 0) {
                const meshInstance = item.createInstance(
                    "staticRectangleMesh" + this.id + index
                );
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

                meshInstance.scaling.x = item.absoluteScaling.x * 1.001;
                meshInstance.scaling.y = item.absoluteScaling.y;
                meshInstance.scaling.z = item.absoluteScaling.z;

                meshInstance.setParent(this._node);
            }
        });

        this._node.position.x = this._x;
        this._node.position.z = this._z;

        if (this._height > this._width) {
            this._node.rotation.y = Math.PI / 2;
        }
    }

    deleteMeshes() {
        this._node.dispose();
        this._nodesWithShadow.delete(this._node.id);
    }
}

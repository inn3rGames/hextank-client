import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

export default class StaticRectangleEntity {
    private _x: number;
    private _z: number;
    id: string;
    private _scene: Scene;
    private _width: number;
    private _height: number;
    private _nodesWithShadow: Map<string, TransformNode>;

    private _mesh: Array<Mesh>;

    private _node!: TransformNode;

    constructor(
        serverStaticRectangleEntity: any,
        scene: Scene,
        nodesWithShadow: Map<string, TransformNode>,
        mesh: Array<Mesh>
    ) {
        this._x = serverStaticRectangleEntity.x;
        this._z = serverStaticRectangleEntity.z;
        this.id = serverStaticRectangleEntity.id;
        this._width = serverStaticRectangleEntity.collisionBody.width;
        this._height = serverStaticRectangleEntity.collisionBody.height;
        this._scene = scene;
        this._nodesWithShadow = nodesWithShadow;
        this._mesh = mesh;
    }

    loadMeshes() {
        this._node = new TransformNode("body" + this.id, this._scene);
        this._node.rotationQuaternion = null;
        this._node.rotation.setAll(0);
        this._nodesWithShadow.set(this._node.id, this._node);

        this._mesh.forEach((item, index) => {
            if (index > 0) {
                const meshInstance = item.createInstance(
                    "body" + this.id + index
                );
                meshInstance.material?.freeze();

                meshInstance.position.x = item.absolutePosition.x;
                meshInstance.position.y = item.absolutePosition.y;
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

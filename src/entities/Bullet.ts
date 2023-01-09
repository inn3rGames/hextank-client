import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

export default class Bullet {
    private _x: number;
    private _z: number;
    id: string;
    private _scene: Scene;
    private _radius: number;
    private _angle: number;
    private _nodesWithShadow: Map<string, TransformNode>;

    private _linearInperpolationPercent: number = 0.2;

    private _mesh: Array<Mesh>;

    private _node!: TransformNode;

    private _nodeEnabled: boolean = true;
    private _nodeStateCounter: number = 0;

    constructor(
        serverBullet: any,
        scene: Scene,
        nodesWithShadow: Map<string, TransformNode>,
        mesh: Array<Mesh>
    ) {
        this._x = serverBullet.x;
        this._z = serverBullet.z;
        this.id = serverBullet.id;
        this._radius = serverBullet.collisionBody.radius;
        this._angle = serverBullet.angle;
        this._scene = scene;
        this._nodesWithShadow = nodesWithShadow;
        this._mesh = mesh;

        this._loadMeshes();
    }

    private _loadMeshes() {
        this._node = new TransformNode("bulletNode" + this.id, this._scene);
        this._node.rotationQuaternion = null;
        this._node.rotation.setAll(0);
        this._nodesWithShadow.set(this._node.id, this._node);

        this._mesh.forEach((item, index) => {
            if (index > 0) {
                const meshInstance = item.createInstance(
                    "bulletMesh" + this.id + index
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

                meshInstance.scaling.x = item.absoluteScaling.x;
                meshInstance.scaling.y = item.absoluteScaling.y;
                meshInstance.scaling.z = item.absoluteScaling.z;

                meshInstance.setParent(this._node);
            }
        });

        this._node.position.x = this._x;
        this._node.position.z = this._z;
        this._node.rotation.y = this._angle;
    }

    deleteMeshes() {
        this._node.dispose();
        this._nodesWithShadow.delete(this._node.id);
    }

    private _linearInterpolation(
        start: number,
        end: number,
        percent: number
    ): number {
        const difference = Math.round(Math.abs(end - start) * 1000) / 1000;

        if (difference === 0) {
            return end;
        } else {
            return start + (end - start) * percent;
        }
    }

    private _angleInterpolation(
        startAngle: number,
        endAngle: number,
        percent: number
    ) {
        const currentAngle = startAngle;
        let targetAngle = endAngle;
        let differenceBetweenAngles = targetAngle - currentAngle;

        while (differenceBetweenAngles < -Math.PI) {
            targetAngle += 2 * Math.PI;
            differenceBetweenAngles = targetAngle - currentAngle;
        }
        while (differenceBetweenAngles > Math.PI) {
            targetAngle -= 2 * Math.PI;
            differenceBetweenAngles = targetAngle - currentAngle;
        }

        return this._linearInterpolation(currentAngle, targetAngle, percent);
    }

    private _positiveAngle(angle: number): number {
        let computeAngle = angle;
        computeAngle = computeAngle % (2 * Math.PI);
        if (computeAngle < 0) {
            computeAngle += 2 * Math.PI;
        }
        return computeAngle;
    }

    private _updateMesh() {
        this._node.position.x = this._x;
        this._node.position.z = this._z;
        this._node.rotation.y = this._angle;
    }

    private _invinciblityEffect(serverBullet: any) {
        if (serverBullet.invincibility === true) {
            this._nodeStateCounter += 1;
            if (this._nodeStateCounter >= 2) {
                this._nodeStateCounter = 0;
                this._nodeEnabled = !this._nodeEnabled;
            }
            this._node.setEnabled(this._nodeEnabled);
        }
    }

    syncWithServer(serverBullet: any) {
        this._x = this._linearInterpolation(
            this._x,
            serverBullet.x,
            this._linearInperpolationPercent
        );
        this._z = this._linearInterpolation(
            this._z,
            serverBullet.z,
            this._linearInperpolationPercent
        );

        this._angle = this._positiveAngle(
            this._angleInterpolation(
                this._angle,
                serverBullet.angle,
                this._linearInperpolationPercent
            )
        );

        this._updateMesh();
        this._invinciblityEffect(serverBullet);
    }
}

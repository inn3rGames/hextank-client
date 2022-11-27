import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

export default class HexTank {
    private _x: number;
    private _z: number;
    private _angle: number;
    private _radius: number;
    id: string;
    name: string;
    private _scene: Scene;
    private _camera: ArcRotateCamera;
    private _nodesWithShadow: Map<string, TransformNode>;

    private _bodyMesh: Array<Mesh>;
    private _jetMesh: Array<Mesh>;

    private _bodyNode!: TransformNode;
    private _jetNodes: Array<TransformNode> = [];

    private _health: number;
    damage: number;
    kills: number;

    private _healthPlane!: Mesh;
    private _healthUI!: AdvancedDynamicTexture;
    private _healthBar!: Rectangle;
    private _healthStroke!: Rectangle;

    private _linearInperpolationPercent: number = 0.2;

    private _debug: boolean;
    private _debugBody?: Mesh;
    private _debugMaterial?: StandardMaterial;

    constructor(
        serverHexTank: any,
        scene: Scene,
        camera: ArcRotateCamera,
        nodesWithShadow: Map<string, TransformNode>,
        bodyMesh: Array<Mesh>,
        jetMesh: Array<Mesh>,
        debug: boolean
    ) {
        this._x = serverHexTank.x;
        this._z = serverHexTank.z;
        this._angle = serverHexTank.angle;
        this._radius = serverHexTank.collisionBody.radius;
        this.id = serverHexTank.id;
        this.name = serverHexTank.name;
        this._health = serverHexTank.health;
        this.damage = serverHexTank.damage;
        this.kills = serverHexTank.kills;
        this._scene = scene;
        this._camera = camera;
        this._nodesWithShadow = nodesWithShadow;
        this._bodyMesh = bodyMesh;
        this._jetMesh = jetMesh;
        this._debug = debug;

        this._loadMeshes();
    }

    private _loadMeshes() {
        this._bodyNode = new TransformNode("body" + this.id, this._scene);
        this._bodyNode.rotationQuaternion = null;
        this._bodyNode.rotation.setAll(0);
        this._nodesWithShadow.set(this._bodyNode.id, this._bodyNode);

        this._bodyMesh.forEach((item, index) => {
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

                meshInstance.setParent(this._bodyNode);
            }
        });

        this._loadJet("jetFrontLeft");
        this._loadJet("jetFrontRight");
        this._loadJet("jetBackLeft");
        this._loadJet("jetBackRight");

        this._healthPlane = MeshBuilder.CreatePlane("plane", {
            width: 2,
            height: 2,
        });
        this._healthPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;
        this._healthPlane.position.y = 1.9;
        this._healthPlane.setParent(this._bodyNode);

        this._healthUI = AdvancedDynamicTexture.CreateForMesh(
            this._healthPlane,
            1024,
            1024,
            false
        );

        this._healthStroke = new Rectangle();
        this._healthStroke.widthInPixels = 732;
        this._healthStroke.heightInPixels = 152;
        this._healthStroke.cornerRadius = 70;
        this._healthStroke.thickness = 15;
        this._healthStroke.color = "#316E00";
        this._healthStroke.useBitmapCache = true;
        this._healthUI.addControl(this._healthStroke);

        this._healthBar = new Rectangle();
        this._healthBar.widthInPixels = 700;
        this._healthBar.heightInPixels = 120;
        this._healthBar.transformCenterX = 0;
        this._healthBar.thickness = 0;
        this._healthBar.alpha = 0.75;
        this._healthBar.background = "#6DF200";
        this._healthBar.useBitmapCache = true;
        this._healthStroke.addControl(this._healthBar);

        const healthSeparator1 = new Rectangle();
        healthSeparator1.widthInPixels = 15;
        healthSeparator1.heightInPixels = 152;
        healthSeparator1.leftInPixels = -350 + 700 * 0.2;
        healthSeparator1.background = "#316E00";
        healthSeparator1.useBitmapCache = true;
        this._healthStroke.addControl(healthSeparator1);

        const healthSeparator2 = new Rectangle();
        healthSeparator2.widthInPixels = 15;
        healthSeparator2.heightInPixels = 152;
        healthSeparator2.leftInPixels = -350 + 700 * 0.4;
        healthSeparator2.background = "#316E00";
        healthSeparator2.useBitmapCache = true;
        this._healthStroke.addControl(healthSeparator2);

        const healthSeparator3 = new Rectangle();
        healthSeparator3.widthInPixels = 15;
        healthSeparator3.heightInPixels = 152;
        healthSeparator3.leftInPixels = -350 + 700 * 0.6;
        healthSeparator3.background = "#316E00";
        healthSeparator3.useBitmapCache = true;
        this._healthStroke.addControl(healthSeparator3);

        const healthSeparator4 = new Rectangle();
        healthSeparator4.widthInPixels = 15;
        healthSeparator4.heightInPixels = 152;
        healthSeparator4.leftInPixels = -350 + 700 * 0.8;
        healthSeparator4.background = "#316E00";
        healthSeparator4.useBitmapCache = true;
        this._healthStroke.addControl(healthSeparator4);

        const nameText = new TextBlock("name" + this.id, this.name);
        nameText.color = "#FFFFFF";
        nameText.widthInPixels = 1024;
        nameText.heightInPixels = 1024;
        nameText.topInPixels = -200;
        nameText.fontSizeInPixels = 200;
        nameText.fontFamily = "HexTank Font";
        nameText.outlineColor = "#000000";
        nameText.outlineWidth = 20;

        let fontScale = 1024 / (this.name.length * 180);
        if (fontScale >= 1) {
            fontScale = 1;
        }
        if (fontScale <= 0.5) {
            nameText.textWrapping = 2;
            fontScale = 0.5;
        }
        nameText.fontSizeInPixels = 200 * fontScale;
        nameText.outlineWidth = 20 * fontScale;

        this._healthUI.addControl(nameText);

        if (this._debug === true) {
            this._debugBody = MeshBuilder.CreateCylinder("debugBody", {
                height: 0.01,
                diameter: 2 * this._radius,
            });
            this._debugMaterial = new StandardMaterial(
                "debugMaterial",
                this._scene
            );
            this._debugBody.material = this._debugMaterial;
            this._debugMaterial.diffuseColor = Color3.FromHexString("#00FF00");

            this._debugBody.setParent(this._bodyNode);
        }
    }

    private _loadJet(type: string) {
        let jetRootNode = new TransformNode(
            "node" + this.id + type,
            this._scene
        );

        jetRootNode.rotationQuaternion = null;
        jetRootNode.rotation.setAll(0);
        jetRootNode.position.y = 0.5;

        this._jetMesh.forEach((item, index) => {
            if (index > 0) {
                const meshInstance = item.createInstance(
                    "jet" + this.id + index
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

                meshInstance.setParent(jetRootNode);
            }
        });

        if (type === "jetFrontLeft") {
            jetRootNode.position.x = -0.5;
            jetRootNode.position.z = -0.45;
        }
        if (type === "jetFrontRight") {
            jetRootNode.position.x = -0.5;
            jetRootNode.position.z = +0.45;
        }
        if (type === "jetBackLeft") {
            jetRootNode.position.x = +0.5;
            jetRootNode.position.z = -0.45;
        }
        if (type === "jetBackRight") {
            jetRootNode.position.x = +0.5;
            jetRootNode.position.z = +0.45;
        }

        jetRootNode.setParent(this._bodyNode);
        this._jetNodes.push(jetRootNode);
    }

    deleteMeshes() {
        this._bodyNode.dispose();
        this._nodesWithShadow.delete(this._bodyNode.id);
    }

    setPosition(serverHexTank: any) {
        this._x = serverHexTank.x;
        this._z = serverHexTank.z;
        this._angle = serverHexTank.angle;
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
        this._bodyNode.position.x = this._x;
        this._bodyNode.position.z = this._z;
        this._bodyNode.rotation.y = this._angle;
    }

    private _debugBodyCollision(serverHexTank: any) {
        if (
            this._debug === true &&
            typeof this._debugBody !== "undefined" &&
            this._debugBody !== null &&
            typeof this._debugMaterial !== "undefined" &&
            this._debugMaterial !== null
        ) {
            if (serverHexTank.collisionBody.collided === true) {
                this._debugMaterial.diffuseColor =
                    Color3.FromHexString("#FF0000");
            } else {
                this._debugMaterial.diffuseColor =
                    Color3.FromHexString("#00FF00");
            }
        }
    }

    syncWithServer(serverHexTank: any) {
        this._health = serverHexTank.health;
        this.damage = serverHexTank.damage;
        this.kills = serverHexTank.kills;

        this._healthBar.scaleX = this._linearInterpolation(
            this._healthBar.scaleX,
            this._health / 5,
            this._linearInperpolationPercent
        );

        this._x = this._linearInterpolation(
            this._x,
            serverHexTank.x,
            this._linearInperpolationPercent
        );
        this._z = this._linearInterpolation(
            this._z,
            serverHexTank.z,
            this._linearInperpolationPercent
        );

        this._angle = this._positiveAngle(
            this._angleInterpolation(
                this._angle,
                serverHexTank.angle,
                this._linearInperpolationPercent
            )
        );

        for (let i = 0; i < this._jetNodes.length; i++) {
            const currenJetNode = this._jetNodes[i];

            const flame = currenJetNode.getChildren()[0] as InstancedMesh;

            currenJetNode.rotation.z = this._positiveAngle(
                this._angleInterpolation(
                    currenJetNode.rotation.z,
                    serverHexTank.jetsRotationZ,
                    this._linearInperpolationPercent
                )
            );

            currenJetNode.rotation.x = this._positiveAngle(
                this._angleInterpolation(
                    currenJetNode.rotation.x,
                    serverHexTank.jetsRotationX,
                    this._linearInperpolationPercent
                )
            );

            flame.scaling.y = this._linearInterpolation(
                flame.scaling.y,
                serverHexTank.jetsFlameScale,
                this._linearInperpolationPercent
            );
        }

        this._debugBodyCollision(serverHexTank);

        this._updateMesh();
    }

    private _updateCamera() {
        this._camera.alpha = -this._angle;
        this._camera.target.x = this._x;
        this._camera.target.z = this._z;
    }

    update(serverHexTank: any) {
        this.syncWithServer(serverHexTank);
        this._updateCamera();
    }
}

import { Room } from "colyseus.js";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import HexTankModel from "./assets/models/hextankFinalTest3.glb";

export default class HexTank {
    x: number;
    z: number;
    id: string;
    private _room: Room;
    private _currentScene: Scene;
    private _camera: ArcRotateCamera;
    private _currentShadowGenerator: ShadowGenerator;
    mesh!: AbstractMesh;

    private _fpsLimit: number = 60;
    private _convertRadToDegrees: number = 180 / Math.PI;
    private _convertDegreesToRad: number = Math.PI / 180;

    private _speed: number = 0;
    private _speedLimit: number = 1;
    private _speedAcceralation: number =
        1 * (this._speedLimit / this._fpsLimit);
    private _speedDirection: number = 1;
    private _speedDecelerate: boolean = false;
    private _speedPreviousDirection: number = 0;

    private _rotationSpeed: number = 0;
    private _rotationSpeedLimit: number = 5 * this._convertDegreesToRad;
    private _rotationAcceralation =
        (25 / this._fpsLimit) * this._convertDegreesToRad;

    private _linearInperpolationPercent: number = 0.2;
    private _enableClientInterpolation: boolean = false;
    private _latencyLimit: number = 20;

    private _commandsPerFrame: number = 10;

    private _up: number = 0;
    private _down: number = 0;
    private _left: number = 0;
    private _right: number = 0;

    commands: Array<string> = [];

    constructor(
        x: number,
        z: number,
        id: string,
        room: Room,
        scene: Scene,
        camera: ArcRotateCamera,
        shadowGenerator: ShadowGenerator
    ) {
        this.x = x;
        this.z = z;
        this.id = id;
        this._room = room;
        this._currentScene = scene;
        this._camera = camera;
        this._currentShadowGenerator = shadowGenerator;
    }

    async loadModel() {
        let result = await SceneLoader.ImportMeshAsync(
            null,
            "",
            HexTankModel,
            this._currentScene
        );
        this.mesh = result.meshes[0];
        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;
        this.mesh.rotationQuaternion!.toEulerAnglesToRef(this.mesh.rotation);
        this.mesh.rotationQuaternion = null;
        this.mesh.rotation.setAll(0);
        this._currentShadowGenerator.addShadowCaster(this.mesh, true);
    }

    linearInterpolation(start: number, end: number, percent: number): number {
        let difference = Math.round(Math.abs(end - start) * 1000) / 1000;

        if (difference === 0) {
            return end;
        } else {
            return start + (end - start) * percent;
        }
    }

    angleInterpolation(startAngle: number, endAngle: number, percent: number) {
        let currentAngle = startAngle;
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

        return this.linearInterpolation(currentAngle, targetAngle, percent);
    }

    positiveAngle(angle: number): number {
        let computeAngle = angle;
        computeAngle = computeAngle % (2 * Math.PI);
        if (computeAngle < 0) {
            computeAngle += 2 * Math.PI;
        }
        return computeAngle;
    }

    private _getDistance(serverHexTank: any): number {
        let dX = this.mesh.position.x - serverHexTank.x;
        let dZ = this.mesh.position.z - serverHexTank.z;

        return Math.sqrt(dX * dX + dZ * dZ);
    }

    private _rotate(direction: number) {
        let computeAngle = this.mesh.rotation.y;

        this._rotationSpeed += this._rotationAcceralation;
        if (this._rotationSpeed > this._rotationSpeedLimit) {
            this._rotationSpeed = this._rotationSpeedLimit;
        }

        computeAngle += this._rotationSpeed * direction;
        computeAngle = this.positiveAngle(computeAngle);
        this.mesh.rotation.y = computeAngle;
    }

    private _stopRotate() {
        this._rotationSpeed = 0;
    }

    private _move(direction: number) {
        this._speedDecelerate = false;

        if (this._speedPreviousDirection !== direction) {
            this._speed = 0;
        }

        this._speed += this._speedAcceralation;
        if (this._speed > this._speedLimit) {
            this._speed = this._speedLimit;
        }

        this._speedDirection = direction;
        this._speedPreviousDirection = direction;
    }

    private _stopMove() {
        this._speedDecelerate = true;
    }

    enableInput() {
        window.addEventListener("keydown", (event) => {
            if (
                event.key === "ArrowUp" ||
                event.key === "w" ||
                event.key === "W"
            ) {
                this._up = 1;
            }
            if (
                event.key === "ArrowDown" ||
                event.key === "s" ||
                event.key === "S"
            ) {
                this._down = 1;
            }
            if (
                event.key === "ArrowLeft" ||
                event.key === "a" ||
                event.key === "A"
            ) {
                this._left = 1;
            }
            if (
                event.key === "ArrowRight" ||
                event.key === "d" ||
                event.key === "D"
            ) {
                this._right = 1;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (
                event.key === "ArrowUp" ||
                event.key === "w" ||
                event.key === "W"
            ) {
                this._up = 2;
            }
            if (
                event.key === "ArrowDown" ||
                event.key === "s" ||
                event.key === "S"
            ) {
                this._down = 2;
            }
            if (
                event.key === "ArrowLeft" ||
                event.key === "a" ||
                event.key === "A"
            ) {
                this._left = 2;
            }
            if (
                event.key === "ArrowRight" ||
                event.key === "d" ||
                event.key === "D"
            ) {
                this._right = 2;
            }
        });
    }

    private _addCommands() {
        if (
            this._enableClientInterpolation === false &&
            this.commands.length < this._commandsPerFrame
        ) {
            if (this._up === 1) {
                this.commands.push("upKeyDown");
            }
            if (this._down === 1) {
                this.commands.push("downKeyDown");
            }
            if (this._left === 1) {
                this.commands.push("leftKeyDown");
            }
            if (this._right === 1) {
                this.commands.push("rightKeyDown");
            }
            if (this._up === 2) {
                this.commands.push("upKeyUp");
                this._up = 0;
            }
            if (this._down === 2) {
                this.commands.push("downKeyUp");
                this._down = 0;
            }
            if (this._left === 2) {
                this.commands.push("leftKeyUp");
                this._left = 0;
            }
            if (this._right === 2) {
                this.commands.push("rightKeyUp");
                this._right = 0;
            }
        }
    }

    private _processCommands() {
        let currentCommand;
        while (
            typeof (currentCommand = this.commands.shift()) !== "undefined"
        ) {
            if (currentCommand === "upKeyDown") {
                this._room.send("command", "upKeyDown");
                this._move(-1);
            }

            if (currentCommand === "downKeyDown") {
                this._room.send("command", "downKeyDown");
                this._move(1);
            }

            if (currentCommand === "leftKeyDown") {
                this._room.send("command", "leftKeyDown");
                this._rotate(-1);
            }

            if (currentCommand === "rightKeyDown") {
                this._room.send("command", "rightKeyDown");
                this._rotate(1);
            }

            if (currentCommand === "upKeyUp") {
                this._room.send("command", "upKeyUp");
                this._stopMove();
            }

            if (currentCommand === "downKeyUp") {
                this._room.send("command", "downKeyUp");
                this._stopMove();
            }

            if (currentCommand === "leftKeyUp") {
                this._room.send("command", "leftKeyUp");
                this._stopRotate();
            }

            if (currentCommand === "rightKeyUp") {
                this._room.send("command", "rightKeyUp");
                this._stopRotate();
            }
        }
    }

    private _updateMovement() {
        if (this._speedDecelerate === true) {
            this._speed -= this._speedAcceralation;
            if (this._speed <= 0) {
                this._speed = 0;
                this._speedDecelerate = false;
            }
        }

        this.mesh.position.x +=
            this._speed * Math.cos(this.mesh.rotation.y) * this._speedDirection;

        this.mesh.position.z +=
            this._speed *
            -Math.sin(this.mesh.rotation.y) *
            this._speedDirection;
    }

    private _updateCamera() {
        this._camera.alpha = -this.mesh.rotation.y;
        this._camera.target.x = this.mesh.position.x;
        this._camera.target.z = this.mesh.position.z;
    }

    update(serverHexTank: any) {
        let serverClientDistance = this._getDistance(serverHexTank);

        if (
            serverClientDistance >= this._latencyLimit ||
            this._enableClientInterpolation === true
        ) {
            if (this._enableClientInterpolation === false) {
                this._enableClientInterpolation = true;
                console.log("Lag detected!");
            }

            this.mesh.position.x = this.linearInterpolation(
                this.mesh.position.x,
                serverHexTank.x,
                this._linearInperpolationPercent
            );
            this.mesh.position.z = this.linearInterpolation(
                this.mesh.position.z,
                serverHexTank.z,
                this._linearInperpolationPercent
            );

            this.mesh.rotation.y = this.positiveAngle(
                this.angleInterpolation(
                    this.mesh.rotation.y,
                    serverHexTank.angle,
                    this._linearInperpolationPercent
                )
            );

            if (serverClientDistance === 0) {
                this._enableClientInterpolation = false;
            }
        }

        this._addCommands();
        this._processCommands();
        this._updateMovement();
        this._updateCamera();
    }
}

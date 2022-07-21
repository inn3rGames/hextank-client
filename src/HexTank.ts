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

    private _linearInperpolationPercent: number = 0.2;

    private _commandsPerFrame: number = 10;

    private _up: number = 0;
    private _down: number = 0;
    private _left: number = 0;
    private _right: number = 0;

    private _commands: Array<string> = [];

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

    private _linearInterpolation(
        start: number,
        end: number,
        percent: number
    ): number {
        let difference = Math.round(Math.abs(end - start) * 1000) / 1000;

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
        if (this._commands.length <= this._commandsPerFrame) {
            if (this._up === 1) {
                this._commands.push("upKeyDown");
            }
            if (this._down === 1) {
                this._commands.push("downKeyDown");
            }
            if (this._left === 1) {
                this._commands.push("leftKeyDown");
            }
            if (this._right === 1) {
                this._commands.push("rightKeyDown");
            }
            if (this._up === 2) {
                this._commands.push("upKeyUp");
                this._up = 0;
            }
            if (this._down === 2) {
                this._commands.push("downKeyUp");
                this._down = 0;
            }
            if (this._left === 2) {
                this._commands.push("leftKeyUp");
                this._left = 0;
            }
            if (this._right === 2) {
                this._commands.push("rightKeyUp");
                this._right = 0;
            }
        }
    }

    private _processCommands() {
        let currentCommand;
        while (
            typeof (currentCommand = this._commands.shift()) !== "undefined"
        ) {
            if (currentCommand === "upKeyDown") {
                this._room.send("command", "upKeyDown");
            }

            if (currentCommand === "downKeyDown") {
                this._room.send("command", "downKeyDown");
            }

            if (currentCommand === "leftKeyDown") {
                this._room.send("command", "leftKeyDown");
            }

            if (currentCommand === "rightKeyDown") {
                this._room.send("command", "rightKeyDown");
            }

            if (currentCommand === "upKeyUp") {
                this._room.send("command", "upKeyUp");
            }

            if (currentCommand === "downKeyUp") {
                this._room.send("command", "downKeyUp");
            }

            if (currentCommand === "leftKeyUp") {
                this._room.send("command", "leftKeyUp");
            }

            if (currentCommand === "rightKeyUp") {
                this._room.send("command", "rightKeyUp");
            }
        }
    }

    private _updateCamera() {
        this._camera.alpha = -this.mesh.rotation.y;
        this._camera.target.x = this.mesh.position.x;
        this._camera.target.z = this.mesh.position.z;
    }

    syncWithServer(serverHexTank: any) {
        this.mesh.position.x = this._linearInterpolation(
            this.mesh.position.x,
            serverHexTank.x,
            this._linearInperpolationPercent
        );
        this.mesh.position.z = this._linearInterpolation(
            this.mesh.position.z,
            serverHexTank.z,
            this._linearInperpolationPercent
        );

        this.mesh.rotation.y = this._positiveAngle(
            this._angleInterpolation(
                this.mesh.rotation.y,
                serverHexTank.angle,
                this._linearInperpolationPercent
            )
        );
    }

    update(serverHexTank: any) {
        this.syncWithServer(serverHexTank);
        this._addCommands();
        this._processCommands();
        this._updateCamera();
    }
}

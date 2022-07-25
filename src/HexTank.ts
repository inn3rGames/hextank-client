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

    private _defaultControls: boolean = true;
    private _gamepadDidRun: boolean = false;
    private _touchDidRun: boolean = false;

    private _debug: boolean;

    constructor(
        x: number,
        z: number,
        id: string,
        room: Room,
        scene: Scene,
        camera: ArcRotateCamera,
        shadowGenerator: ShadowGenerator,
        debug: boolean
    ) {
        this.x = x;
        this.z = z;
        this.id = id;
        this._room = room;
        this._currentScene = scene;
        this._camera = camera;
        this._currentShadowGenerator = shadowGenerator;
        this._debug = debug;
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
            if (this._debug === false) {
                event.preventDefault();
            }
            this._defaultControls = true;
            this._resetGamepadButtons();
            this._resetTouchButtons();
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
            if (this._debug === false) {
                event.preventDefault();
            }
            this._defaultControls = false;

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

        let container = document.getElementById(
            "buttons-container"
        ) as HTMLElement;

        let buttonUp = document.createElement("div");
        container.appendChild(buttonUp);
        buttonUp.style.position = "fixed";
        buttonUp.style.width = "72px";
        buttonUp.style.height = "80px";
        buttonUp.style.left = "7.5vw";
        buttonUp.style.bottom = "108px";
        buttonUp.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
        buttonUp.style.borderRadius = "80px 80px 12px 12px";

        buttonUp.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this._resetGamepadButtons();
            this._defaultControls = true;
            this._touchDidRun = true;
            this._up = 1;
        });
        buttonUp.addEventListener("touchend", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._up = 2;
        });
        buttonUp.addEventListener("cancel", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._up = 2;
        });

        buttonUp.addEventListener("mousedown", (event) => {
            event.preventDefault();
            this._resetGamepadButtons();
            this._defaultControls = true;
            this._touchDidRun = true;
            this._up = 1;
        });
        buttonUp.addEventListener("mouseup", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._up = 2;
        });
        buttonUp.addEventListener("mouseleave", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._up = 2;
        });

        let buttonDown = document.createElement("div");
        container.appendChild(buttonDown);
        buttonDown.style.position = "fixed";
        buttonDown.style.width = "72px";
        buttonDown.style.height = "80px";
        buttonDown.style.left = "7.5vw";
        buttonDown.style.bottom = "20px";
        buttonDown.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
        buttonDown.style.borderRadius = "12px 12px 80px 80px";

        buttonDown.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this._resetGamepadButtons();
            this._defaultControls = true;
            this._touchDidRun = true;
            this._down = 1;
        });
        buttonDown.addEventListener("touchend", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._down = 2;
        });
        buttonDown.addEventListener("touchcancel", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._down = 2;
        });

        buttonDown.addEventListener("mousedown", (event) => {
            event.preventDefault();
            this._resetGamepadButtons();
            this._defaultControls = true;
            this._touchDidRun = true;
            this._down = 1;
        });
        buttonDown.addEventListener("mouseup", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._down = 2;
        });
        buttonDown.addEventListener("mouseleave", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._down = 2;
        });

        let buttonLeft = document.createElement("div");
        container.appendChild(buttonLeft);
        buttonLeft.style.position = "fixed";
        buttonLeft.style.width = "80px";
        buttonLeft.style.height = "72px";
        buttonLeft.style.right = "calc(7.5vw + 80px + 8px)";
        buttonLeft.style.bottom = "68px";
        buttonLeft.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
        buttonLeft.style.borderRadius = "80px 12px 12px 80px";

        buttonLeft.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this._resetGamepadButtons();
            this._defaultControls = true;
            this._touchDidRun = true;
            this._left = 1;
        });
        buttonLeft.addEventListener("touchend", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._left = 2;
        });
        buttonLeft.addEventListener("touchcancel", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._left = 2;
        });

        buttonLeft.addEventListener("mousedown", (event) => {
            event.preventDefault();
            this._resetGamepadButtons();
            this._defaultControls = true;
            this._touchDidRun = true;
            this._left = 1;
        });
        buttonLeft.addEventListener("mouseup", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._left = 2;
        });
        buttonLeft.addEventListener("mouseleave", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._left = 2;
        });

        let buttonRight = document.createElement("div");
        container.appendChild(buttonRight);
        buttonRight.style.position = "fixed";
        buttonRight.style.width = "80px";
        buttonRight.style.height = "72px";
        buttonRight.style.right = "7.5vw";
        buttonRight.style.bottom = "68px";
        buttonRight.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
        buttonRight.style.borderRadius = "12px 80px 80px 12px";

        buttonRight.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this._resetGamepadButtons();
            this._defaultControls = true;
            this._touchDidRun = true;
            this._right = 1;
        });
        buttonRight.addEventListener("touchend", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._right = 2;
        });
        buttonRight.addEventListener("touchcancel", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._right = 2;
        });

        buttonRight.addEventListener("mousedown", (event) => {
            event.preventDefault();
            this._resetGamepadButtons();
            this._defaultControls = true;
            this._touchDidRun = true;
            this._right = 1;
        });
        buttonRight.addEventListener("mouseup", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._right = 2;
        });
        buttonRight.addEventListener("mouseleave", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            this._right = 2;
        });

        window.addEventListener("gamepadconnected", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            if (this._debug === true) {
                console.log("Gamepad connected.");
            }
        });

        window.addEventListener("gamepaddisconnected", (event) => {
            event.preventDefault();
            if (this._debug === true) {
                console.log("Gamepad disconnected.");
            }
        });
    }

    private _resetGamepadButtons() {
        if (this._gamepadDidRun === true) {
            this._gamepadDidRun = false;
            if (this._up === 1) {
                this._up = 2;
            }
            if (this._down === 1) {
                this._down = 2;
            }
            if (this._left === 1) {
                this._left = 2;
            }
            if (this._right === 1) {
                this._right = 2;
            }
        }
    }

    private _resetTouchButtons() {
        if (this._touchDidRun === true) {
            this._touchDidRun = false;
            if (this._up === 1) {
                this._up = 2;
            }
            if (this._down === 1) {
                this._down = 2;
            }
            if (this._left === 1) {
                this._left = 2;
            }
            if (this._right === 1) {
                this._right = 2;
            }
        }
    }

    private _gamepadInput() {
        if (typeof navigator.getGamepads === "function") {
            if (this._defaultControls === true) {
                return;
            }

            this._resetGamepadButtons();

            let currentGamepadList = navigator.getGamepads();
            let currentGamepad: Gamepad;

            if (
                typeof currentGamepadList !== "undefined" &&
                currentGamepadList !== null
            ) {
                for (let i = 0; i < currentGamepadList.length; i++) {
                    if (
                        typeof currentGamepadList[i] !== "undefined" &&
                        currentGamepadList[i] !== null
                    ) {
                        if (currentGamepadList[i]!.axes.length >= 4) {
                        }
                        for (
                            let j = 0;
                            j < currentGamepadList[i]!.axes.length;
                            j++
                        ) {
                            if (j === 1 || j === 2) {
                                if (
                                    Math.abs(currentGamepadList[i]!.axes[j]) >
                                    0.5
                                ) {
                                    this._gamepadDidRun = true;
                                    currentGamepad = currentGamepadList[i]!;
                                }
                            }
                        }
                    }
                }

                if (this._gamepadDidRun === true) {
                    if (currentGamepad!.axes[1] < -0.5) {
                        this._up = 1;
                    } else if (this._up === 1) {
                        this._up = 2;
                    }
                    if (currentGamepad!.axes[1] > 0.5) {
                        this._down = 1;
                    } else if (this._down === 1) {
                        this._down = 2;
                    }

                    if (currentGamepad!.axes[2] < -0.5) {
                        this._left = 1;
                    } else if (this._left === 1) {
                        this._left = 2;
                    }
                    if (currentGamepad!.axes[2] > 0.5) {
                        this._right = 1;
                    } else if (this._right === 1) {
                        this._right = 2;
                    }
                }
            }
        }
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
        this._gamepadInput();
        this._addCommands();
        this._processCommands();
        this._updateCamera();
    }
}

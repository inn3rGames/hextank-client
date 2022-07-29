import { Room } from "colyseus.js";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import isMobile from "./Utilities";
import body from "./assets/models/hexTankBody.glb";
import jet from "./assets/models/hexTankJet.glb";

interface JetMesh extends AbstractMesh {
    type?: string;
    flame?: Mesh;
}

export default class HexTank {
    private _x: number;
    private _z: number;
    private _angle: number;
    id: string;
    private _room: Room;
    private _currentScene: Scene;
    private _camera: ArcRotateCamera;
    private _currentShadowGenerator: ShadowGenerator;
    private _bodyMesh!: AbstractMesh;

    private _jets: Array<JetMesh> = [];

    private _jetFrontLeft!: JetMesh;
    private _jetFrontRight!: JetMesh;
    private _jetBackLeft!: JetMesh;
    private _jetBackRight!: JetMesh;

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
    private _windowActive: boolean = true;

    private _debug: boolean;
    private _debugBody?: Mesh;
    private _debugMaterial?: StandardMaterial;

    constructor(
        serverHexTank: any,
        room: Room,
        scene: Scene,
        camera: ArcRotateCamera,
        shadowGenerator: ShadowGenerator,
        debug: boolean
    ) {
        this._x = serverHexTank.x;
        this._z = serverHexTank.z;
        this._angle = serverHexTank.angle;
        this.id = serverHexTank.id;
        this._room = room;
        this._currentScene = scene;
        this._camera = camera;
        this._currentShadowGenerator = shadowGenerator;
        this._debug = debug;
    }

    async loadMeshes() {
        let result = await SceneLoader.ImportMeshAsync(
            null,
            "",
            body,
            this._currentScene
        );
        this._bodyMesh = result.meshes[0];
        this._bodyMesh.position.x = this._x;
        this._bodyMesh.position.z = this._z;
        this._bodyMesh.rotationQuaternion!.toEulerAnglesToRef(
            this._bodyMesh.rotation
        );
        this._bodyMesh.rotationQuaternion = null;
        this._bodyMesh.rotation.setAll(0);
        this._currentShadowGenerator.addShadowCaster(this._bodyMesh, true);

        await this._loadJet("jetFrontLeft");
        await this._loadJet("jetFrontRight");
        await this._loadJet("jetBackLeft");
        await this._loadJet("jetBackRight");

        if (this._debug === true) {
            this._debugBody = MeshBuilder.CreateCylinder("debugBody", {
                height: 0.01,
                diameter: 1.6,
            });
            this._debugMaterial = new StandardMaterial(
                "debugMaterial",
                this._currentScene
            );
            this._debugBody.material = this._debugMaterial;
            this._debugMaterial.diffuseColor = Color3.FromHexString("#00FF00");

            this._debugBody.position.x = this._x;
            this._debugBody.position.z = this._z;

            this._bodyMesh.addChild(this._debugBody);
        }
    }

    private async _loadJet(type: string) {
        let result = await SceneLoader.ImportMeshAsync(
            null,
            "",
            jet,
            this._currentScene
        );

        result.meshes[0].rotationQuaternion!.toEulerAnglesToRef(
            result.meshes[0].rotation
        );
        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotation.setAll(0);
        result.meshes[0].setPivotPoint(new Vector3(0, 0.5, 0));

        if (type === "jetFrontLeft") {
            this._jetFrontLeft = result.meshes[0];
            this._jetFrontLeft.type = type;
            this._jetFrontLeft.flame = result.meshes[1] as Mesh;
            this._jetFrontLeft.position.x = this._x - 0.5;
            this._jetFrontLeft.position.z = this._z - 0.45;
            this._currentShadowGenerator.addShadowCaster(
                this._jetFrontLeft,
                true
            );

            this._bodyMesh.addChild(this._jetFrontLeft);
            this._jets.push(this._jetFrontLeft);
        }

        if (type === "jetFrontRight") {
            this._jetFrontRight = result.meshes[0];
            this._jetFrontRight.type = type;
            this._jetFrontRight.flame = result.meshes[1] as Mesh;
            this._jetFrontRight.position.x = this._x - 0.5;
            this._jetFrontRight.position.z = this._z + 0.45;
            this._currentShadowGenerator.addShadowCaster(
                this._jetFrontRight,
                true
            );

            this._bodyMesh.addChild(this._jetFrontRight);
            this._jets.push(this._jetFrontRight);
        }

        if (type === "jetBackLeft") {
            this._jetBackLeft = result.meshes[0];
            this._jetBackLeft.type = type;
            this._jetBackLeft.flame = result.meshes[1] as Mesh;
            this._jetBackLeft.position.x = this._x + 0.5;
            this._jetBackLeft.position.z = this._z - 0.45;

            this._currentShadowGenerator.addShadowCaster(
                this._jetBackLeft,
                true
            );

            this._bodyMesh.addChild(this._jetBackLeft);
            this._jets.push(this._jetBackLeft);
        }

        if (type === "jetBackRight") {
            this._jetBackRight = result.meshes[0];
            this._jetBackRight.type = type;
            this._jetBackRight.flame = result.meshes[1] as Mesh;
            this._jetBackRight.position.x = this._x + 0.5;
            this._jetBackRight.position.z = this._z + 0.45;

            this._currentShadowGenerator.addShadowCaster(
                this._jetBackRight,
                true
            );

            this._bodyMesh.addChild(this._jetBackRight);
            this._jets.push(this._jetBackRight);
        }
    }

    deleteMeshes() {
        if (typeof this._bodyMesh !== "undefined") {
            this._bodyMesh.dispose();
        }
    }

    setPosition(serverHexTank: any) {
        this._x = serverHexTank.x;
        this._z = serverHexTank.z;
        this._angle = serverHexTank.angle;
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

        interface CustomWindow extends Window {
            opera?: string;
        }
        let customWindow: CustomWindow = window;
        let currentDeviceIsMobile = isMobile(
            navigator.userAgent || navigator.vendor || customWindow.opera
        );

        if (currentDeviceIsMobile === true) {
            let container = document.getElementById(
                "buttons-container"
            ) as HTMLElement;

            let upColor = "rgba(255, 255, 255, 0.25)";
            let downColor = "rgba(0, 0, 0, 0.25)";

            let buttonUp = document.createElement("div");
            container.appendChild(buttonUp);
            buttonUp.style.position = "fixed";
            buttonUp.style.width = "72px";
            buttonUp.style.height = "80px";
            buttonUp.style.left = "7.5vw";
            buttonUp.style.bottom = "calc(5vw + 80px + 8px)";
            buttonUp.style.backgroundColor = upColor;
            buttonUp.style.borderRadius = "80px 80px 12px 12px";

            buttonUp.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._up = 1;
                buttonUp.style.backgroundColor = downColor;
            });
            buttonUp.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._up = 2;
                buttonUp.style.backgroundColor = upColor;
            });
            buttonUp.addEventListener("cancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._up = 2;
                buttonUp.style.backgroundColor = upColor;
            });

            buttonUp.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._up = 1;
                buttonUp.style.backgroundColor = downColor;
            });
            buttonUp.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._up = 2;
                buttonUp.style.backgroundColor = upColor;
            });
            buttonUp.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._up = 2;
                buttonUp.style.backgroundColor = upColor;
            });

            let buttonDown = document.createElement("div");
            container.appendChild(buttonDown);
            buttonDown.style.position = "fixed";
            buttonDown.style.width = "72px";
            buttonDown.style.height = "80px";
            buttonDown.style.left = "7.5vw";
            buttonDown.style.bottom = "5vw";
            buttonDown.style.backgroundColor = upColor;
            buttonDown.style.borderRadius = "12px 12px 80px 80px";

            buttonDown.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._down = 1;
                buttonDown.style.backgroundColor = downColor;
            });
            buttonDown.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._down = 2;
                buttonDown.style.backgroundColor = upColor;
            });
            buttonDown.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._down = 2;
                buttonDown.style.backgroundColor = upColor;
            });

            buttonDown.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._down = 1;
                buttonDown.style.backgroundColor = downColor;
            });
            buttonDown.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._down = 2;
                buttonDown.style.backgroundColor = upColor;
            });
            buttonDown.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._down = 2;
                buttonDown.style.backgroundColor = upColor;
            });

            let buttonLeft = document.createElement("div");
            container.appendChild(buttonLeft);
            buttonLeft.style.position = "fixed";
            buttonLeft.style.width = "80px";
            buttonLeft.style.height = "72px";
            buttonLeft.style.right = "calc(7.5vw + 80px + 8px)";
            buttonLeft.style.bottom = "calc(5vw + 40px + 8px)";
            buttonLeft.style.backgroundColor = upColor;
            buttonLeft.style.borderRadius = "80px 12px 12px 80px";

            buttonLeft.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._left = 1;
                buttonLeft.style.backgroundColor = downColor;
            });
            buttonLeft.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._left = 2;
                buttonLeft.style.backgroundColor = upColor;
            });
            buttonLeft.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._left = 2;
                buttonLeft.style.backgroundColor = upColor;
            });

            buttonLeft.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._left = 1;
                buttonLeft.style.backgroundColor = downColor;
            });
            buttonLeft.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._left = 2;
                buttonLeft.style.backgroundColor = upColor;
            });
            buttonLeft.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._left = 2;
                buttonLeft.style.backgroundColor = upColor;
            });

            let buttonRight = document.createElement("div");
            container.appendChild(buttonRight);
            buttonRight.style.position = "fixed";
            buttonRight.style.width = "80px";
            buttonRight.style.height = "72px";
            buttonRight.style.right = "7.5vw";
            buttonRight.style.bottom = "calc(5vw + 40px + 8px)";
            buttonRight.style.backgroundColor = upColor;
            buttonRight.style.borderRadius = "12px 80px 80px 12px";

            buttonRight.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._right = 1;
                buttonRight.style.backgroundColor = downColor;
            });
            buttonRight.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._right = 2;
                buttonRight.style.backgroundColor = upColor;
            });
            buttonRight.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._right = 2;
                buttonRight.style.backgroundColor = upColor;
            });

            buttonRight.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._right = 1;
                buttonRight.style.backgroundColor = downColor;
            });
            buttonRight.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._right = 2;
                buttonRight.style.backgroundColor = upColor;
            });
            buttonRight.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._right = 2;
                buttonRight.style.backgroundColor = upColor;
            });
        }

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

        window.addEventListener("focus", () => {
            this._windowActive = true;
        });

        window.addEventListener("blur", () => {
            this._windowActive = false;
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
        if (
            typeof navigator.getGamepads === "function" &&
            this._windowActive === true
        ) {
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

    private _updateMesh() {
        if (typeof this._bodyMesh !== "undefined") {
            this._bodyMesh.position.x = this._x;
            this._bodyMesh.position.z = this._z;
            this._bodyMesh.rotation.y = this._angle;
        }
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

        for (let i = 0; i < this._jets.length; i++) {
            let currenJet = this._jets[i];

            currenJet.rotation.z = this._positiveAngle(
                this._angleInterpolation(
                    currenJet.rotation.z,
                    serverHexTank.jetsRotationZ,
                    this._linearInperpolationPercent
                )
            );

            currenJet.rotation.x = this._positiveAngle(
                this._angleInterpolation(
                    currenJet.rotation.x,
                    serverHexTank.jetsRotationX,
                    this._linearInperpolationPercent
                )
            );

            currenJet.flame!.scaling.y = this._linearInterpolation(
                currenJet.flame!.scaling.y,
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
        this._gamepadInput();
        this._addCommands();
        this._processCommands();

        this.syncWithServer(serverHexTank);
        this._updateCamera();
    }
}

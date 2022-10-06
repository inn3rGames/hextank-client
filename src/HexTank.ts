import { Room } from "colyseus.js";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import isMobile from "./Utilities";

export default class HexTank {
    private _x: number;
    private _z: number;
    private _angle: number;
    private _radius: number;
    id: string;
    private _room: Room;
    private _scene: Scene;
    private _camera: ArcRotateCamera;
    private _nodesWithShadow: Map<string, TransformNode>;

    private _bodyMesh: Array<Mesh>;
    private _jetMesh: Array<Mesh>;

    private _bodyNode!: TransformNode;
    private _jetNodes: Array<TransformNode> = [];

    private _linearInperpolationPercent: number = 0.2;

    private _commandsPerFrame: number = 100;

    private _up: number = 0;
    private _down: number = 0;
    private _left: number = 0;
    private _right: number = 0;
    private _shoot: number = 0;

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
        this._room = room;
        this._scene = scene;
        this._camera = camera;
        this._nodesWithShadow = nodesWithShadow;
        this._bodyMesh = bodyMesh;
        this._jetMesh = jetMesh;
        this._debug = debug;
    }

    loadMeshes() {
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
            if (event.key === " ") {
                this._shoot = 1;
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
            if (event.key === " ") {
                this._shoot = 2;
            }
        });

        interface CustomWindow extends Window {
            opera?: string;
        }
        const customWindow: CustomWindow = window;
        const currentDeviceIsMobile = isMobile(
            navigator.userAgent || navigator.vendor || customWindow.opera
        );

        if (currentDeviceIsMobile === true) {
            const container = document.getElementById(
                "buttons-container"
            ) as HTMLElement;

            const upColor = "rgba(255, 255, 255, 0.25)";
            const downColor = "rgba(0, 0, 0, 0.25)";

            const buttonUp = document.createElement("div");
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
            buttonUp.addEventListener("touchcancel", (event) => {
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

            const buttonDown = document.createElement("div");
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

            const buttonLeft = document.createElement("div");
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

            const buttonRight = document.createElement("div");
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
            if (this._shoot === 1) {
                this._shoot = 2;
            }
        });

        window.addEventListener("touchstart", (event) => {
            event.preventDefault();
        });
        window.addEventListener("touchend", (event) => {
            event.preventDefault();
        });
        window.addEventListener("touchcancel", (event) => {
            event.preventDefault();
        });

        window.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });
        window.addEventListener("mouseup", (event) => {
            event.preventDefault();
        });
        window.addEventListener("mouseleave", (event) => {
            event.preventDefault();
        });

        window.addEventListener("contextmenu", (event) => {
            event.preventDefault();
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
            if (this._shoot === 1) {
                this._shoot = 2;
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
            if (this._shoot === 1) {
                this._shoot = 2;
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

            const currentGamepadList = navigator.getGamepads();
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
            if (this._shoot === 1) {
                this._commands.push("shootDown");
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
            if (this._shoot === 2) {
                this._commands.push("shootUp");
                this._shoot = 0;
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
            if (currentCommand === "shootDown") {
                this._room.send("command", "shootDown");
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
            if (currentCommand === "shootUp") {
                this._room.send("command", "shootUp");
            }
        }
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
        this._gamepadInput();
        this._addCommands();
        this._processCommands();

        this.syncWithServer(serverHexTank);
        this._updateCamera();
    }
}

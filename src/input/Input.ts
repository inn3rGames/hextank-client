import { Room } from "colyseus.js";
import isMobile from "./Utilities";

export default class Input {
    private _room!: Room | undefined;

    private _commandsPerFrame: number = 100;

    private _up: number = 0;
    private _down: number = 0;
    private _left: number = 0;
    private _right: number = 0;
    private _shoot: number = 0;

    buttonUp!: HTMLDivElement;
    buttonDown!: HTMLDivElement;
    buttonLeft!: HTMLDivElement;
    buttonRight!: HTMLDivElement;
    buttonShoot!: HTMLDivElement;

    private _commands: Array<string> = [];

    private _defaultControls: boolean = true;
    private _gamepadDidRun: boolean = false;
    private _touchDidRun: boolean = false;
    private _windowActive: boolean = true;
    currentDeviceIsMobile: boolean = false;

    private _production!: boolean;

    enableInput() {
        window.addEventListener("keydown", (event) => {
            if (this._production === true) {
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
            if (this._production === true) {
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
        this.currentDeviceIsMobile = isMobile(
            navigator.userAgent || navigator.vendor || customWindow.opera
        );

        if (this.currentDeviceIsMobile === true) {
            document.body.addEventListener("touchstart", () => {}, false);

            const container = document.getElementById(
                "touch-buttons-container"
            ) as HTMLElement;

            const upColor = "rgba(255, 255, 255, 0.25)";
            const downColor = "rgba(0, 0, 0, 0.25)";

            this.buttonUp = document.createElement("div");
            container.appendChild(this.buttonUp);
            this.buttonUp.style.position = "fixed";
            this.buttonUp.style.width = "13.5vmin";
            this.buttonUp.style.height = "15vmin";
            this.buttonUp.style.left = "20vmin";
            this.buttonUp.style.bottom = "calc(5vmin + 15vmin + 1vmin)";
            this.buttonUp.style.backgroundColor = upColor;
            this.buttonUp.style.borderRadius =
                "7.5vmin 7.5vmin 2.25vmin 2.25vmin";

            this.buttonUp.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._up = 1;
                this.buttonUp.style.backgroundColor = downColor;
            });
            this.buttonUp.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._up = 2;
                this.buttonUp.style.backgroundColor = upColor;
            });
            this.buttonUp.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._up = 2;
                this.buttonUp.style.backgroundColor = upColor;
            });

            this.buttonUp.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._up = 1;
                this.buttonUp.style.backgroundColor = downColor;
            });
            this.buttonUp.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._up = 2;
                this.buttonUp.style.backgroundColor = upColor;
            });
            this.buttonUp.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._up = 2;
                this.buttonUp.style.backgroundColor = upColor;
            });

            this.buttonDown = document.createElement("div");
            container.appendChild(this.buttonDown);
            this.buttonDown.style.position = "fixed";
            this.buttonDown.style.width = "13.5vmin";
            this.buttonDown.style.height = "15vmin";
            this.buttonDown.style.left = "20vmin";
            this.buttonDown.style.bottom = "5vmin";
            this.buttonDown.style.backgroundColor = upColor;
            this.buttonDown.style.borderRadius =
                "2.25vmin 2.25vmin 7.5vmin 7.5vmin";

            this.buttonDown.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._down = 1;
                this.buttonDown.style.backgroundColor = downColor;
            });
            this.buttonDown.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._down = 2;
                this.buttonDown.style.backgroundColor = upColor;
            });
            this.buttonDown.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._down = 2;
                this.buttonDown.style.backgroundColor = upColor;
            });

            this.buttonDown.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._down = 1;
                this.buttonDown.style.backgroundColor = downColor;
            });
            this.buttonDown.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._down = 2;
                this.buttonDown.style.backgroundColor = upColor;
            });
            this.buttonDown.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._down = 2;
                this.buttonDown.style.backgroundColor = upColor;
            });

            this.buttonLeft = document.createElement("div");
            container.appendChild(this.buttonLeft);
            this.buttonLeft.style.position = "fixed";
            this.buttonLeft.style.width = "15vmin";
            this.buttonLeft.style.height = "13.5vmin";
            this.buttonLeft.style.right = "calc(20vmin + 15vmin + 1vmin)";
            this.buttonLeft.style.bottom = "5vmin";
            this.buttonLeft.style.backgroundColor = upColor;
            this.buttonLeft.style.borderRadius =
                "7.5vmin 2.25vmin 2.25vmin 7.5vmin";

            this.buttonLeft.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._left = 1;
                this.buttonLeft.style.backgroundColor = downColor;
            });
            this.buttonLeft.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._left = 2;
                this.buttonLeft.style.backgroundColor = upColor;
            });
            this.buttonLeft.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._left = 2;
                this.buttonLeft.style.backgroundColor = upColor;
            });

            this.buttonLeft.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._left = 1;
                this.buttonLeft.style.backgroundColor = downColor;
            });
            this.buttonLeft.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._left = 2;
                this.buttonLeft.style.backgroundColor = upColor;
            });
            this.buttonLeft.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._left = 2;
                this.buttonLeft.style.backgroundColor = upColor;
            });

            this.buttonRight = document.createElement("div");
            container.appendChild(this.buttonRight);
            this.buttonRight.style.position = "fixed";
            this.buttonRight.style.width = "15vmin";
            this.buttonRight.style.height = "13.5vmin";
            this.buttonRight.style.right = "20vmin";
            this.buttonRight.style.bottom = "5vmin";
            this.buttonRight.style.backgroundColor = upColor;
            this.buttonRight.style.borderRadius =
                "2.25vmin 7.5vmin 7.5vmin 2.25vmin";

            this.buttonRight.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._right = 1;
                this.buttonRight.style.backgroundColor = downColor;
            });
            this.buttonRight.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._right = 2;
                this.buttonRight.style.backgroundColor = upColor;
            });
            this.buttonRight.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._right = 2;
                this.buttonRight.style.backgroundColor = upColor;
            });

            this.buttonRight.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._right = 1;
                this.buttonRight.style.backgroundColor = downColor;
            });
            this.buttonRight.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._right = 2;
                this.buttonRight.style.backgroundColor = upColor;
            });
            this.buttonRight.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._right = 2;
                this.buttonRight.style.backgroundColor = upColor;
            });

            const shootUpColor = "rgba(255, 0, 0, 0.25)";
            const shootDownColor = "rgba(63, 0, 0, 0.25)";

            this.buttonShoot = document.createElement("div");
            container.appendChild(this.buttonShoot);
            this.buttonShoot.style.position = "fixed";
            this.buttonShoot.style.width = "15vmin";
            this.buttonShoot.style.height = "15vmin";
            this.buttonShoot.style.right = "calc(20vmin + 7.5vmin + 0.75vmin)";
            this.buttonShoot.style.bottom = "calc(19.5vmin)";
            this.buttonShoot.style.backgroundColor = shootUpColor;
            this.buttonShoot.style.borderRadius =
                "7.5vmin 7.5vmin 7.5vmin 7.5vmin";

            this.buttonShoot.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._shoot = 1;
                this.buttonShoot.style.backgroundColor = shootDownColor;
            });
            this.buttonShoot.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._shoot = 2;
                this.buttonShoot.style.backgroundColor = shootUpColor;
            });
            this.buttonShoot.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._shoot = 2;
                this.buttonShoot.style.backgroundColor = shootUpColor;
            });

            this.buttonShoot.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._shoot = 1;
                this.buttonShoot.style.backgroundColor = shootDownColor;
            });
            this.buttonShoot.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._shoot = 2;
                this.buttonShoot.style.backgroundColor = shootUpColor;
            });
            this.buttonShoot.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._shoot = 2;
                this.buttonShoot.style.backgroundColor = shootUpColor;
            });
        }

        window.addEventListener("gamepadconnected", (event) => {
            event.preventDefault();
            this._defaultControls = false;
            if (this._production === false) {
                console.log("Gamepad connected.");
            }
        });

        window.addEventListener("gamepaddisconnected", (event) => {
            event.preventDefault();
            if (this._production === false) {
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
                            for (
                                let j = 0;
                                j < currentGamepadList[i]!.axes.length;
                                j++
                            ) {
                                if (j === 1 || j === 2) {
                                    if (
                                        Math.abs(
                                            currentGamepadList[i]!.axes[j]
                                        ) > 0.5
                                    ) {
                                        this._gamepadDidRun = true;
                                        currentGamepad = currentGamepadList[i]!;
                                    }
                                }
                            }

                            if (
                                currentGamepadList[i]!.buttons[4].pressed ===
                                    true ||
                                currentGamepadList[i]!.buttons[5].pressed ===
                                    true ||
                                currentGamepadList[i]!.buttons[6].pressed ===
                                    true ||
                                currentGamepadList[i]!.buttons[7].pressed ===
                                    true
                            ) {
                                this._gamepadDidRun = true;
                                currentGamepad = currentGamepadList[i]!;
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

                    if (
                        currentGamepad!.buttons[4].pressed === true ||
                        currentGamepad!.buttons[5].pressed === true ||
                        currentGamepad!.buttons[6].pressed === true ||
                        currentGamepad!.buttons[7].pressed === true
                    ) {
                        this._shoot = 1;
                    } else if (this._shoot === 1) {
                        this._shoot = 2;
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
                this._room!.send("command", "upKeyDown");
            }
            if (currentCommand === "downKeyDown") {
                this._room!.send("command", "downKeyDown");
            }
            if (currentCommand === "leftKeyDown") {
                this._room!.send("command", "leftKeyDown");
            }
            if (currentCommand === "rightKeyDown") {
                this._room!.send("command", "rightKeyDown");
            }
            if (currentCommand === "shootDown") {
                this._room!.send("command", "shootDown");
            }

            if (currentCommand === "upKeyUp") {
                this._room!.send("command", "upKeyUp");
            }
            if (currentCommand === "downKeyUp") {
                this._room!.send("command", "downKeyUp");
            }
            if (currentCommand === "leftKeyUp") {
                this._room!.send("command", "leftKeyUp");
            }
            if (currentCommand === "rightKeyUp") {
                this._room!.send("command", "rightKeyUp");
            }
            if (currentCommand === "shootUp") {
                this._room!.send("command", "shootUp");
            }
        }
    }

    setRoom(room: Room | undefined) {
        this._room = room;
    }

    update() {
        if (typeof this._room !== "undefined") {
            this._gamepadInput();
            this._addCommands();
            this._processCommands();
        }
    }
}

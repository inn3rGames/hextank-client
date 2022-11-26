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

    private _commands: Array<string> = [];

    private _defaultControls: boolean = true;
    private _gamepadDidRun: boolean = false;
    private _touchDidRun: boolean = false;
    private _windowActive: boolean = true;

    private _debug!: boolean;

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
            document.body.addEventListener("touchstart", () => {}, false);

            const container = document.getElementById(
                "touch-buttons-container"
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
            buttonUp.style.borderRadius = "40px 40px 12px 12px";

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
            buttonDown.style.borderRadius = "12px 12px 40px 40px";

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
            buttonLeft.style.bottom = "calc(5vw + 8px)";
            buttonLeft.style.backgroundColor = upColor;
            buttonLeft.style.borderRadius = "40px 12px 12px 40px";

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
            buttonRight.style.bottom = "calc(5vw + 8px)";
            buttonRight.style.backgroundColor = upColor;
            buttonRight.style.borderRadius = "12px 40px 40px 12px";

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

            const shootUpColor = "rgba(255, 0, 0, 0.25)";
            const shootDownColor = "rgba(63, 0, 0, 0.25)";

            const buttonShoot = document.createElement("div");
            container.appendChild(buttonShoot);
            buttonShoot.style.position = "fixed";
            buttonShoot.style.width = "80px";
            buttonShoot.style.height = "80px";
            buttonShoot.style.right = "calc(7.5vw + 40px + 4px)";
            buttonShoot.style.bottom = "calc(5vw + 80px + 8px)";
            buttonShoot.style.backgroundColor = shootUpColor;
            buttonShoot.style.borderRadius = "40px 40px 40px 40px";

            buttonShoot.addEventListener("touchstart", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._shoot = 1;
                buttonShoot.style.backgroundColor = shootDownColor;
            });
            buttonShoot.addEventListener("touchend", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._shoot = 2;
                buttonShoot.style.backgroundColor = shootUpColor;
            });
            buttonShoot.addEventListener("touchcancel", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._shoot = 2;
                buttonShoot.style.backgroundColor = shootUpColor;
            });

            buttonShoot.addEventListener("mousedown", (event) => {
                event.preventDefault();
                this._resetGamepadButtons();
                this._defaultControls = true;
                this._touchDidRun = true;
                this._shoot = 1;
                buttonShoot.style.backgroundColor = shootDownColor;
            });
            buttonShoot.addEventListener("mouseup", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._shoot = 2;
                buttonShoot.style.backgroundColor = shootUpColor;
            });
            buttonShoot.addEventListener("mouseleave", (event) => {
                event.preventDefault();
                this._defaultControls = false;
                this._shoot = 2;
                buttonShoot.style.backgroundColor = shootUpColor;
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

                            for (
                                let k = 0;
                                k < currentGamepadList[i]!.buttons.length;
                                k++
                            ) {
                                if (
                                    currentGamepadList[i]!.buttons[k]
                                        .pressed === true
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

    setRoom(room: Room | undefined, debug: boolean) {
        this._room = room;
        this._debug = debug;
    }

    update() {
        if (typeof this._room !== "undefined") {
            this._gamepadInput();
            this._addCommands();
            this._processCommands();
        }
    }
}

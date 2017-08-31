(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var KeyActionBinder_1 = require('./KeyActionBinder');
var KeyboardActionBinding_1 = require('./KeyboardActionBinding');
var GamepadActionBinding_1 = require('./GamepadActionBinding');
/**
 * Information linking an action to a binding, and whether it's activated
 */
var Action = (function () {
    // ================================================================================================================
    // CONSTRUCTOR ----------------------------------------------------------------------------------------------------
    function Action(id) {
        this._id = id;
        this.timeLastActivation = 0;
        this.toleranceTime = 0;
        this.keyboardBindings = [];
        this.keyboardActivated = false;
        this.keyboardValue = 0;
        this.keyboardConsumed = false;
        this.gamepadButtonBindings = [];
        this.gamepadButtonActivated = false;
        this.gamepadButtonValue = 0;
        this.gamepadButtonConsumed = false;
    }
    Action.prototype.bind = function (subject, location) {
        if (typeof subject === "number") {
            // Keyboard binding
            this.bindKeyboard(subject, location == undefined ? KeyActionBinder_1.default.KeyLocations.ANY : location);
        }
        else {
            // Gamepad binding
            this.bindGamepad(subject, location == undefined ? KeyActionBinder_1.default.GamepadLocations.ANY : location);
        }
        return this;
    };
    Action.prototype.setTolerance = function (timeInSeconds) {
        this.toleranceTime = timeInSeconds * 1000;
        return this;
    };
    Action.prototype.consume = function () {
        if (this.keyboardActivated)
            this.keyboardConsumed = true;
        if (this.gamepadButtonActivated)
            this.gamepadButtonConsumed = true;
    };
    Action.prototype.interpretKeyDown = function (keyCode, keyLocation) {
        for (var i = 0; i < this.keyboardBindings.length; i++) {
            if (!this.keyboardBindings[i].isActivated && this.keyboardBindings[i].matchesKeyboardKey(keyCode, keyLocation)) {
                // Activated
                this.keyboardBindings[i].isActivated = true;
                this.keyboardActivated = true;
                this.keyboardValue = 1;
                this.timeLastActivation = Date.now();
            }
        }
    };
    Action.prototype.interpretKeyUp = function (keyCode, keyLocation) {
        var hasMatch;
        var isActivated = false;
        for (var i = 0; i < this.keyboardBindings.length; i++) {
            if (this.keyboardBindings[i].matchesKeyboardKey(keyCode, keyLocation)) {
                if (this.keyboardBindings[i].isActivated) {
                    // Deactivated
                    this.keyboardBindings[i].isActivated = false;
                }
                hasMatch = true;
                isActivated = isActivated || this.keyboardBindings[i].isActivated;
            }
        }
        if (hasMatch) {
            this.keyboardActivated = isActivated;
            this.keyboardValue = this.keyboardActivated ? 1 : 0;
            if (!this.keyboardActivated)
                this.keyboardConsumed = false;
        }
    };
    Action.prototype.interpretGamepadButton = function (buttonCode, gamepadLocation, pressedState, valueState) {
        var hasMatch;
        var isActivated = false;
        var newValue = 0;
        for (var i = 0; i < this.gamepadButtonBindings.length; i++) {
            if (this.gamepadButtonBindings[i].matchesGamepadButton(buttonCode, gamepadLocation)) {
                hasMatch = true;
                this.gamepadButtonBindings[i].isActivated = pressedState;
                this.gamepadButtonBindings[i].value = valueState;
                isActivated = isActivated || pressedState;
                if (valueState > newValue)
                    newValue = valueState;
            }
        }
        // TODO: I think this will fail if two buttons are used for the same action; values will be overwritten
        if (hasMatch) {
            if (isActivated && !this.gamepadButtonActivated)
                this.timeLastActivation = Date.now();
            this.gamepadButtonActivated = isActivated;
            this.gamepadButtonValue = newValue;
            if (!this.gamepadButtonActivated)
                this.gamepadButtonConsumed = false;
        }
    };
    Object.defineProperty(Action.prototype, "id", {
        // ================================================================================================================
        // ACCESSOR INTERFACE ---------------------------------------------------------------------------------------------
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "activated", {
        get: function () {
            return ((this.keyboardActivated && !this.keyboardConsumed) || (this.gamepadButtonActivated && !this.gamepadButtonConsumed)) && this.isWithinToleranceTime();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Action.prototype, "value", {
        get: function () {
            return this.isWithinToleranceTime() ? Math.max(this.keyboardConsumed ? 0 : this.keyboardValue, this.gamepadButtonConsumed ? 0 : this.gamepadButtonValue) : 0;
        },
        enumerable: true,
        configurable: true
    });
    // ================================================================================================================
    // PRIVATE INTERFACE ----------------------------------------------------------------------------------------------
    Action.prototype.bindKeyboard = function (keyCode, keyLocation) {
        // TODO: check if already present?
        this.keyboardBindings.push(new KeyboardActionBinding_1.default(keyCode, keyLocation));
    };
    Action.prototype.bindGamepad = function (button, gamepadLocation) {
        // TODO: check if already present?
        this.gamepadButtonBindings.push(new GamepadActionBinding_1.default(button.index, gamepadLocation));
    };
    Action.prototype.isWithinToleranceTime = function () {
        return this.toleranceTime <= 0 || this.timeLastActivation >= Date.now() - this.toleranceTime;
    };
    return Action;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Action;
},{"./GamepadActionBinding":3,"./KeyActionBinder":5,"./KeyboardActionBinding":6}],2:[function(require,module,exports){
var KeyActionBinder_1 = require('./KeyActionBinder');
var KeyboardAxisBinding_1 = require('./KeyboardAxisBinding');
var GamepadAxisBinding_1 = require('./GamepadAxisBinding');
/**
 * Information linking an axis to a binding, and its value
 */
var Axis = (function () {
    // ================================================================================================================
    // CONSTRUCTOR ----------------------------------------------------------------------------------------------------
    function Axis(id) {
        this._id = id;
        this.keyboardBindings = [];
        this.gamepadAxisBindings = [];
        this.gamepadAxisValue = 0;
    }
    Axis.prototype.bind = function (p1, p2, p3, p4, p5) {
        if (typeof p1 === "number") {
            // Keyboard binding
            this.bindKeyboard(p1, p2, p3 == undefined ? KeyActionBinder_1.default.KeyLocations.ANY : p3, p4 == undefined ? KeyActionBinder_1.default.KeyLocations.ANY : p4, p5 == undefined ? 0.15 : p5);
        }
        else {
            // Gamepad binding
            this.bindGamepad(p1, p2 == undefined ? 0.2 : p2, p3 == undefined ? KeyActionBinder_1.default.GamepadLocations.ANY : p3);
        }
        return this;
    };
    Axis.prototype.interpretKeyDown = function (keyCode, keyLocation) {
        for (var i = 0; i < this.keyboardBindings.length; i++) {
            if (this.keyboardBindings[i].matchesKeyboardKeyStart(keyCode, keyLocation)) {
                this.keyboardBindings[i].value = -1;
            }
            else if (this.keyboardBindings[i].matchesKeyboardKeyEnd(keyCode, keyLocation)) {
                this.keyboardBindings[i].value = 1;
            }
        }
    };
    Axis.prototype.interpretKeyUp = function (keyCode, keyLocation) {
        for (var i = 0; i < this.keyboardBindings.length; i++) {
            if (this.keyboardBindings[i].matchesKeyboardKeyStart(keyCode, keyLocation)) {
                this.keyboardBindings[i].value = 0;
            }
            else if (this.keyboardBindings[i].matchesKeyboardKeyEnd(keyCode, keyLocation)) {
                this.keyboardBindings[i].value = 0;
            }
        }
    };
    Axis.prototype.interpretGamepadAxis = function (axisCode, gamepadLocation, valueState) {
        for (var i = 0; i < this.gamepadAxisBindings.length; i++) {
            if (this.gamepadAxisBindings[i].matchesGamepadAxis(axisCode, gamepadLocation)) {
                this.gamepadAxisBindings[i].value = valueState;
            }
        }
    };
    Object.defineProperty(Axis.prototype, "id", {
        // ================================================================================================================
        // ACCESSOR INTERFACE ---------------------------------------------------------------------------------------------
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "value", {
        get: function () {
            // Gets the highest value
            var bestValue = 0;
            var val;
            // Check keyboard values
            for (var i = 0; i < this.keyboardBindings.length; i++) {
                val = this.keyboardBindings[i].value;
                if (Math.abs(val) > Math.abs(bestValue)) {
                    bestValue = val;
                }
            }
            // Check gamepad values
            for (var i = 0; i < this.gamepadAxisBindings.length; i++) {
                val = this.gamepadAxisBindings[i].value;
                if (Math.abs(val) > Math.abs(bestValue)) {
                    bestValue = val;
                }
            }
            return bestValue;
        },
        enumerable: true,
        configurable: true
    });
    // ================================================================================================================
    // PRIVATE INTERFACE ----------------------------------------------------------------------------------------------
    Axis.prototype.bindKeyboard = function (keyCodeA, keyCodeB, keyLocationA, keyLocationB, transitionTimeSeconds) {
        // TODO: check if already present?
        this.keyboardBindings.push(new KeyboardAxisBinding_1.default(keyCodeA, keyCodeB, keyLocationA, keyLocationB, transitionTimeSeconds));
    };
    Axis.prototype.bindGamepad = function (axis, deadZone, gamepadLocation) {
        // TODO: check if already present?
        this.gamepadAxisBindings.push(new GamepadAxisBinding_1.default(axis.index, deadZone, gamepadLocation));
    };
    return Axis;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Axis;
},{"./GamepadAxisBinding":4,"./KeyActionBinder":5,"./KeyboardAxisBinding":7}],3:[function(require,module,exports){
var KeyActionBinder_1 = require('./KeyActionBinder');
/**
 * Information on a gamepad event filter
 */
var GamepadActionBinding = (function () {
    // ================================================================================================================
    // CONSTRUCTOR ----------------------------------------------------------------------------------------------------
    function GamepadActionBinding(buttonCode, gamepadLocation) {
        this.buttonCode = buttonCode;
        this.gamepadLocation = gamepadLocation;
        this.isActivated = false;
        this.value = 0;
    }
    // ================================================================================================================
    // PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
    GamepadActionBinding.prototype.matchesGamepadButton = function (buttonCode, gamepadLocation) {
        return (this.buttonCode == buttonCode || this.buttonCode == KeyActionBinder_1.default.GamepadButtons.ANY.index) && (this.gamepadLocation == gamepadLocation || this.gamepadLocation == KeyActionBinder_1.default.GamepadLocations.ANY);
    };
    return GamepadActionBinding;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GamepadActionBinding;
},{"./KeyActionBinder":5}],4:[function(require,module,exports){
var KeyActionBinder_1 = require('./KeyActionBinder');
var Utils_1 = require('./Utils');
/**
 * Information on a gamepad event filter
 */
var GamepadAxisBinding = (function () {
    // ================================================================================================================
    // CONSTRUCTOR ----------------------------------------------------------------------------------------------------
    function GamepadAxisBinding(axisCode, deadZone, gamepadLocation) {
        this.axisCode = axisCode;
        this.deadZone = deadZone;
        this.gamepadLocation = gamepadLocation;
        this._value = 0;
    }
    // ================================================================================================================
    // PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
    GamepadAxisBinding.prototype.matchesGamepadAxis = function (axisCode, gamepadLocation) {
        return this.axisCode == axisCode && (this.gamepadLocation == gamepadLocation || this.gamepadLocation == KeyActionBinder_1.default.GamepadLocations.ANY);
    };
    Object.defineProperty(GamepadAxisBinding.prototype, "value", {
        // ================================================================================================================
        // ACCESSOR INTERFACE ---------------------------------------------------------------------------------------------
        get: function () {
            // The value is returned taking the dead zone into consideration
            if (this._value < 0) {
                return Utils_1.default.map(this._value, -this.deadZone, -1, 0, -1, true);
            }
            else {
                return Utils_1.default.map(this._value, this.deadZone, 1, 0, 1, true);
            }
        },
        set: function (newValue) {
            // The value is set raw
            this._value = newValue;
        },
        enumerable: true,
        configurable: true
    });
    return GamepadAxisBinding;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GamepadAxisBinding;
},{"./KeyActionBinder":5,"./Utils":8}],5:[function(require,module,exports){
var SimpleSignal_1 = require('./../libs/signals/SimpleSignal');
var Action_1 = require('./Action');
var Axis_1 = require('./Axis');
/**
 * Provides universal input control for game controllers and keyboard
 * More info: https://github.com/zeh/key-action-binder.ts
 *
 * @author zeh fernando
 */
var KeyActionBinder = (function () {
    // ================================================================================================================
    // CONSTRUCTOR ----------------------------------------------------------------------------------------------------
    function KeyActionBinder() {
        this.bindCache = {};
        this._isRunning = false;
        this._maintainPlayerPositions = false;
        this.actions = {};
        this.axes = {};
        this._onActionActivated = new SimpleSignal_1.default();
        this._onActionDeactivated = new SimpleSignal_1.default();
        this._onActionValueChanged = new SimpleSignal_1.default();
        this._onDevicesChanged = new SimpleSignal_1.default();
        this._onRecentDeviceChanged = new SimpleSignal_1.default();
        this.currentFrame = 0;
        this.lastFrameGamepadsChecked = 0;
        this.start();
    }
    // ================================================================================================================
    // PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
    /**
     * Starts listening for input events.
     *
     * <p>This happens by default when a KeyActionBinder object is instantiated; this method is only useful if
     * called after <code>stop()</code> has been used.</p>
     *
     * <p>Calling this method when a KeyActionBinder instance is already running has no effect.</p>
     *
     * @see #isRunning
     * @see #stop()
     */
    KeyActionBinder.prototype.start = function () {
        if (!this._isRunning) {
            // Starts listening to keyboard events
            window.addEventListener("keydown", this.getBoundFunction(this.onKeyDown));
            //window.addEventListener("keypress", this.getBoundFunction(this.onKeyDown)); // this fires with completely unrelated key codes; TODO: investigate why
            window.addEventListener("keyup", this.getBoundFunction(this.onKeyUp));
            // Starts listening to device change events
            window.addEventListener("gamepadconnected", this.getBoundFunction(this.onGamepadAdded));
            window.addEventListener("gamepaddisconnected", this.getBoundFunction(this.onGamepadRemoved));
            this.refreshGamepadList();
            this._isRunning = true;
            this.incrementFrameCount();
        }
    };
    /**
     * Stops listening for input events.
     *
     * <p>Action bindings are not lost when a KeyActionBinder instance is stopped; it merely starts ignoring
     * all input events, until <code>start()<code> is called again.</p>
     *
     * <p>This method should always be called when you don't need a KeyActionBinder instance anymore, otherwise
     * it'll be listening to events indefinitely.</p>
     *
     * <p>Calling this method when this a KeyActionBinder instance is already stopped has no effect.</p>
     *
     * @see #isRunning
     * @see #start()
     */
    KeyActionBinder.prototype.stop = function () {
        if (this._isRunning) {
            // Stops listening to keyboard events
            window.removeEventListener("keydown", this.getBoundFunction(this.onKeyDown));
            window.removeEventListener("keyup", this.getBoundFunction(this.onKeyUp));
            // Stops listening to device change events
            window.removeEventListener("gamepadconnected", this.getBoundFunction(this.onGamepadAdded));
            window.removeEventListener("gamepaddisconnected", this.getBoundFunction(this.onGamepadRemoved));
            this._isRunning = false;
        }
    };
    /**
     * Gets an action instance, creating it if necessary
     */
    KeyActionBinder.prototype.action = function (id) {
        // Check gamepad state
        if (this.lastFrameGamepadsChecked < this.currentFrame)
            this.updateGamepadsState();
        // Create Action first if needed
        if (!this.actions.hasOwnProperty(id))
            this.actions[id] = new Action_1.default(id);
        return this.actions[id];
    };
    /**
     * Gets an axis instance, creating it if necessary
     */
    KeyActionBinder.prototype.axis = function (id) {
        // Check gamepad state
        if (this.lastFrameGamepadsChecked < this.currentFrame)
            this.updateGamepadsState();
        // Create Axis first if needed
        if (!this.axes.hasOwnProperty(id))
            this.axes[id] = new Axis_1.default(id);
        return this.axes[id];
    };
    Object.defineProperty(KeyActionBinder.prototype, "onActionActivated", {
        // ================================================================================================================
        // ACCESSOR INTERFACE ---------------------------------------------------------------------------------------------
        get: function () {
            return this._onActionActivated;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyActionBinder.prototype, "onActionDeactivated", {
        get: function () {
            return this._onActionDeactivated;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyActionBinder.prototype, "onActionValueChanged", {
        get: function () {
            return this._onActionValueChanged;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyActionBinder.prototype, "onDevicesChanged", {
        get: function () {
            return this._onDevicesChanged;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyActionBinder.prototype, "onRecentDeviceChanged", {
        get: function () {
            return this._onRecentDeviceChanged;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyActionBinder.prototype, "isRunning", {
        /**
         * Whether this KeyActionBinder instance is running, or not. This property is read-only.
         *
         * @see #start()
         * @see #stop()
         */
        get: function () {
            return this._isRunning;
        },
        enumerable: true,
        configurable: true
    });
    // ================================================================================================================
    // EVENT INTERFACE ------------------------------------------------------------------------------------------------
    KeyActionBinder.prototype.onKeyDown = function (e) {
        for (var iis in this.actions)
            this.actions[iis].interpretKeyDown(e.keyCode, e.location);
        for (var iis in this.axes)
            this.axes[iis].interpretKeyDown(e.keyCode, e.location);
    };
    KeyActionBinder.prototype.onKeyUp = function (e) {
        for (var iis in this.actions)
            this.actions[iis].interpretKeyUp(e.keyCode, e.location);
        for (var iis in this.axes)
            this.axes[iis].interpretKeyUp(e.keyCode, e.location);
    };
    KeyActionBinder.prototype.onGamepadAdded = function (e) {
        this.refreshGamepadList();
    };
    KeyActionBinder.prototype.onGamepadRemoved = function (e) {
        this.refreshGamepadList();
    };
    // ================================================================================================================
    // PRIVATE INTERFACE ----------------------------------------------------------------------------------------------
    KeyActionBinder.prototype.incrementFrameCount = function () {
        if (this._isRunning) {
            this.currentFrame++;
            window.requestAnimationFrame(this.incrementFrameCount.bind(this));
        }
    };
    /**
     * Update the known state of all buttons/axis
     */
    KeyActionBinder.prototype.updateGamepadsState = function () {
        //console.time("check");
        // Check all buttons of all gamepads
        var gamepads = navigator.getGamepads();
        var gamepad;
        var i, j, l;
        var action;
        var buttons;
        var axis;
        var axes;
        // For all gamepads...
        for (i = 0; i < gamepads.length; i++) {
            gamepad = gamepads[i];
            if (gamepad != null) {
                // ..and all actions...
                for (var iis in this.actions) {
                    action = this.actions[iis];
                    // ...interpret all gamepad buttons
                    buttons = gamepad.buttons;
                    l = buttons.length;
                    for (j = 0; j < l; j++) {
                        action.interpretGamepadButton(j, i, buttons[j].pressed, buttons[j].value);
                    }
                }
                // And in all axes...
                for (var iis in this.axes) {
                    axis = this.axes[iis];
                    // ...and all gamepad axes
                    axes = gamepad.axes;
                    l = axes.length;
                    for (j = 0; j < l; j++) {
                        axis.interpretGamepadAxis(j, i, axes[j]);
                    }
                }
            }
        }
        this.lastFrameGamepadsChecked = this.currentFrame;
        //console.timeEnd("check");
    };
    KeyActionBinder.prototype.refreshGamepadList = function () {
        // The list of game devices has changed
        // TODO: implement _maintainPlayerPositions ? Apparently the browser already does something like that...
        //console.log("List of gamepads refreshed, new list = " + navigator.getGamepads().length + " items");
        // Dispatch the signal
        this._onDevicesChanged.dispatch();
    };
    /**
     * Utility function: creates a function bound to "this".
     * This needs to be stored because the same reference needs to be used when removing listeners.
     */
    KeyActionBinder.prototype.getBoundFunction = function (func) {
        if (!this.bindCache.hasOwnProperty(func)) {
            this.bindCache[func] = func.bind(this);
        }
        return this.bindCache[func];
    };
    // Constants
    KeyActionBinder.VERSION = "1.0.0";
    // Enums (Internal)
    KeyActionBinder.KeyCodes = {
        ANY: 81653812,
        A: 65,
        ALT: 18,
        B: 66,
        BACKQUOTE: 192,
        BACKSLASH: 220,
        BACKSPACE: 8,
        C: 67,
        CAPS_LOCK: 20,
        COMMA: 188,
        CTRL: 17,
        D: 68,
        DELETE: 46,
        DOWN: 40,
        E: 69,
        END: 35,
        ENTER: 13,
        EQUAL: 187,
        ESCAPE: 27,
        F: 70,
        F1: 112,
        F10: 121,
        F11: 122,
        F12: 123,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        G: 71,
        H: 72,
        HOME: 36,
        I: 73,
        INSERT: 45,
        J: 74,
        K: 75,
        L: 76,
        LEFT: 37,
        LEFTBRACKET: 219,
        M: 77,
        MINUS: 189,
        N: 78,
        NUMBER_0: 48,
        NUMBER_1: 49,
        NUMBER_2: 50,
        NUMBER_3: 51,
        NUMBER_4: 52,
        NUMBER_5: 53,
        NUMBER_6: 54,
        NUMBER_7: 55,
        NUMBER_8: 56,
        NUMBER_9: 57,
        NUMPAD_0: 96,
        NUMPAD_1: 97,
        NUMPAD_2: 98,
        NUMPAD_3: 99,
        NUMPAD_4: 100,
        NUMPAD_5: 101,
        NUMPAD_6: 102,
        NUMPAD_7: 103,
        NUMPAD_8: 104,
        NUMPAD_9: 105,
        NUMPAD_ADD: 107,
        NUMPAD_DECIMAL: 110,
        NUMPAD_DIVIDE: 111,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_SUBTRACT: 109,
        NUM_LOCK: 144,
        O: 79,
        P: 80,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PAUSE: 19,
        PERIOD: 190,
        Q: 81,
        QUOTE: 222,
        R: 82,
        RIGHT: 39,
        RIGHTBRACKET: 221,
        S: 83,
        SCROLL_LOCK: 145,
        SELECT: 93,
        SEMICOLON: 186,
        SHIFT: 16,
        SLASH: 191,
        SPACE: 32,
        T: 84,
        TAB: 9,
        U: 85,
        UP: 38,
        V: 86,
        W: 87,
        WINDOWS_LEFT: 91,
        WINDOWS_RIGHT: 92,
        X: 88,
        Y: 89,
        Z: 90
    };
    KeyActionBinder.KeyLocations = {
        ANY: 81653813,
        STANDARD: 0,
        LEFT: 1,
        RIGHT: 2,
        NUMPAD: 3,
    };
    KeyActionBinder.GamepadLocations = {
        ANY: 81653814,
    };
    KeyActionBinder.GamepadButtons = {
        ANY: { index: 81653815 },
        ACTION_DOWN: { index: 0 },
        ACTION_RIGHT: { index: 1 },
        ACTION_LEFT: { index: 2 },
        ACTION_UP: { index: 3 },
        LEFT_SHOULDER: { index: 4 },
        RIGHT_SHOULDER: { index: 5 },
        LEFT_SHOULDER_BOTTOM: { index: 6 },
        RIGHT_SHOULDER_BOTTOM: { index: 7 },
        SELECT: { index: 8 },
        START: { index: 9 },
        STICK_LEFT_PRESS: { index: 10 },
        STICK_RIGHT_PRESS: { index: 11 },
        DPAD_UP: { index: 12 },
        DPAD_DOWN: { index: 13 },
        DPAD_LEFT: { index: 14 },
        DPAD_RIGHT: { index: 15 }
    };
    KeyActionBinder.GamepadAxes = {
        STICK_LEFT_X: { index: 0 },
        STICK_LEFT_Y: { index: 1 },
        STICK_RIGHT_X: { index: 2 },
        STICK_RIGHT_Y: { index: 3 }
    };
    return KeyActionBinder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KeyActionBinder;
// Create a global object with the class - only used in the single file version, replaced at build time
window["KeyActionBinder"] = KeyActionBinder;
},{"./../libs/signals/SimpleSignal":9,"./Action":1,"./Axis":2}],6:[function(require,module,exports){
var KeyActionBinder_1 = require('./KeyActionBinder');
/**
 * Information on a keyboard event filter
 */
var KeyboardActionBinding = (function () {
    // ================================================================================================================
    // CONSTRUCTOR ----------------------------------------------------------------------------------------------------
    function KeyboardActionBinding(keyCode, keyLocation) {
        this.keyCode = keyCode;
        this.keyLocation = keyLocation;
        this.isActivated = false;
    }
    // ================================================================================================================
    // PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
    KeyboardActionBinding.prototype.matchesKeyboardKey = function (keyCode, keyLocation) {
        return (this.keyCode == keyCode || this.keyCode == KeyActionBinder_1.default.KeyCodes.ANY) && (this.keyLocation == keyLocation || this.keyLocation == KeyActionBinder_1.default.KeyLocations.ANY);
    };
    return KeyboardActionBinding;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KeyboardActionBinding;
},{"./KeyActionBinder":5}],7:[function(require,module,exports){
var KeyActionBinder_1 = require('./KeyActionBinder');
var Utils_1 = require('./Utils');
/**
 * Information on a keyboard event filter
 */
var KeyboardAxisBinding = (function () {
    // ================================================================================================================
    // CONSTRUCTOR ----------------------------------------------------------------------------------------------------
    function KeyboardAxisBinding(keyCodeA, keyCodeB, keyLocationA, keyLocationB, transitionTimeSeconds) {
        this.keyCodeA = keyCodeA;
        this.keyLocationA = keyLocationA;
        this.keyCodeB = keyCodeB;
        this.keyLocationB = keyLocationB;
        this.transitionTime = transitionTimeSeconds * 1000;
        this.timeLastChange = NaN;
        this.targetValue = this.previousValue = 0;
    }
    // ================================================================================================================
    // PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
    KeyboardAxisBinding.prototype.matchesKeyboardKeyStart = function (keyCode, keyLocation) {
        return (this.keyCodeA == keyCode || this.keyCodeA == KeyActionBinder_1.default.KeyCodes.ANY) && (this.keyLocationA == keyLocation || this.keyLocationA == KeyActionBinder_1.default.KeyLocations.ANY);
    };
    KeyboardAxisBinding.prototype.matchesKeyboardKeyEnd = function (keyCode, keyLocation) {
        return (this.keyCodeB == keyCode || this.keyCodeB == KeyActionBinder_1.default.KeyCodes.ANY) && (this.keyLocationB == keyLocation || this.keyLocationB == KeyActionBinder_1.default.KeyLocations.ANY);
    };
    Object.defineProperty(KeyboardAxisBinding.prototype, "value", {
        // ================================================================================================================
        // ACCESSOR INTERFACE ---------------------------------------------------------------------------------------------
        get: function () {
            // TODO: this is linear.. add some easing?
            if (isNaN(this.timeLastChange))
                return this.targetValue;
            return Utils_1.default.map(Date.now(), this.timeLastChange, this.timeLastChange + this.currentTransitionTime, this.previousValue, this.targetValue, true);
        },
        set: function (newValue) {
            if (newValue != this.targetValue) {
                this.previousValue = this.value;
                this.targetValue = newValue;
                this.currentTransitionTime = Utils_1.default.map(Math.abs(this.targetValue - this.previousValue), 0, 1, 0, this.transitionTime);
                this.timeLastChange = Date.now();
            }
        },
        enumerable: true,
        configurable: true
    });
    return KeyboardAxisBinding;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KeyboardAxisBinding;
},{"./KeyActionBinder":5,"./Utils":8}],8:[function(require,module,exports){
/**
* Utility pure functions
*/
var Utils = (function () {
    function Utils() {
    }
    /**
     * Maps a value from a range, determined by old minimum and maximum values, to a new range, determined by new minimum and maximum values. These minimum and maximum values are referential; the new value is not clamped by them.
     * @param value	The value to be re-mapped.
     * @param oldMin	The previous minimum value.
     * @param oldMax	The previous maximum value.
     * @param newMin	The new minimum value.
     * @param newMax	The new maximum value.
     * @return			The new value, mapped to the new range.
     */
    Utils.map = function (value, oldMin, oldMax, newMin, newMax, clamp) {
        if (newMin === void 0) { newMin = 0; }
        if (newMax === void 0) { newMax = 1; }
        if (clamp === void 0) { clamp = false; }
        if (oldMin == oldMax)
            return newMin;
        var p = ((value - oldMin) / (oldMax - oldMin) * (newMax - newMin)) + newMin;
        if (clamp)
            p = newMin < newMax ? this.clamp(p, newMin, newMax) : Utils.clamp(p, newMax, newMin);
        return p;
    };
    /**
     * Clamps a number to a range, by restricting it to a minimum and maximum values: if the passed value is lower than the minimum value, it's replaced by the minimum; if it's higher than the maximum value, it's replaced by the maximum; if not, it's unchanged.
     * @param value	The value to be clamped.
     * @param min		Minimum value allowed.
     * @param max		Maximum value allowed.
     * @return			The newly clamped value.
     */
    Utils.clamp = function (value, min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return value < min ? min : value > max ? max : value;
    };
    return Utils;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Utils;
},{}],9:[function(require,module,exports){
/**
 * @author zeh fernando
 */
var SimpleSignal = (function () {
    // ================================================================================================================
    // CONSTRUCTOR ----------------------------------------------------------------------------------------------------
    function SimpleSignal() {
        // Super-simple signals class inspired by Robert Penner's AS3Signals:
        // http://github.com/robertpenner/as3-signals
        // Properties
        this.functions = [];
    }
    // ================================================================================================================
    // PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
    SimpleSignal.prototype.add = function (func) {
        if (this.functions.indexOf(func) == -1) {
            this.functions.push(func);
            return true;
        }
        return false;
    };
    SimpleSignal.prototype.remove = function (func) {
        this.ifr = this.functions.indexOf(func);
        if (this.ifr > -1) {
            this.functions.splice(this.ifr, 1);
            return true;
        }
        return false;
    };
    SimpleSignal.prototype.removeAll = function () {
        if (this.functions.length > 0) {
            this.functions.length = 0;
            return true;
        }
        return false;
    };
    SimpleSignal.prototype.dispatch = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var functionsDuplicate = this.functions.concat();
        for (var i = 0; i < functionsDuplicate.length; i++) {
            functionsDuplicate[i].apply(undefined, args);
        }
    };
    Object.defineProperty(SimpleSignal.prototype, "numItems", {
        // ================================================================================================================
        // ACCESSOR INTERFACE ---------------------------------------------------------------------------------------------
        get: function () {
            return this.functions.length;
        },
        enumerable: true,
        configurable: true
    });
    return SimpleSignal;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SimpleSignal;
},{}]},{},[5]);

const Scratch3EV3 = require('../scratch3_ev3/index');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const uid = require('../../util/uid');
const BT = require('../../io/bt');
const Base64Util = require('../../util/base64-util');
const MathUtil = require('../../util/math-util');
const log = require('../../util/log');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI0MHB4IiB2aWV3Qm94PSIwIDAgNDAgNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUwLjIgKDU1MDQ3KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5ldjMtYmxvY2staWNvbjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJldjMtYmxvY2staWNvbiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9ImV2MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNS41MDAwMDAsIDMuNTAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS1wYXRoIiBzdHJva2U9IiM3Qzg3QTUiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgeD0iMC41IiB5PSIzLjU5IiB3aWR0aD0iMjgiIGhlaWdodD0iMjUuODEiIHJ4PSIxIj48L3JlY3Q+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtcGF0aCIgc3Ryb2tlPSIjN0M4N0E1IiBmaWxsPSIjRTZFN0U4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHg9IjIuNSIgeT0iMC41IiB3aWR0aD0iMjQiIGhlaWdodD0iMzIiIHJ4PSIxIj48L3JlY3Q+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtcGF0aCIgc3Ryb2tlPSIjN0M4N0E1IiBmaWxsPSIjRkZGRkZGIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHg9IjIuNSIgeT0iMTQuNSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjEzIj48L3JlY3Q+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNC41LDEwLjUgTDE0LjUsMTQuNSIgaWQ9IlNoYXBlIiBzdHJva2U9IiM3Qzg3QTUiIGZpbGw9IiNFNkU3RTgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLXBhdGgiIGZpbGw9IiM0MTQ3NTciIHg9IjQuNSIgeT0iMi41IiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIHJ4PSIxIj48L3JlY3Q+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtcGF0aCIgZmlsbD0iIzdDODdBNSIgb3BhY2l0eT0iMC41IiB4PSIxMy41IiB5PSIyMC4xMyIgd2lkdGg9IjIiIGhlaWdodD0iMiIgcng9IjAuNSI+PC9yZWN0PgogICAgICAgICAgICA8cGF0aCBkPSJNOS4wNiwyMC4xMyBMMTAuNTYsMjAuMTMgQzEwLjgzNjE0MjQsMjAuMTMgMTEuMDYsMjAuMzUzODU3NiAxMS4wNiwyMC42MyBMMTEuMDYsMjEuNjMgQzExLjA2LDIxLjkwNjE0MjQgMTAuODM2MTQyNCwyMi4xMyAxMC41NiwyMi4xMyBMOS4wNiwyMi4xMyBDOC41MDc3MTUyNSwyMi4xMyA4LjA2LDIxLjY4MjI4NDcgOC4wNiwyMS4xMyBDOC4wNiwyMC41Nzc3MTUzIDguNTA3NzE1MjUsMjAuMTMgOS4wNiwyMC4xMyBaIiBpZD0iU2hhcGUiIGZpbGw9IiM3Qzg3QTUiIG9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguOTEsMjAuMTMgTDIwLjQyLDIwLjEzIEMyMC42OTYxNDI0LDIwLjEzIDIwLjkyLDIwLjM1Mzg1NzYgMjAuOTIsMjAuNjMgTDIwLjkyLDIxLjYzIEMyMC45MiwyMS45MDYxNDI0IDIwLjY5NjE0MjQsMjIuMTMgMjAuNDIsMjIuMTMgTDE4LjkyLDIyLjEzIEMxOC4zNjc3MTUzLDIyLjEzIDE3LjkyLDIxLjY4MjI4NDcgMTcuOTIsMjEuMTMgQzE3LjkxOTk3MjYsMjAuNTgxNTk3IDE4LjM2MTYyNDUsMjAuMTM1NDg0IDE4LjkxLDIwLjEzIFoiIGlkPSJTaGFwZSIgZmlsbD0iIzdDODdBNSIgb3BhY2l0eT0iMC41IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOS40MjAwMDAsIDIxLjEzMDAwMCkgcm90YXRlKC0xODAuMDAwMDAwKSB0cmFuc2xhdGUoLTE5LjQyMDAwMCwgLTIxLjEzMDAwMCkgIj48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik04LjIzLDE3LjUgTDUsMTcuNSBDNC43MjM4NTc2MywxNy41IDQuNSwxNy4yNzYxNDI0IDQuNSwxNyBMNC41LDE0LjUgTDEwLjUsMTQuNSBMOC42NSwxNy4yOCBDOC41NTQ2Njk2MSwxNy40MTc5MDgyIDguMzk3NjUwMDYsMTcuNTAwMTU2NiA4LjIzLDE3LjUgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjN0M4N0E1IiBvcGFjaXR5PSIwLjUiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTE4LjE1LDE4Ljg1IEwxNy42NSwxOS4zNSBDMTcuNTUyMzQxNiwxOS40NDQwNzU2IDE3LjQ5ODAzMzksMTkuNTc0NDE0MiAxNy41LDE5LjcxIEwxNy41LDIwIEMxNy41LDIwLjI3NjE0MjQgMTcuMjc2MTQyNCwyMC41IDE3LDIwLjUgTDE2LjUsMjAuNSBDMTYuMjIzODU3NiwyMC41IDE2LDIwLjI3NjE0MjQgMTYsMjAgQzE2LDE5LjcyMzg1NzYgMTUuNzc2MTQyNCwxOS41IDE1LjUsMTkuNSBMMTMuNSwxOS41IEMxMy4yMjM4NTc2LDE5LjUgMTMsMTkuNzIzODU3NiAxMywyMCBDMTMsMjAuMjc2MTQyNCAxMi43NzYxNDI0LDIwLjUgMTIuNSwyMC41IEwxMiwyMC41IEMxMS43MjM4NTc2LDIwLjUgMTEuNSwyMC4yNzYxNDI0IDExLjUsMjAgTDExLjUsMTkuNzEgQzExLjUwMTk2NjEsMTkuNTc0NDE0MiAxMS40NDc2NTg0LDE5LjQ0NDA3NTYgMTEuMzUsMTkuMzUgTDEwLjg1LDE4Ljg1IEMxMC42NTgyMTY3LDE4LjY1MjE4NjMgMTAuNjU4MjE2NywxOC4zMzc4MTM3IDEwLjg1LDE4LjE0IEwxMi4zNiwxNi42NSBDMTIuNDUwMjgwMywxNi41NTI4NjE3IDEyLjU3NzM5NjEsMTYuNDk4MzgzNSAxMi43MSwxNi41IEwxNi4yOSwxNi41IEMxNi40MjI2MDM5LDE2LjQ5ODM4MzUgMTYuNTQ5NzE5NywxNi41NTI4NjE3IDE2LjY0LDE2LjY1IEwxOC4xNSwxOC4xNCBDMTguMzQxNzgzMywxOC4zMzc4MTM3IDE4LjM0MTc4MzMsMTguNjUyMTg2MyAxOC4xNSwxOC44NSBaIiBpZD0iU2hhcGUiIGZpbGw9IiM3Qzg3QTUiIG9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTAuODUsMjMuNDUgTDExLjM1LDIyLjk1IEMxMS40NDc2NTg0LDIyLjg1NTkyNDQgMTEuNTAxOTY2MSwyMi43MjU1ODU4IDExLjUsMjIuNTkgTDExLjUsMjIuMyBDMTEuNSwyMi4wMjM4NTc2IDExLjcyMzg1NzYsMjEuOCAxMiwyMS44IEwxMi41LDIxLjggQzEyLjc3NjE0MjQsMjEuOCAxMywyMi4wMjM4NTc2IDEzLDIyLjMgQzEzLDIyLjU3NjE0MjQgMTMuMjIzODU3NiwyMi44IDEzLjUsMjIuOCBMMTUuNSwyMi44IEMxNS43NzYxNDI0LDIyLjggMTYsMjIuNTc2MTQyNCAxNiwyMi4zIEMxNiwyMi4wMjM4NTc2IDE2LjIyMzg1NzYsMjEuOCAxNi41LDIxLjggTDE3LDIxLjggQzE3LjI3NjE0MjQsMjEuOCAxNy41LDIyLjAyMzg1NzYgMTcuNSwyMi4zIEwxNy41LDIyLjU5IEMxNy40OTgwMzM5LDIyLjcyNTU4NTggMTcuNTUyMzQxNiwyMi44NTU5MjQ0IDE3LjY1LDIyLjk1IEwxOC4xNSwyMy40NSBDMTguMzQwNTcxNCwyMy42NDQ0MjE4IDE4LjM0MDU3MTQsMjMuOTU1NTc4MiAxOC4xNSwyNC4xNSBMMTYuNjQsMjUuNjUgQzE2LjU0OTcxOTcsMjUuNzQ3MTM4MyAxNi40MjI2MDM5LDI1LjgwMTYxNjUgMTYuMjksMjUuOCBMMTIuNzEsMjUuOCBDMTIuNTc3Mzk2MSwyNS44MDE2MTY1IDEyLjQ1MDI4MDMsMjUuNzQ3MTM4MyAxMi4zNiwyNS42NSBMMTAuODUsMjQuMTUgQzEwLjY1OTQyODYsMjMuOTU1NTc4MiAxMC42NTk0Mjg2LDIzLjY0NDQyMTggMTAuODUsMjMuNDUgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjN0M4N0E1IiBvcGFjaXR5PSIwLjUiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTIxLjUsMjcuNSBMMjYuNSwyNy41IEwyNi41LDMxLjUgQzI2LjUsMzIuMDUyMjg0NyAyNi4wNTIyODQ3LDMyLjUgMjUuNSwzMi41IEwyMS41LDMyLjUgTDIxLjUsMjcuNSBaIiBpZD0iU2hhcGUiIHN0cm9rZT0iI0NDNEMyMyIgZmlsbD0iI0YxNUEyOSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';

/**
 * Enum for Ev3 direct command types.
 * Found in the 'EV3 Communication Developer Kit', section 4, page 24, at
 * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
 * @readonly
 * @enum {number}
 */
const Ev3Command = {
    DIRECT_COMMAND_REPLY: 0x00,
    DIRECT_COMMAND_NO_REPLY: 0x80,
    DIRECT_REPLY: 0x02
};

/**
 * Enum for Ev3 commands opcodes.
 * Found in the 'EV3 Firmware Developer Kit', section 4, page 10, at
 * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
 * @readonly
 * @enum {number}
 */
const Ev3Opcode = {
    OPOUTPUT_STEP_SPEED: 0xAE,
    OPOUTPUT_TIME_SPEED: 0xAF,
    OPOUTPUT_STOP: 0xA3,
    OPOUTPUT_RESET: 0xA2,
    OPOUTPUT_STEP_SYNC: 0xB0,
    OPOUTPUT_TIME_SYNC: 0xB1,
    OPOUTPUT_GET_COUNT: 0xB3,
    OPSOUND: 0x94,
    OPSOUND_CMD_TONE: 1,
    OPSOUND_CMD_STOP: 0,
    OPINPUT_DEVICE_LIST: 0x98,
    OPINPUT_READSI: 0x9D
};

/**
 * Enum for Ev3 values used as arguments to various opcodes.
 * Found in the 'EV3 Firmware Developer Kit', section4, page 10, at
 * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
 * @readonly
 * @enum {string}
 */
const Ev3Value = {
    LAYER: 0x00, // always 0, chained EV3s not supported
    NUM8: 0x81, // "1 byte to follow"
    NUM16: 0x82, // "2 bytes to follow"
    NUM32: 0x83, // "4 bytes to follow"
    COAST: 0x00,
    BRAKE: 0x01,
    LONG_RAMP: 50,
    DO_NOT_CHANGE_TYPE: 0
};

/**
 * Enum for Ev3 device type numbers.
 * Found in the 'EV3 Firmware Developer Kit', section 5, page 100, at
 * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
 * @readonly
 * @enum {string}
 */
const Ev3Device = {
    29: 'color',
    30: 'ultrasonic',
    32: 'gyro',
    16: 'touch',
    8: 'mediumMotor',
    7: 'largeMotor',
    126: 'none',
    125: 'none'
};

/**
 * Enum for Ev3 device modes.
 * Found in the 'EV3 Firmware Developer Kit', section 5, page 100, at
 * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
 * @readonly
 * @enum {number}
 */
const Ev3Mode = {
    touch: [0, 0, 0, 0], // touch
    color: [1, 1, 1, 1], // ambient
    ultrasonic: [0, 0, 0, 0], // cm
    gyro: [0, 0, 0, 0],
    none: [0, 0, 0, 0]
};

let Ev3UpdateStatus = {
    0 : 1,
    1 : 1,
    2 : 1,
    3 : 1
}

/**
 * Enum for Ev3 device labels used in the Scratch blocks/UI.
 * @readonly
 * @enum {string}
 */
const Ev3Label = { // TODO: rename?
    touch: 'button',
    color: 'brightness',
    ultrasonic: 'distance',
    gyro: 'angle'
};

/**
 * Manage power, direction, and timers for one EV3 motor.
 */
class EV3Motor {

    /**
     * Construct a EV3 Motor instance, which could be of type 'largeMotor' or
     * 'mediumMotor'.
     *
     * @param {EV3} parent - the EV3 peripheral which owns this motor.
     * @param {int} index - the zero-based index of this motor on its parent peripheral.
     * @param {string} type - the type of motor (i.e. 'largeMotor' or 'mediumMotor').
     */
    constructor(parent, index, type) {
        /**
         * The EV3 peripheral which owns this motor.
         * @type {EV3}
         * @private
         */
        this._parent = parent;

        /**
         * The zero-based index of this motor on its parent peripheral.
         * @type {int}
         * @private
         */
        this._index = index;

        /**
         * The type of EV3 motor this could be: 'largeMotor' or 'mediumMotor'.
         * @type {string}
         * @private
         */
        this._type = type;

        /**
         * This motor's current direction: 1 for "clockwise" or -1 for "counterclockwise"
         * @type {number}
         * @private
         */
        this._direction = 1;

        /**
         * This motor's current power level, in the range [0,100].
         * @type {number}
         * @private
         */
        this._power = 50;

        /**
         * This motor's current position, in the range [0,360].
         * @type {number}
         * @private
         */
        this._position = 0;

        this._resetPosition = null;

        /**
         * An ID for the current coast command, to help override multiple coast
         * commands sent in succession.
         * @type {number}
         * @private
         */
        this._commandID = null;

        /**
         * A delay, in milliseconds, to add to coasting, to make sure that a brake
         * first takes effect if one was sent.
         * @type {number}
         * @private
         */
        this._coastDelay = 1000;
    }

    /**
     * @return {string} - this motor's type: 'largeMotor' or 'mediumMotor'
     */
    get type() {
        return this._type;
    }

    /**
     * @param {string} value - this motor's new type: 'largeMotor' or 'mediumMotor'
     */
    set type(value) {
        this._type = value;
    }

    /**
     * @return {int} - this motor's current direction: 1 for "clockwise" or -1 for "counterclockwise"
     */
    get direction() {
        return this._direction;
    }

    /**
     * @param {int} value - this motor's new direction: 1 for "clockwise" or -1 for "counterclockwise"
     */
    set direction(value) {
        if (value < 0) {
            this._direction = -1;
        } else {
            this._direction = 1;
        }
    }

    /**
     * @return {int} - this motor's current power level, in the range [0,100].
     */
    get power() {
        return this._power;
    }

    /**
     * @param {int} value - this motor's new power level, in the range [0,100].
     */
    set power(value) {
        this._power = value;
    }

    /**
     * @return {int} - this motor's current position, in the range [-inf,inf].
     */
    get position() {
        
        return this._resetPosition ? this._position - this._resetPosition : this._position;
    }

    /**
     * @param {int} array - this motor's new position, in the range [0,360].
     */
    set position(array) {
        // tachoValue from Paula
        let value = array[0] + (array[1] * 256) + (array[2] * 256 * 256) + (array[3] * 256 * 256 * 256);
        if (value > 0x7fffffff) {
            value = value - 0x100000000;
        }
        this._position = value;
        if(this._resetPosition == null){
            this._resetPosition = this._position;
        }
    }

    /**
     * Turn this motor on for a specific duration.
     * Found in the 'EV3 Firmware Developer Kit', page 56, at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
     *
     * Opcode arguments:
     * (Data8) LAYER – Specify chain layer number [0 - 3]
     * (Data8) NOS – Output bit field [0x00 – 0x0F]
     * (Data8) SPEED – Power level, [-100 – 100]
     * (Data32) STEP1 – Time in milliseconds for ramp up
     * (Data32) STEP2 – Time in milliseconds for continues run
     * (Data32) STEP3 – Time in milliseconds for ramp down
     * (Data8) BRAKE - Specify break level [0: Float, 1: Break]
     *
     * @param {number} milliseconds - run the motor for this long.
     */
    turnOnFor(milliseconds) {
        if (this._power === 0) return;

        const port = this._portMask(this._index);
        let n = milliseconds;
        let speed = this._power * this._direction;
        const ramp = Ev3Value.LONG_RAMP;

        let byteCommand = [];
        byteCommand[0] = Ev3Opcode.OPOUTPUT_TIME_SPEED;

        // If speed is less than zero, make it positive and multiply the input
        // value by -1
        if (speed < 0) {
            speed = -1 * speed;
            n = -1 * n;
        }
        // If the input value is less than 0
        const dir = (n < 0) ? 0x100 - speed : speed; // step negative or positive
        n = Math.abs(n);
        // Setup motor run duration and ramping behavior
        let rampup = ramp;
        let rampdown = ramp;
        let run = n - (ramp * 2);
        if (run < 0) {
            rampup = Math.floor(n / 2);
            run = 0;
            rampdown = n - rampup;
        }
        // Generate motor command values
        const runcmd = this._runValues(run);
        byteCommand = byteCommand.concat([
            Ev3Value.LAYER,
            port,
            Ev3Value.NUM8,
            dir & 0xff,
            Ev3Value.NUM8,
            rampup
        ]).concat(runcmd.concat([
            Ev3Value.NUM8,
            rampdown,
            Ev3Value.BRAKE
        ]));

        const cmd = this._parent.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY,
            byteCommand
        );

        this._parent.send(cmd);

        this.coastAfter(milliseconds);
    }


    turnOn() {
        if (this._power === 0) return;

        const port = this._portMask(this._index);
        let speed = this._power * this._direction;
        const ramp = Ev3Value.LONG_RAMP;

        let byteCommand = [];
        byteCommand[0] = Ev3Opcode.OPOUTPUT_TIME_SPEED;

        // If speed is less than zero, make it positive and multiply the input
        // value by -1
        const dir = (speed < 0) ? 0x100 - (-1 * speed) : speed; // step negative or positive

        if (speed < 0) {
            speed = -1 * speed;
        }
        // If the input value is less than 0
        // Setup motor run duration and ramping behavior
        let rampup = ramp;
        let rampdown = ramp;
        // Generate motor command values
        const runcmd = this._runValues(0xffff);
        byteCommand = byteCommand.concat([
            Ev3Value.LAYER,
            port,
            Ev3Value.NUM8,
            dir & 0xff,
            Ev3Value.NUM8,
            rampup
        ]).concat(runcmd.concat([
            Ev3Value.NUM8,
            rampdown,
            Ev3Value.BRAKE
        ]));

        const cmd = this._parent.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY,
            byteCommand
        );

        this._parent.send(cmd);

        //  this.coastAfter(milliseconds);
    }


    rotate(position) {
        if (this._power === 0)  return ;

        const current = this.position  + position;
        const port = this._portMask(this._index);
        let speed = this._power * this._direction;

        let byteCommand = [];
        byteCommand[0] = Ev3Opcode.OPOUTPUT_STEP_SPEED;

        // If speed is less than zero, make it positive and multiply the input
        // value by -1

        if (speed < 0) {
            speed = -1 * speed;
        }
        const forward = (position >= 0);
        const dir = (position < 0) ? 0x100 - (speed) : speed; // step negative or positive

        // If the input value is less than 0
        // Setup motor run duration and ramping behavior
        if (position < 0) {
            position *= -1;
        }
        const ramp = Math.min(position / 4, Ev3Value.LONG_RAMP);
        let rampup = ramp;
        let rampdown = ramp;
        position = position - rampup - rampdown;
        // Generate motor command values
        const runcmd = [
            Ev3Value.NUM32,
            position & 0xff,
            (position >> 8) & 0xff,
            (position >> 16) & 0xff,
            (position >> 24) & 0xff
        ];
        byteCommand = byteCommand.concat([
            Ev3Value.LAYER,
            port,
            Ev3Value.NUM8,
            dir & 0xff,
            Ev3Value.NUM32,
            rampup & 0xff,
            (rampup >> 8) & 0xff,
            (rampup >> 16) & 0xff,
            (rampup >> 24) & 0xff
        ]).concat(runcmd.concat([
            Ev3Value.NUM32,
            rampdown & 0xff,
            (rampdown >> 8) & 0xff,
            (rampdown >> 16) & 0xff,
            (rampdown >> 24) & 0xff,
            Ev3Value.BRAKE
        ]));

        const cmd = this._parent.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY,
            byteCommand
        );

        this._parent.send(cmd);

        function wait(motor,target,forward,oldPosition,counter,resolve){
          let position = motor.position;
          if(position == oldPosition){
            counter++;
          } else {
            counter = 0; 
          }
          oldPosition = position;
          if (counter != 20 && ((forward && target - 5 > position) || (!forward && target + 5 < position))){
            setTimeout(() => {
              wait(motor,target,forward,oldPosition,counter,resolve)
            },100);
          } else {
            setTimeout(() => {
                resolve();
            },1000);
          }
        }

        return new Promise(resolve => {
          wait(this,current,forward,null,0,resolve);
        });
    }


    /**
     * Set the motor to coast after a specified amount of time.
     * TODO: rename this startBraking?
     * @param {number} time - the time in milliseconds.
     */
    coastAfter(time) {
        if (this._power === 0) return;

        // Set the motor command id to check before starting coast
        const commandId = uid();
        this._commandID = commandId;

        // Send coast message
        setTimeout(() => {
            // Do not send coast if another motor command changed the command id.
            if (this._commandID === commandId) {
                this.coast();
                this._commandID = null;
            }
        }, time + this._coastDelay); // add a delay so the brake takes effect
    }

    /**
     * Set the motor to coast.
     */
    coast() {
        if (this._power === 0) return;

        const cmd = this._parent.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY, [
                Ev3Opcode.OPOUTPUT_STOP,
                Ev3Value.LAYER,
                this._portMask(this._index), // port output bit field
                Ev3Value.COAST
            ]
        );

        this._parent.send(cmd);
    }

    /**
     * Reset motor position
     */
    resetPosition() {
        this._resetPosition = this._position;
        /*const cmd = this._parent.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY, [
                Ev3Opcode.OPOUTPUT_RESET,
                Ev3Value.LAYER,
                this._portMask(this._index) // port output bit field
            ]
        );

        this._parent.send(cmd);*/
    }

    /**
     * Set the motor to coast.
     */
    break () {
        if (this._power === 0) return;

        const cmd = this._parent.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY, [
                Ev3Opcode.OPOUTPUT_STOP,
                Ev3Value.LAYER,
                this._portMask(this._index), // port output bit field
                Ev3Value.BRAKE
            ]
        );

        this._parent.send(cmd);
    }

    /**
     * Generate motor run values for a given input.
     * @param  {number} run - run input.
     * @return {array} - run values as a byte array.
     */
    _runValues(run) {
        // If run duration is less than max 16-bit integer
        if (run < 0x7fff) {
            return [
                Ev3Value.NUM16,
                run & 0xff,
                (run >> 8) & 0xff
            ];
        }

        // Run forever
        return [
            Ev3Value.NUM32,
            run & 0xff,
            (run >> 8) & 0xff,
            (run >> 16) & 0xff,
            (run >> 24) & 0xff
        ];
    }

    /**
     * Return a port value for the EV3 that is in the format for 'output bit field'
     * as 1/2/4/8, generally needed for motor ports, instead of the typical 0/1/2/3.
     * The documentation in the 'EV3 Firmware Developer Kit' for motor port arguments
     * is sometimes mistaken, but we believe motor ports are mostly addressed this way.
     * @param {number} port - the port number to convert to an 'output bit field'.
     * @return {number} - the converted port number.
     */
    _portMask(port) {
        return Math.pow(2, port);
    }
}

class EV3 {

    constructor(runtime, extensionId) {

        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * A list of the names of the sensors connected in ports 1,2,3,4.
         * @type {string[]}
         * @private
         */
        this._sensorPorts = [];

        /**
         * A list of the names of the motors connected in ports A,B,C,D.
         * @type {string[]}
         * @private
         */
        this._motorPorts = [];

        /**
         * The state of all sensor values.
         * @type {string[]}
         * @private
         */
        this._sensors = {
            distance: [0, 0, 0, 0],
            angle: [0, 0, 0, 0],
            brightness: [0, 0, 0, 0],
            buttons: [0, 0, 0, 0],
            color: [0, 0, 0, 0]
        };

        /**
         * The motors which this EV3 could possibly have connected.
         * @type {string[]}
         * @private
         */
        this._motors = [null, null, null, null];

        /**
         * The polling interval, in milliseconds.
         * @type {number}
         * @private
         */
        this._pollingInterval = 150;

        /**
         * The polling interval ID.
         * @type {number}
         * @private
         */
        this._pollingIntervalID = null;

        /**
         * The counter keeping track of polling cycles.
         * @type {string[]}
         * @private
         */
        this._pollingCounter = 0;

        /**
         * The Bluetooth socket connection for reading/writing peripheral data.
         * @type {BT}
         * @private
         */
        this._bt = null;
        this._runtime.registerPeripheralExtension(extensionId, this);
        this.disconnect = this.disconnect.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._pollValues = this._pollValues.bind(this);
    }

    distance(port) {
        let value = 0;
        if (!port) {
            port = this.findFirst("distance");
        }
        if (port == -1) {
            return;
        }
        if (Ev3Label[this._sensorPorts[port]] !== "distance") {
            return;
        }
        value = this._sensors.distance[port];
        value = value > 255 ? 255 : value;
        value = value < 0 ? 0 : value;
        value = Math.round(100 * value) / 100;

        return value;
    }

    brightness(port) {

        let value = 0;
        Ev3Label.color = "brightness";
        if (!port) {
            port = this.findFirst("brightness");
        }
        if (port == -1) {
            return;
        }
        if (Ev3Label[this._sensorPorts[port]] !== "brightness") {
            return;
        }
        Ev3Mode[this._sensorPorts[port]][port] = 1;
        value = this._sensors.brightness[port];
        return value;
    }

    color(port) {
        let value = 0;
        Ev3Label.color = "color";
        if (!port) {
            port = this.findFirst("color");
        }
        if (port == -1) {
            return;
        }
        if (Ev3Label[this._sensorPorts[port]] !== "color") {
            return;
        }
        Ev3Mode[this._sensorPorts[port]][port] = 2;
        value = this._sensors.color[port];

        return value;
    }

    angle(port) {
        let value = 0;
        if (!port) {
            port = this.findFirst("angle");
        }
        if (port == -1) {
            return;
        }
        if (Ev3Label[this._sensorPorts[port]] !== "angle") {
            return;
        }
        value = this._sensors.angle[port];
        return value;
    }

    resetGyro(port) {
        if (!port) {
            port = this.findFirst("angle");
        }
        if (port == -1) {
            return;
        }
        if (Ev3Label[this._sensorPorts[port]] !== "angle") {
            return;
        }
        if(Ev3UpdateStatus[port] == 0) return;
        if(this.angle(port) == 0) return
        this._dontUpdate = true;

        let oldMode = Ev3Mode[this._sensorPorts[port]][port];
        Ev3Mode[this._sensorPorts[port]][port] = 4;
        Ev3UpdateStatus[port] = 0;
       // this._updateDevices = false;
        function reset(that,port,resolve){
           
            const cmd = that.generateCommand(
                Ev3Command.DIRECT_COMMAND_NO_REPLY, [
                    Ev3Opcode.OPINPUT_READSI,
                    Ev3Opcode.LAYER,
                    port,
                    Ev3Value.DO_NOT_CHANGE_TYPE,
                    Ev3Mode[that._sensorPorts[port]][port],
                    225,
                    0
                ]
            );
            that.send(cmd);

            setTimeout(() =>{
                that._dontUpdate = false;
                Ev3Mode[that._sensorPorts[port]][port] = oldMode;
                setTimeout(() =>{
                    if(that.angle(port) == 0){
                    //  that._updateDevices = true;
                        Ev3Mode[that._sensorPorts[port]][port] = oldMode;
                        Ev3UpdateStatus[port] = 1;
                        resolve();
                    } else {
                        that._dontUpdate = true;
                        Ev3Mode[that._sensorPorts[port]][port] = 4;
                        reset(that,port,resolve)
                    }
                },1000);
            },1000)

        }
        var that = this;
        return new Promise(resolve => {
            setTimeout(() =>{
                reset(that,port,resolve);
            },2000);
          });
    }

    findFirst(val) {
        for (let i = 0; i < this._sensorPorts.length; i++) {
            if (val === Ev3Label[this._sensorPorts[i]])
                return i;
        }
        return -1;
    }

    /**
     * Access a particular motor on this peripheral.
     * @param {int} index - the zero-based index of the desired motor.
     * @return {EV3Motor} - the EV3Motor instance, if any, at that index.
     */
    motor(index) {
        return this._motors[index];
    }

    isButtonPressed(port) {
        return this._sensors.buttons[port] === 1;
    }

    beep(freq, time) {
        const cmd = this.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY, [
                Ev3Opcode.OPSOUND,
                Ev3Opcode.OPSOUND_CMD_TONE,
                Ev3Value.NUM8,
                2,
                Ev3Value.NUM16,
                freq,
                freq >> 8,
                Ev3Value.NUM16,
                time,
                time >> 8
            ]
        );

        this.send(cmd);
    }

    led(color, status) {

        // status 0 OFF, 1 ON, 2 Blinking
        //color 1 green, 2 red, 3 orange
        let cmd = 0;
        if (status) {
            cmd = ((status - 1) * 3) + color;
        }
        cmd = this.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY,
            [
                0x82,
                0x1B,
                Ev3Value.NUM8,
                cmd
            ]
        );

        this.send(cmd);

    }


    stopAll() {
        this.stopAllMotors();
        this.stopSound();
        this.led(0, 0);
    }

    stopSound() {
        const cmd = this.generateCommand(
            Ev3Command.DIRECT_COMMAND_NO_REPLY, [
                Ev3Opcode.OPSOUND,
                Ev3Opcode.OPSOUND_CMD_STOP
            ]
        );

        this.send(cmd);
    }

    stopAllMotors() {
        this._motors.forEach(motor => {
            if (motor) {
                motor.coast();
            }
        });
    }

    /**
     * Called by the runtime when user wants to scan for an EV3 peripheral.
     */
    scan() {
        if (this._bt) {
            this._bt.disconnect();
        }
        this._bt = new BT(this._runtime, this._extensionId, {
            majorDeviceClass: 8,
            minorDeviceClass: 1
        }, this._onConnect, this.disconnect, this._onMessage);
    }

    /**
     * Called by the runtime when user wants to connect to a certain EV3 peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect(id) {
        if (this._bt) {
            this._bt.connectPeripheral(id);
        }
    }

    /**
     * Called by the runtime when user wants to disconnect from the EV3 peripheral.
     */
    disconnect() {
        this._clearSensorsAndMotors();
        window.clearInterval(this._pollingIntervalID);
        this._pollingIntervalID = null;

        if (this._bt) {
            this._bt.disconnect();
        }
    }

    /**
     * Called by the runtime to detect whether the EV3 peripheral is connected.
     * @return {boolean} - the connected state.
     */
    isConnected() {
        let connected = false;
        if (this._bt) {
            connected = this._bt.isConnected();
        }
        return connected;
    }

    /**
     * Send a message to the peripheral BT socket.
     * @param {Uint8Array} message - the message to send.
     * @return {Promise} - a promise result of the send operation.
     */
    send(message) {
        // TODO: add rate limiting?
        if (!this.isConnected()) return Promise.resolve();

        return this._bt.sendMessage({
            message: Base64Util.uint8ArrayToBase64(message),
            encoding: 'base64'
        });
    }

    /**
     * Genrates direct commands that are sent to the EV3 as a single or compounded byte arrays.
     * See 'EV3 Communication Developer Kit', section 4, page 24 at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits.
     *
     * Direct commands are one of two types:
     * DIRECT_COMMAND_NO_REPLY = a direct command where no reply is expected
     * DIRECT_COMMAND_REPLY = a direct command where a reply is expected, and the
     * number and length of returned values needs to be specified.
     *
     * The direct command byte array sent takes the following format:
     * Byte 0 - 1: Command size, Little Endian. Command size not including these 2 bytes
     * Byte 2 - 3: Message counter, Little Endian. Forth running counter
     * Byte 4:     Command type. Either DIRECT_COMMAND_REPLY or DIRECT_COMMAND_NO_REPLY
     * Byte 5 - 6: Reservation (allocation) of global and local variables using a compressed format
     *             (globals reserved in byte 5 and the 2 lsb of byte 6, locals reserved in the upper
     *             6 bits of byte 6) – see documentation for more details.
     * Byte 7 - n: Byte codes as a single command or compound commands (I.e. more commands composed
     *             as a small program)
     *
     * @param {number} type - the direct command type.
     * @param {string} byteCommands - a compound array of EV3 Opcode + arguments.
     * @param {number} allocation - the allocation of global and local vars needed for replies.
     * @return {array} - generated complete command byte array, with header and compounded commands.
     */
    generateCommand(type, byteCommands, allocation = 0) {

        // Header (Bytes 0 - 6)
        let command = [];
        command[2] = 0; // Message counter unused for now
        command[3] = 0; // Message counter unused for now
        command[4] = type;
        command[5] = allocation & 0xFF;
        command[6] = allocation >> 8 && 0xFF;

        // Bytecodes (Bytes 7 - n)
        command = command.concat(byteCommands);

        // Calculate command length minus first two header bytes
        const len = command.length - 2;
        command[0] = len & 0xFF;
        command[1] = len >> 8 && 0xFF;

        return command;
    }

    /**
     * When the EV3 peripheral connects, start polling for sensor and motor values.
     * @private
     */
    _onConnect() {
        this._pollingIntervalID = window.setInterval(this._pollValues, this._pollingInterval);
    }

    /**
     * Poll the EV3 for sensor and motor input values, based on the list of
     * known connected sensors and motors. This is sent as many compound commands
     * in a direct command, with a reply expected.
     *
     * See 'EV3 Firmware Developer Kit', section 4.8, page 46, at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits
     * for a list of polling/input device commands and their arguments.
     *
     * @private
     */
    _pollValues() {
        if (!this.isConnected()) {
            window.clearInterval(this._pollingIntervalID);
            return;
        }

        const byteCommands = []; // a compound command
        let allocation = 0;

        let sensorCount = 0;

        if(this._dontUpdate){
            return;
        }

        // For the command to send, either request device list or request sensor data
        // based on the polling counter value.  (i.e., reset the list of devices every
        // 20 counts).

        if (this._pollingCounter % 20 === 0) {
            // GET DEVICE LIST
            byteCommands[0] = Ev3Opcode.OPINPUT_DEVICE_LIST;
            byteCommands[1] = Ev3Value.NUM8; // 1 byte to follow
            byteCommands[2] = 33; // 0x21 ARRAY // TODO: document
            byteCommands[3] = 96; // 0x60 CHANGED // TODO: document
            byteCommands[4] = 225; // 0xE1 size of global var - 1 byte to follow // TODO: document
            byteCommands[5] = 32; // 0x20 global var index "0" 0b00100000 // TODO: document

            // Command and payload lengths
            allocation = 33;

            this._updateDevices = true;

            // TODO: need to clar sensor data?

        } else {
            // GET SENSOR VALUES FOR CONNECTED SENSORS
            let index = 0;
            // eslint-disable-next-line no-undefined
            if (!this._sensorPorts.includes(undefined)) { // TODO: why is this needed?
                for (let i = 0; i < 4; i++) {
                    if (this._sensorPorts[i] !== 'none') {
                        byteCommands[index + 0] = Ev3Opcode.OPINPUT_READSI;
                        byteCommands[index + 1] = Ev3Value.LAYER;
                        byteCommands[index + 2] = i; // PORT
                        byteCommands[index + 3] = Ev3Value.DO_NOT_CHANGE_TYPE;
                        byteCommands[index + 4] = Ev3Mode[this._sensorPorts[i]][i];
                        byteCommands[index + 5] = 225; // 0xE1 one byte to follow // TODO: document
                        byteCommands[index + 6] = sensorCount * 4; // global index // TODO: document
                        index += 7;
                    }
                    sensorCount++;
                }
            }

            // GET MOTOR POSITION VALUES, EVEN IF NO MOTOR PRESENT
            // eslint-disable-next-line no-undefined
            if (!this._motorPorts.includes(undefined)) {
                for (let i = 0; i < 4; i++) {
                    byteCommands[index + 0] = Ev3Opcode.OPOUTPUT_GET_COUNT;
                    byteCommands[index + 1] = Ev3Value.LAYER;
                    byteCommands[index + 2] = i; // PORT TODO: explain incorrect documentation as 'Output bit field'
                    byteCommands[index + 3] = 225; // 0xE1 byte following TODO: document
                    byteCommands[index + 4] = sensorCount * 4; // global index TODO: document
                    index += 5;
                    sensorCount++;
                }
            }

            // Command and payload lengths
            allocation = sensorCount * 4;
        }

        const cmd = this.generateCommand(
            Ev3Command.DIRECT_COMMAND_REPLY,
            byteCommands,
            allocation
        );

        this.send(cmd);

        this._pollingCounter++;
    }

    /**
     * Message handler for incoming EV3 reply messages, either a list of connected
     * devices (sensors and motors) or the values of the connected sensors and motors.
     *
     * See 'EV3 Communication Developer Kit', section 4.1, page 24 at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits
     * for more details on direct reply formats.
     *
     * The direct reply byte array sent takes the following format:
     * Byte 0 – 1: Reply size, Little Endian. Reply size not including these 2 bytes
     * Byte 2 – 3: Message counter, Little Endian. Equals the Direct Command
     * Byte 4:     Reply type. Either DIRECT_REPLY or DIRECT_REPLY_ERROR
     * Byte 5 - n: Resonse buffer. I.e. the content of the by the Command reserved global variables.
     *             I.e. if the command reserved 64 bytes, these bytes will be placed in the reply
     *             packet as the bytes 5 to 68.
     *
     * See 'EV3 Firmware Developer Kit', section 4.8, page 56 at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits
     * for direct response buffer formats for various commands.
     *
     * @param {object} params - incoming message parameters
     * @private
     */
    _onMessage(params) {
        const message = params.message;
        const data = Base64Util.base64ToUint8Array(message);
        // log.info(`received array: ${array}`);

        // TODO: Is this the correct check?
        if (data[4] !== Ev3Command.DIRECT_REPLY) {
            return;
        }

        if (this._updateDevices) {
            // *****************
            // PARSE DEVICE LIST
            // *****************
            // TODO: put these in for loop?
            this._sensorPorts[0] = Ev3Device[data[5]] ? Ev3Device[data[5]] : 'none';
            this._sensorPorts[1] = Ev3Device[data[6]] ? Ev3Device[data[6]] : 'none';
            this._sensorPorts[2] = Ev3Device[data[7]] ? Ev3Device[data[7]] : 'none';
            this._sensorPorts[3] = Ev3Device[data[8]] ? Ev3Device[data[8]] : 'none';
            this._motorPorts[0] = Ev3Device[data[21]] ? Ev3Device[data[21]] : 'none';
            this._motorPorts[1] = Ev3Device[data[22]] ? Ev3Device[data[22]] : 'none';
            this._motorPorts[2] = Ev3Device[data[23]] ? Ev3Device[data[23]] : 'none';
            this._motorPorts[3] = Ev3Device[data[24]] ? Ev3Device[data[24]] : 'none';
            for (let m = 0; m < 4; m++) {
                const type = this._motorPorts[m];
                if (type !== 'none' && !this._motors[m]) {
                    // add new motor if don't already have one
                    this._motors[m] = new EV3Motor(this, m, type);
                }
                if (type === 'none' && this._motors[m]) {
                    // clear old motor
                    this._motors[m] = null;
                }
            }
            this._updateDevices = false;
            // eslint-disable-next-line no-undefined
        } else if (!this._sensorPorts.includes(undefined) && !this._motorPorts.includes(undefined)) {
            // *******************
            // PARSE SENSOR VALUES
            // *******************
            let offset = 5; // start reading sensor values at byte 5
            for (let i = 0; i < 4; i++) {
                // array 2 float
                const buffer = new Uint8Array([
                    data[offset],
                    data[offset + 1],
                    data[offset + 2],
                    data[offset + 3]
                ]).buffer;
                const view = new DataView(buffer);
                const value = view.getFloat32(0, true);

                if (Ev3Label[this._sensorPorts[i]] === 'button') {
                    // Read a button value per port
                    this._sensors.buttons[i] = value ? value : 0;
                } else if (Ev3Label[this._sensorPorts[i]]) { // if valid
                    // Read brightness / distance values and set to 0 if null
                    this._sensors[Ev3Label[this._sensorPorts[i]]][i] = value ? value : 0;
                }
                offset += 4;
            }
            // *****************************************************
            // PARSE MOTOR POSITION VALUES, EVEN IF NO MOTOR PRESENT
            // *****************************************************
            for (let i = 0; i < 4; i++) {
                const positionArray = [
                    data[offset],
                    data[offset + 1],
                    data[offset + 2],
                    data[offset + 3]
                ];
                if (this._motors[i]) {
                    this._motors[i].position = positionArray;
                }
                offset += 4;
            }
        }
    }

    /**
     * Clear all the senor port and motor names, and their values.
     * @private
     */
    _clearSensorsAndMotors() {
        this._sensorPorts = [];
        this._motorPorts = [];
        this._sensors = {
            distance: [0, 0, 0, 0],
            angle: [0, 0, 0, 0],
            brightness: [0, 0, 0, 0],
            buttons: [0, 0, 0, 0],
            color: [0, 0, 0, 0]
        };
        this._motors = [null, null, null, null];
    }

}

/**
 * Enum for motor port names.
 * Note: if changed, will break compatibility with previously saved projects.
 * @readonly
 * @enum {string}
 */
const Ev3MotorMenu = ['A', 'B', 'C', 'D'];

/**
 * Enum for sensor port names.
 * Note: if changed, will break compatibility with previously saved projects.
 * @readonly
 * @enum {string}
 */
const Ev3SensorMenu = ['1', '2', '3', '4'];

/**
 * Enum for sensor port names.
 * Note: if changed, will break compatibility with previously saved projects.
 * @readonly
 * @enum {string}
 */
const Ev3Directions = ['Forward', 'Backward'];

function getBlocks() {
    const EV3Blcoks = Scratch3EV3.prototype.getInfo().blocks;
    let RobotecBlocks = [{
            opcode: 'twoMotorRotate',
            text: formatMessage({
                id: 'robotec.twoMotorRotate',
                default: 'motor [PORTS] rotate [UNITS] [TYPE] speed left [SPEED1] right [SPEED2]',
                description: 'turn a motor clockwise for some time'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
                PORTS: {
                    type: ArgumentType.STRING,
                    menu: 'twoMotorsPorts',
                    defaultValue: '1+2'
                },
                UNITS: {
                    type: ArgumentType.NUMBER,
                    defaultValue: 1
                },
                TYPE: {
                    type: ArgumentType.STRING,
                    menu: 'rotateTypes',
                    defaultValue: 'seconds'
                },
                SPEED1: {
                    type: ArgumentType.NUMBER,
                    defaultValue: 100
                },
                SPEED2: {
                    type: ArgumentType.NUMBER,
                    defaultValue: 100
                }
            }
        },
        { 
            opcode: 'twoMotorSpeed',
            text: formatMessage({
                id: 'robotec.twoMotorSpeed',
                default: 'motor [PORT1] + [PORT2] speed [SPEED]',
                description: 'turn a motor clockwise for some time'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
                PORT1: {
                    type: ArgumentType.STRING,
                    menu: 'motorPorts',
                    defaultValue: 1
                },
                PORT2: {
                    type: ArgumentType.STRING,
                    menu: 'motorPorts',
                    defaultValue: 2
                },
                SPEED: {
                    type: ArgumentType.NUMBER,
                    defaultValue: 100
                }
            }
        },
        {
            opcode: 'motorStop',
            text: formatMessage({
                id: 'robotec.motorStop',
                default: 'Stop motor [PORT] [STOP]',
                description: 'turn a motor clockwise for some time'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
                PORT: {
                    type: ArgumentType.STRING,
                    menu: 'motorPorts',
                    defaultValue: 0
                },
                STOP: {
                    type: ArgumentType.STRING,
                    menu: 'stops',
                    defaultValue: 'break'
                }
            }
        },
        {
            opcode: 'twoMotorStop',
            text: formatMessage({
                id: 'robotec.twoMotorStop',
                default: 'Stop motor [PORT1] + [PORT2] [STOP]',
                description: 'turn a motor clockwise for some time'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
                PORT1: {
                    type: ArgumentType.STRING,
                    menu: 'motorPorts',
                    defaultValue: 1
                },
                PORT2: {
                    type: ArgumentType.STRING,
                    menu: 'motorPorts',
                    defaultValue: 2
                },
                STOP: {
                    type: ArgumentType.STRING,
                    menu: 'stops',
                    defaultValue: 'break'
                }
            }
        },
        {
            opcode: 'motorSetRotate',
            text: formatMessage({
                id: 'robotec.motorSetRotate',
                default: 'motor [PORT] rotate [UNITS] [TYPE] speed [SPEED]',
                description: 'turn a motor clockwise for some time'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
                PORT: {
                    type: ArgumentType.STRING,
                    menu: 'motorPorts',
                    defaultValue: 0
                },
                UNITS: {
                    type: ArgumentType.NUMBER,
                    defaultValue: 1
                },
                TYPE: {
                    type: ArgumentType.STRING,
                    menu: 'rotateTypes',
                    defaultValue: 'seconds'
                },
                SPEED: {
                    type: ArgumentType.NUMBER,
                    defaultValue: 100
                }
            }
        },
        {
            import: 'motorSetPower',
            text: formatMessage({
                id: 'robotec.motorSetPower',
                default: 'motor [PORT] set speed [POWER]',
                description: 'set a motor\'s power to some value'
            })
        },
        {
            opcode: 'led',
            text: formatMessage({
                id: 'robotec.led',
                default: 'turn LED [COLOR] status [STATUS]',
                description: 'turn a motor clockwise for some time'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
                COLOR: {
                    type: ArgumentType.STRING,
                    menu: 'colors',
                    defaultValue: 0
                },
                STATUS: {
                    type: ArgumentType.STRING,
                    menu: 'ledStatus',
                    defaultValue: 1
                }
            }
        },
        {
            import: 'buttonPressed',
            text: formatMessage({
                id: 'robotec.buttonPressed',
                default: 'touch sensor at port [PORT] pressed?',
                description: 'is a button on some port pressed?'
            })
        },
        {
            opcode: 'getUltrasonic',
            text: formatMessage({
                id: 'robotec.getUltrasonic',
                default: 'get ultrasonic distance at port [PORT]',
                description: 'gets measured distance'
            }),
            blockType: BlockType.REPORTER,
            arguments: {
                PORT: {
                    type: ArgumentType.STRING,
                    menu: 'sensorPorts',
                    defaultValue: 0
                }
            }
        },
        {
            opcode: 'getColorSensor',
            text: formatMessage({
                id: 'robotec.getColorSensor',
                default: 'get color sensor [MODE] at port [PORT]',
                description: 'gets measured distance'
            }),
            blockType: BlockType.REPORTER,
            arguments: {
                PORT: {
                    type: ArgumentType.STRING,
                    menu: 'sensorPorts',
                    defaultValue: 0
                },
                MODE: {
                    type: ArgumentType.STRING,
                    menu: 'colorMode',
                    defaultValue: "brightness"
                }
            }
        },
        {
            opcode: 'getGyro',
            text: formatMessage({
                id: 'robotec.getGyro',
                default: 'get gyro angle at port [PORT]',
                description: 'gets measured distance'
            }),
            blockType: BlockType.REPORTER,
            arguments: {
                PORT: {
                    type: ArgumentType.STRING,
                    menu: 'sensorPorts',
                    defaultValue: 0
                }
            }
        },
        {
            opcode: 'resetGyro',
            text: formatMessage({
                id: 'robotec.resetGyro',
                default: 'Reset Gyro At Port [PORT]',
                description: 'gets measured distance'
            }),
            arguments: {
                PORT: {
                    type: ArgumentType.STRING,
                    menu: 'sensorPorts',
                    defaultValue: 0
                }
            }
        },
        {
            import: 'getMotorPosition',
            text: formatMessage({
                id: 'robotec.getMotorPosition',
                default: 'motor [PORT] position',
                description: 'get the measured degrees a motor has turned'
            })
        },
        {
            opcode: 'motorResetPosition',
            text: formatMessage({
                id: 'robotec.motorResetPosition',
                default: 'motor [PORT] reset position',
                description: 'motor reset position'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
                PORT: {
                    type: ArgumentType.STRING,
                    menu: 'motorPorts',
                    defaultValue: 0
                }
            }
        },
        {
            import: 'beep',
            text: formatMessage({
                id: 'robotec.beepNote',
                default: 'beep note [NOTE] for [TIME] secs',
                description: 'play some note on EV3 for some time'
            }),
        },
    ];
    let blocksFormEv3 = [];
    for (let i = 0; i < RobotecBlocks.length; i++) {
        if (RobotecBlocks[i].import) {
            blocksFormEv3.push(RobotecBlocks[i].import);
            for (let j = 0; j < EV3Blcoks.length; j++) {
                let block = RobotecBlocks[i];
                if (EV3Blcoks[j].opcode === RobotecBlocks[i].import) {
                    RobotecBlocks[i] = EV3Blcoks[j];
                    for(let key in block){
                        RobotecBlocks[i][key] = block[key];
                    }
                    break;
                }
            }
        }
    }
    const blocks = RobotecBlocks;
    for (let i = 0; i < blocksFormEv3.length; i++) {
        let key = blocksFormEv3[i];
        if (!Scratch3RobotecBlocks.prototype[key]) {
            Scratch3RobotecBlocks.prototype[key] = Scratch3EV3.prototype[key];
        }
    }
    return blocks;
}

class Scratch3RobotecBlocks {

    /**
     * The ID of the extension.
     * @return {string} the id
     */
    static get EXTENSION_ID() {
        return 'robotec';
    }

    /**
     * Creates a new instance of the EV3 extension.
     * @param  {object} runtime VM runtime
     * @constructor
     */
    constructor(runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new EV3 peripheral instance
        this._peripheral = new EV3(this.runtime, Scratch3RobotecBlocks.EXTENSION_ID);

        this._playNoteForPicker = this._playNoteForPicker.bind(this);
        this.runtime.on('PLAY_NOTE', this._playNoteForPicker);
    }

    /**
     * Define the EV3 extension.
     * @return {object} Extension description.
     */

    getInfo() {        
        return {
            id: Scratch3RobotecBlocks.EXTENSION_ID,
            name: 'Robotec EV3',
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: getBlocks(),
            menus: {
                motorPorts: this._formatMenu(Ev3MotorMenu),
                twoMotorsPorts: [
                    {"text" : "A + B" , "value":'0+1'},
                    {"text" : "A + D" , "value":'0+3'},
                    {"text" : "B + C" , "value":'1+2'},
                    {"text" : "C + D" , "value":'2+3'}
                ],
                sensorPorts: this._formatMenu(Ev3SensorMenu),
                directions: this._formatMenu(Ev3Directions),
                stops: [
                    {"text" : formatMessage({
                        id: 'robotec.stops.break',
                        default: 'Break'
                    }) , "value":'break'},
                    {"text" : formatMessage({
                        id: 'robotec.stops.float',
                        default: 'Float'
                    }) , "value":'float'}
                ],
                /*rotates: [
                    {"text" : formatMessage({
                        id: 'robotec.rotate.rotate',
                        default: 'Rotate'
                    }) , "value":'rotate'},
                    {"text" : formatMessage({
                        id: 'robotec.rotate.rotateTo',
                        default: 'RotateTo'
                    }) , "value":'rotateTo'}
                ],*/
                colors: [
                    {"text" : formatMessage({
                        id: 'robotec.color.green',
                        default: 'Green'
                    }) , "value":'0'},
                    {"text" : formatMessage({
                        id: 'robotec.color.red',
                        default: 'Red'
                    }) , "value":'1'},
                    {"text" : formatMessage({
                        id: 'robotec.color.orange',
                        default: 'Orange'
                    }) , "value":'2'}
                ],
                ledStatus: [
                    {"text" : formatMessage({
                        id: 'robotec.ledstatus.off',
                        default: 'Off'
                    }) , "value":'0'},
                    {"text" : formatMessage({
                        id: 'robotec.ledstatus.on',
                        default: 'On'
                    }) , "value":'1'},
                    {"text" : formatMessage({
                        id: 'robotec.ledstatus.blinking',
                        default: 'Blinking'
                    }) , "value":'2'},
                    {"text" : formatMessage({
                        id: 'robotec.ledstatus.pulse',
                        default: 'Pulse'
                    }) , "value":'3'}
                ],
                colorMode:  [ 
                    {"text" : formatMessage({
                        id: 'robotec.colormodes.brightness',
                        default: 'Brightness'
                    }) , "value":'brightness'},
                    {"text" : formatMessage({
                        id: 'robotec.colormodes.color',
                        default: 'Color'
                    }) , "value":'color'}
                ],
                rotateTypes: [ 
                    {"text" : formatMessage({
                        id: 'robotec.rotateunit.seconds',
                        default: 'Seconds'
                    }) , "value":'seconds'},
                    {"text" : formatMessage({
                        id: 'robotec.rotateunit.degrees',
                        default: 'Degrees'
                    }) , "value":'degrees'},
                    {"text" : formatMessage({
                        id: 'robotec.rotateunit.motorCounts',
                        default: 'Motor Counts'
                    }) , "value":'motor counts'}
                ]
            }
        };
    }

    motorTurnClockwise2motors(args) {
        const port1 = Cast.toNumber(args.PORT1);
        const port2 = Cast.toNumber(args.PORT2);
        let time = Cast.toNumber(args.TIME) * 1000;
        let speed = MathUtil.clamp(Cast.toNumber(args.SPEED), 0, 100);
        time = MathUtil.clamp(time, 0, 15000);

        return new Promise(resolve => {
            this._forEachMotor(port1, motorIndex => {
                const motor = this._peripheral.motor(motorIndex);
                if (motor) {
                    motor.power = speed;
                    motor.direction = 1;
                    motor.turnOnFor(time);
                }
            });
            this._forEachMotor(port2, motorIndex => {
                const motor = this._peripheral.motor(motorIndex);
                if (motor) {
                    motor.power = speed;
                    motor.direction = 1;
                    motor.turnOnFor(time);
                }
            });

            // Run for some time even when no motor is connected
            setTimeout(resolve, time);
        });
    }
    motorSetPower(args) {
        const port = Cast.toNumber(args.PORT);
        let speed = MathUtil.clamp(Cast.toNumber(args.POWER), -100, 100);
        const direction = speed >= 0 ? 1 : -1;
        speed = Math.abs(speed);
        this._forEachMotor(port, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                motor.power = speed;
                motor.direction = direction;
                motor.turnOn();
            }
        });
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

    motorStop(args) {
        const port = Cast.toNumber(args.PORT);
        const stop = args.STOP;
        this._forEachMotor(port, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                if (stop === "break") {
                    motor.break();
                } else {
                    motor.coast();
                }
            }
        });
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
    twoMotorStop(args) {
        const port1 = Cast.toNumber(args.PORT1);
        const port2 = Cast.toNumber(args.PORT2);
        const stop = args.STOP;
        this._forEachMotor(port1, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                if (stop === "break") {
                    motor.break();
                } else {
                    motor.coast();
                }
            }
        });
        this._forEachMotor(port2, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                if (stop === "break") {
                    motor.break();
                } else {
                    motor.coast();
                }
            }
        });
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
    motorRotate(args) {
        const port = Cast.toNumber(args.PORT);
        let speed = MathUtil.clamp(Cast.toNumber(args.SPEED), 0, 100);
        let degrees = Cast.toNumber(args.DEGREES);
        const rotate = args.ROTATE;
        this._forEachMotor(port, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                motor.power = speed;
                if (rotate === "rotate") {
                    return motor.rotate(degrees);
                } else {
                    return motor.rotate(degrees - motor.position);
                }
            }
        });
    }

    twoMotorSpeed(args) {
        const port1 = Cast.toNumber(args.PORT1);
        const port2 = Cast.toNumber(args.PORT2);
        let speed = MathUtil.clamp(Cast.toNumber(args.SPEED), -100, 100);
        const direction = speed >= 0 ? 1 : -1;
        speed = Math.abs(speed);
        this._forEachMotor(port1, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                motor.power = speed;
                motor.direction = direction;
                motor.turnOn();
            }
        });
        this._forEachMotor(port2, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                motor.power = speed;
                motor.direction = direction;
                motor.turnOn();
            }
        });
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

    motorSetRotate(args) {
        const port = Cast.toNumber(args.PORT);
        const speed = MathUtil.clamp(Cast.toNumber(args.SPEED), -100, 100);
        let units = Cast.toNumber(args.UNITS);
        const type = args.TYPE;
        let promise = null;
        switch (type) {
            case "seconds":
                let time = units > 0 ? units * 1000 : 0;
                promise = new Promise(resolve => {
                    this._forEachMotor(port, motorIndex => {
                        const motor = this._peripheral.motor(motorIndex);
                        if (motor) {
                            motor.power = Math.abs(speed);
                            motor.direction = speed > 0 ? 1 : -1;
                            motor.turnOnFor(time);
                        }
                    });
                    // Run for some time even when no motor is connected
                    setTimeout(resolve, time);
                });
                break;
            case "motor counts":
                units = units * 360;
            case "degrees":
                const degrees = units;
                this._forEachMotor(port, motorIndex => {
                    const motor = this._peripheral.motor(motorIndex);
                    if (motor) {
                        let dir = speed < 0 ? -1 : 1;
                        motor.power = Math.abs(speed);
                        promise = motor.rotate(degrees * dir);
                    }
                });
                break;
        }
        return promise;
    }

    twoMotorRotate(args) {
        const ports = args.PORTS.split('+');
        const port1 = Cast.toNumber(ports[0]);
        const port2 = Cast.toNumber(ports[1]);
        const speed1 = MathUtil.clamp(Cast.toNumber(args.SPEED1), -100, 100);
        const speed2 = MathUtil.clamp(Cast.toNumber(args.SPEED2), -100, 100);
        let units = Cast.toNumber(args.UNITS);
        const type = args.TYPE;
        switch (type) {
            case "seconds":
                let time = units > 0 ? units * 1000 : 0;
                return new Promise(resolve => {
                    this._forEachMotor(port1, motorIndex1 => {
                        this._forEachMotor(port2, motorIndex2 => {
                            const motor1 = this._peripheral.motor(motorIndex1);
                            if (motor1) {
                                motor1.power = Math.abs(speed1);
                                motor1.direction = speed1 > 0 ? 1 : -1;
                                motor1.turnOnFor(time);
                            }
                            const motor2 = this._peripheral.motor(motorIndex2);
                            if (motor2) {
                                motor2.power = Math.abs(speed2);
                                motor2.direction = speed2 > 0 ? 1 : -1;
                                motor2.turnOnFor(time);
                            }
                        });
                        
                    });
                    // Run for some time even when no motor is connected
                    setTimeout(resolve, time);
                });
                break;
            case "degrees":
                return this.twoMotorRotateHelper(port1, port2, speed1, speed2, units);
                break;
            case "motor counts":
                return this.twoMotorRotateHelper(port1, port2, speed1, speed2, units * 360);
                break;

        }
    }
    /*twoMotorRotateCount(args) {
  const port1 = Cast.toNumber(args.PORT1);
  const port2 = Cast.toNumber(args.PORT2);
  let speed1 = MathUtil.clamp(Cast.toNumber(args.SPEED1), -100, 100);
  let speed2 = MathUtil.clamp(Cast.toNumber(args.SPEED2), -100, 100);
  let count = Cast.toNumber(args.COUNT);
  this.twoMotorRotateHelper(port1, port2, speed1, speed2, count * 360)
}*/

    twoMotorRotateHelper(port1, port2, speed1, speed2, degrees) {
        let power1 = Math.abs(speed1);
        let power2 = Math.abs(speed2);
        let maxPower = Math.max(Math.max(power1, power2), 1);
        let promise = [];
        const motor1 = this._peripheral.motor(port1);
        const motor2 = this._peripheral.motor(port2);
        if (motor1) {
            let dir = speed1 < 0 ? -1 : 1;
            motor1.power = power1;
            let p = motor1.rotate((degrees * (power1 / maxPower)) * dir);
            if(p){
                promise.push(p);
            }
        }
        if (motor2) {
            let dir = speed2 < 0 ? -1 : 1;
            motor2.power = power2;
            let p = motor2.rotate((degrees * (power2 / maxPower)) * dir);
            if(p){
                promise.push(p);
            }
        }
        return  Promise.all(promise);
    }

    led(args) {
        const color = Cast.toNumber(args.COLOR);
        const status = Cast.toNumber(args.STATUS);
        this._peripheral.led(color + 1, status);
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
    getDistance() {
        return this._peripheral.distance();
    }
    getUltrasonic(args) {
        const port = Cast.toNumber(args.PORT);
        return this._peripheral.distance(port);
    }
    getBrightness() {
        return this._peripheral.brightness();
    }

    getColor() {
        return this._peripheral.color();
    }

    getColorSensor(args) {
        const port = Cast.toNumber(args.PORT);
        const mode = args.MODE;
        return this._peripheral[mode](port);
    }

    getAngle() {
        return this._peripheral.angle();;
    }

    getGyro(args) {
        const port = Cast.toNumber(args.PORT);
        return this._peripheral.angle(port);
    }

    resetGyro(args) {
        const port = Cast.toNumber(args.PORT);
        return this._peripheral.resetGyro(port);
    }

    motorResetPosition(args){
        const port = Cast.toNumber(args.PORT);
        this._forEachMotor(port, motorIndex => {
            const motor = this._peripheral.motor(motorIndex);
            if (motor) {
                motor.resetPosition();
            }
        });
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
}



Scratch3RobotecBlocks.prototype._forEachMotor = Scratch3EV3.prototype._forEachMotor;
Scratch3RobotecBlocks.prototype._formatMenu = Scratch3EV3.prototype._formatMenu;
Scratch3RobotecBlocks.prototype._playNoteForPicker = Scratch3EV3.prototype._playNoteForPicker;
/*
Scratch3RobotecBlocks.prototype.beep = Scratch3EV3.prototype.beep;
//Scratch3RobotecBlocks.prototype.getBrightness = Scratch3EV3.prototype.getBrightness;
//Scratch3RobotecBlocks.prototype.getDistance = Scratch3EV3.prototype.getDistance;
Scratch3RobotecBlocks.prototype.buttonPressed = Scratch3EV3.prototype.buttonPressed;
Scratch3RobotecBlocks.prototype.whenBrightnessLessThan = Scratch3EV3.prototype.whenBrightnessLessThan;
Scratch3RobotecBlocks.prototype.whenDistanceLessThan = Scratch3EV3.prototype.whenDistanceLessThan;
Scratch3RobotecBlocks.prototype.whenButtonPressed = Scratch3EV3.prototype.whenButtonPressed;
//Scratch3RobotecBlocks.prototype.motorSetPower = Scratch3EV3.prototype.motorSetPower;
Scratch3RobotecBlocks.prototype.motorTurnCounterClockwise = Scratch3EV3.prototype.motorTurnCounterClockwise;
Scratch3RobotecBlocks.prototype.motorTurnClockwise = Scratch3EV3.prototype.motorTurnClockwise;
Scratch3RobotecBlocks.prototype.getMotorPosition = Scratch3EV3.prototype.getMotorPosition;
*/

//debugger;
//EV3Motor.prototype.
for (let key in Scratch3EV3.prototype) {
    if (!Scratch3RobotecBlocks.prototype[key]) {
        Scratch3RobotecBlocks.prototype[key] = Scratch3EV3.prototype[key];
    }
}


module.exports = Scratch3RobotecBlocks;

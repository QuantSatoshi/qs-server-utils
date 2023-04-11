"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printColor = exports.ConsoleColors = void 0;
var ConsoleColors;
(function (ConsoleColors) {
    ConsoleColors["Reset"] = "\u001B[0m";
    ConsoleColors["Bright"] = "\u001B[1m";
    ConsoleColors["Dim"] = "\u001B[2m";
    ConsoleColors["Underscore"] = "\u001B[4m";
    ConsoleColors["Blink"] = "\u001B[5m";
    ConsoleColors["Reverse"] = "\u001B[7m";
    ConsoleColors["Hidden"] = "\u001B[8m";
    ConsoleColors["FgBlack"] = "\u001B[30m";
    ConsoleColors["FgRed"] = "\u001B[31m";
    ConsoleColors["FgGreen"] = "\u001B[32m";
    ConsoleColors["FgYellow"] = "\u001B[33m";
    ConsoleColors["FgBlue"] = "\u001B[34m";
    ConsoleColors["FgMagenta"] = "\u001B[35m";
    ConsoleColors["FgCyan"] = "\u001B[36m";
    ConsoleColors["FgWhite"] = "\u001B[37m";
    ConsoleColors["FgGray"] = "\u001B[90m";
    ConsoleColors["BgBlack"] = "\u001B[40m";
    ConsoleColors["BgRed"] = "\u001B[41m";
    ConsoleColors["BgGreen"] = "\u001B[42m";
    ConsoleColors["BgYellow"] = "\u001B[43m";
    ConsoleColors["BgBlue"] = "\u001B[44m";
    ConsoleColors["BgMagenta"] = "\u001B[45m";
    ConsoleColors["BgCyan"] = "\u001B[46m";
    ConsoleColors["BgWhite"] = "\u001B[47m";
    ConsoleColors["BgGray"] = "\u001B[100m";
})(ConsoleColors = exports.ConsoleColors || (exports.ConsoleColors = {}));
function printColor(color, text) {
    return `${color}text${ConsoleColors.Reset}`;
}
exports.printColor = printColor;

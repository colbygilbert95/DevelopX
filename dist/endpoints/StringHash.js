"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function StringHash(str) {
    var MOD = 18446744073709551615;
    var h = 0;
    for (var i = 0; i < str.length; i++) {
        h = ((7 * h) + str.charCodeAt(i));
    }
    if (h < 0) {
        h *= -1;
    }
    return (h % MOD);
}
exports.StringHash = StringHash;

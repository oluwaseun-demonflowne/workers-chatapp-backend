"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodMiddleware = void 0;
const zod_1 = require("zod");
function zodMiddleware(err, req, res) {
    var _a;
    if (err instanceof zod_1.z.ZodError) {
        res.status(400).json({ error: err.flatten() });
        return;
    }
    else if (err instanceof Error) {
        const error = err;
        res.status((_a = error.statusCode) !== null && _a !== void 0 ? _a : 400).json({ message: err.message });
        return;
    }
    res.status(500).json({ message: "Internal server error" });
}
exports.zodMiddleware = zodMiddleware;

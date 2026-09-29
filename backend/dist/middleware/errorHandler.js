"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    console.error('❌ Server Error:', err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
}

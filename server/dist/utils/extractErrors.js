"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractErrors = void 0;
const extractErrors = (errors) => {
    const fieldErrors = [];
    errors.forEach(({ property, constraints }) => {
        fieldErrors.push({
            field: property,
            message: Object.values(constraints)[0],
        });
    });
    return fieldErrors;
};
exports.extractErrors = extractErrors;
//# sourceMappingURL=extractErrors.js.map
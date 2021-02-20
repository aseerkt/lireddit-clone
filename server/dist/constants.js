"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORGOT_PASSWORD_PREFIX = exports.COOKIE_NAME = exports.__prod__ = exports.PORT = void 0;
exports.PORT = process.env.PORT || 5000;
exports.__prod__ = process.env.NODE_ENV === 'production';
exports.COOKIE_NAME = 'qid';
exports.FORGOT_PASSWORD_PREFIX = 'forgot-password:';
//# sourceMappingURL=constants.js.map
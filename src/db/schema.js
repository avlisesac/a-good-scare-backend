"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersTable = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var defaultTableProperties = {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom().notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)().defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)()
};
exports.usersTable = (0, pg_core_1.pgTable)("users", __assign(__assign({}, defaultTableProperties), { email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(), password: (0, pg_core_1.text)().notNull() }));

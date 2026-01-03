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
exports.moviesToUsers = exports.ratingEnum = exports.movies = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var datetimeTableProperties = {
    createdAt: (0, pg_core_1.timestamp)().defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)(),
};
var defaultTableProperties = __assign({ id: (0, pg_core_1.uuid)().primaryKey().defaultRandom().notNull().unique() }, datetimeTableProperties);
exports.users = (0, pg_core_1.pgTable)("users", __assign(__assign({}, defaultTableProperties), { email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(), password: (0, pg_core_1.text)().notNull() }));
exports.movies = (0, pg_core_1.pgTable)("movies", __assign(__assign({}, defaultTableProperties), { id: (0, pg_core_1.integer)().notNull().unique(), averageRating: (0, pg_core_1.integer)(), totalRatings: (0, pg_core_1.integer)(), totalReviews: (0, pg_core_1.integer)() }));
exports.ratingEnum = (0, pg_core_1.pgEnum)("rating", ["pos", "neg"]);
exports.moviesToUsers = (0, pg_core_1.pgTable)("movies_to_users", __assign(__assign({}, datetimeTableProperties), { movieId: (0, pg_core_1.integer)("movie_id").references(function () { return exports.movies.id; }), userId: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }), wantToWatch: (0, pg_core_1.boolean)(), seen: (0, pg_core_1.boolean)(), rating: (0, exports.ratingEnum)(), review: (0, pg_core_1.text)(), reviewContainsSpoiler: (0, pg_core_1.boolean)(), flaggedAsNotHorror: (0, pg_core_1.boolean)() }), function (table) { return [(0, pg_core_1.primaryKey)({ columns: [table.movieId, table.userId] })]; });

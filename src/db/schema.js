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
exports.seenMovies = exports.flaggedAsNotHorror = exports.wantToWatch = exports.reviews = exports.ratings = exports.ratingEnum = exports.movies = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var datetimeTableProperties = {
    createdAt: (0, pg_core_1.timestamp)().defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)().defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)(),
};
var defaultTableProperties = __assign({ id: (0, pg_core_1.uuid)().primaryKey().defaultRandom().notNull() }, datetimeTableProperties);
exports.users = (0, pg_core_1.pgTable)("users", __assign(__assign({}, defaultTableProperties), { email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(), username: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(), password: (0, pg_core_1.text)().notNull() }));
exports.movies = (0, pg_core_1.pgTable)("movies", __assign(__assign({}, defaultTableProperties), { id: (0, pg_core_1.integer)().notNull().unique(), averageRating: (0, pg_core_1.integer)(), totalRatings: (0, pg_core_1.integer)(), totalReviews: (0, pg_core_1.integer)() }));
exports.ratingEnum = (0, pg_core_1.pgEnum)("rating", ["pos", "neg"]);
exports.ratings = (0, pg_core_1.pgTable)("ratings", __assign(__assign({}, defaultTableProperties), { movieId: (0, pg_core_1.integer)("movie_id").references(function () { return exports.movies.id; }), userId: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }), rating: (0, exports.ratingEnum)() }), function (table) { return [
    (0, pg_core_1.index)("rating_movie_idx").on(table.movieId),
    (0, pg_core_1.index)("rating_user_idx").on(table.userId),
    (0, pg_core_1.uniqueIndex)("rating_movie_user_idx").on(table.movieId, table.userId),
]; });
exports.reviews = (0, pg_core_1.pgTable)("reviews", __assign(__assign({}, defaultTableProperties), { movieId: (0, pg_core_1.integer)("movie_id").references(function () { return exports.movies.id; }), userId: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }), review: (0, pg_core_1.text)(), reviewContainsSpoiler: (0, pg_core_1.boolean)() }), function (table) { return [
    (0, pg_core_1.index)("review_movie_idx").on(table.movieId),
    (0, pg_core_1.index)("review_user_idx").on(table.userId),
    (0, pg_core_1.uniqueIndex)("review_movie_user_idx").on(table.movieId, table.userId),
]; });
exports.wantToWatch = (0, pg_core_1.pgTable)("want_to_watch", __assign(__assign({}, defaultTableProperties), { movieId: (0, pg_core_1.integer)("movie_id").references(function () { return exports.movies.id; }), userId: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }), toWatch: (0, pg_core_1.boolean)() }), function (table) { return [
    (0, pg_core_1.index)("wtw_movie_idx").on(table.movieId),
    (0, pg_core_1.index)("wtw_user_idx").on(table.userId),
    (0, pg_core_1.uniqueIndex)("wtw_movie_user_idx").on(table.movieId, table.userId),
]; });
exports.flaggedAsNotHorror = (0, pg_core_1.pgTable)("flagged_as_not_horror", __assign(__assign({}, defaultTableProperties), { movieId: (0, pg_core_1.integer)("movie_id").references(function () { return exports.movies.id; }), userId: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }) }), function (table) { return [
    (0, pg_core_1.index)("nhflag_movie_idx").on(table.movieId),
    (0, pg_core_1.index)("nhflag_user_idx").on(table.userId),
    (0, pg_core_1.uniqueIndex)("nhflag_movie_user_idx").on(table.movieId, table.userId),
]; });
exports.seenMovies = (0, pg_core_1.pgTable)("seen_movies", __assign(__assign({}, defaultTableProperties), { movieId: (0, pg_core_1.integer)("movie_id").references(function () { return exports.movies.id; }), userId: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }) }), function (table) { return [
    (0, pg_core_1.index)("seen_movie_idx").on(table.movieId),
    (0, pg_core_1.index)("seen_user_idx").on(table.userId),
    (0, pg_core_1.uniqueIndex)("seen_movie_user_idx").on(table.movieId, table.userId),
]; });

const authModule = require("./auth");

var express = require("express");
var db = require("../db");
var router = express.Router();
var { wantToWatch } = require("../src/db/schema");
const { eq, and, isNotNull } = require("drizzle-orm");
const { movies } = require("../src/db/schema");

router.post("/:movieId/:action", authModule.auth, async (req, res, next) => {
  try {
    // Get user id from jwt in request (added in auth module)
    const user = req.user;
    const { id: userId } = user;
    if (!userId) {
      throw new Error("no user id available to proceed.");
    }
    console.log("this user wants to update a movie in their watchlist:", user);

    // Get movieId from req.
    const { movieId, action } = req.params;
    if (!movieId) {
      throw new Error(
        "no movie id provided. movie id is required for watchlist update."
      );
    }
    if (!action) {
      throw new Error(
        "no watchlist action provided. an action is required for watchlist update."
      );
    }
    console.log(
      `the movie they want to add or remove has an id of: ${movieId}`
    );

    // We need to make sure that the movie exists in the AGS database.
    // Dev Note: Depeneding on how fast we can retrieve the data needed for things like:
    // - highest rated
    // - most rated
    // - etc.
    // It may be possible to delete the AGS "movies" db and rely entirely on TMDB's db.
    const upsertedMovie = await db
      .insert(movies)
      .values({
        id: movieId,
      })
      .onConflictDoNothing()
      .returning();
    console.log(`that movie's details are:`, upsertedMovie);

    const toWatch = action === "add" ? true : false;

    const upsertedWatchlistEntry = await db
      .insert(wantToWatch)
      .values({
        userId,
        movieId: Number(movieId),
        toWatch: toWatch,
      })
      .onConflictDoUpdate({
        target: [wantToWatch.movieId, wantToWatch.userId],
        set: {
          toWatch: toWatch,
          updatedAt: new Date(),
        },
      })
      .returning();

    const singleItem = upsertedWatchlistEntry?.[0];

    console.log("the new or updated watchlist entry is:", singleItem);

    res.json(singleItem);
  } catch (err) {
    next(err);
  }
});

router.get("/:movieId", authModule.auth, async (req, res, next) => {
  try {
    // Get user id from jwt in request (added in auth module)
    const user = req.user;
    const { id: userId } = user;
    if (!userId) {
      throw new Error("no user id available to proceed.");
    }
    console.log(
      "this user wants to remove a movie from their watchlist:",
      user
    );

    // Get movieId from req.
    const { movieId } = req.params;
    if (!movieId) {
      throw new Error("no movie id provided. movie id is required for rating.");
    }
    console.log(`the movie they want to add has an id of: ${movieId}`);

    const existingWatchlistEntry = await db
      .select()
      .from(wantToWatch)
      .where(
        and(eq(wantToWatch.userId, userId), eq(wantToWatch.movieId, movieId))
      );
    const singleItem = existingWatchlistEntry?.[0];

    if (singleItem) {
      res.json(singleItem);
    } else {
      res.json(null);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;

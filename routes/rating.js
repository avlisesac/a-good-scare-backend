const auth = require("./auth");

var express = require("express");
var db = require("../db");
var router = express.Router();
var { moviesToUsers } = require("../src/db/schema");
const { eq, and } = require("drizzle-orm");
const { movies } = require("../src/db/schema");

router.get("/:movieId/:userId", async (req, res, next) => {
  try {
    const { movieId, userId } = req.params;
    if (!userId) {
      throw new Error("no user id available to proceed.");
    }
    if (!movieId) {
      throw new Error("no movie id provided.");
    }

    const existingMovieToUser = await db
      .select()
      .from(moviesToUsers)
      .where(
        and(
          eq(moviesToUsers.movieId, movieId),
          eq(moviesToUsers.userId, userId)
        )
      );
    console.log("existingMovieToUser:", existingMovieToUser);
    const singleItem = existingMovieToUser?.[0];
    res.json(singleItem);
  } catch (err) {
    next(err);
  }
});

router.post("/:movieId", auth, async (req, res, next) => {
  try {
    // Get user id from jwt in request
    const user = req.user;
    const { id: userId } = user;
    if (!userId) {
      throw new Error("no user id available to proceed.");
    }
    console.log("this user wants to rate a movie:", user);

    // Get movieId and rating from req.
    const { movieId } = req.params;
    const { rating } = req.body;
    if (!movieId) {
      throw new Error("no movie id provided. movie id is required for rating.");
    }
    console.log(
      `they want to give the movie with id of: ${movieId} a rating of: ${rating}`
    );

    const upsertedMovie = await db
      .insert(movies)
      .values({
        id: movieId,
      })
      .onConflictDoNothing()
      .returning();
    console.log(`that movie's details are:`, upsertedMovie);

    const newRating = rating ?? null;

    const upsertedEntry = await db
      .insert(moviesToUsers)
      .values({
        userId,
        movieId: Number(movieId),
        rating: newRating,
      })
      .onConflictDoUpdate({
        target: [moviesToUsers.movieId, moviesToUsers.userId],
        set: {
          rating: newRating,
          updatedAt: new Date(),
        },
      })
      .returning();

    const singleItem = upsertedEntry?.[0];

    console.log("the new or updated entry is:", singleItem);

    res.json(singleItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

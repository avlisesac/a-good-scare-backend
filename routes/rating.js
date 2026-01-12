const authModule = require("./auth");

var express = require("express");
var db = require("../db");
var router = express.Router();
var { ratings } = require("../src/db/schema");
const { eq, and, isNotNull } = require("drizzle-orm");
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

    const existingRating = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.movieId, movieId), eq(ratings.userId, userId)));
    console.log("existingRating:", existingRating);
    const singleItem = existingRating?.[0];
    res.json(singleItem);
  } catch (err) {
    next(err);
  }
});

router.get("/:movieId", async (req, res, next) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      throw new Error("no movie id provided.");
    }
    const allRatings = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.movieId, movieId), isNotNull(ratings.rating)));
    if (!allRatings || allRatings.length < 1) {
      res.json({
        average: `(No reviews yet)`,
        icon: "unknown",
      });
    }
    const ratingsCount = allRatings.length;
    const countMessage = `(${ratingsCount} total reviews)`;
    const posRatings = allRatings.filter((rating) => rating.rating === "pos");
    console.log("posRatings:", posRatings);
    const negRatings = allRatings.filter((rating) => rating.rating === "neg");
    if (posRatings === 0) {
      res.json({
        average: `0% ${countMessage}`,
        icon: "skip",
      });
    }
    const averageRating = Math.round((posRatings.length / ratingsCount) * 100);
    res.json({
      average: `${averageRating}% ${countMessage}`,
      icon: averageRating < 49 ? "skip" : "watch",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:movieId", authModule.auth, async (req, res, next) => {
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
      .insert(ratings)
      .values({
        userId,
        movieId: Number(movieId),
        rating: newRating,
      })
      .onConflictDoUpdate({
        target: [ratings.movieId, ratings.userId],
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

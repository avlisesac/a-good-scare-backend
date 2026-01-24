const authModule = require("./auth");

var express = require("express");
var db = require("../db");
var router = express.Router();
var { ratings, reviews, users } = require("../src/db/schema");
const { eq, and, isNull, desc, isNotNull } = require("drizzle-orm");
const { movies } = require("../src/db/schema");

router.get("/:movieId", async (req, res, next) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      throw new Error("no movie id provided.");
    }

    const allReviewsWithUser = await db
      .select()
      .from(reviews)
      .innerJoin(
        ratings,
        and(
          eq(ratings.userId, reviews.userId),
          eq(ratings.movieId, reviews.movieId)
        )
      )
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.movieId, movieId),
          isNull(reviews.deletedAt),
          isNotNull(ratings.rating)
        )
      )
      .orderBy(desc(reviews.createdAt));

    console.log("allReviewsWithUser:", allReviewsWithUser);

    const constructedResponse = allReviewsWithUser?.map((resultItem) => {
      const review = resultItem.reviews;
      const user = resultItem.users;
      return {
        id: review.id,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        deletedAt: review.deletedAt,
        reviewText: review.review,
        reviewContainsSpoiler: review.reviewContainsSpoiler,
        userId: user.id,
        username: user.username,
      };
    });

    console.log("constructedResponse:", constructedResponse);

    res.json(constructedResponse);
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
    console.log("this user wants to review a movie:", user);

    // Get movieId and rating from req.
    const { movieId } = req.params;
    const { review } = req.body;
    const trimmedReview = review?.trim();
    if (!movieId) {
      throw new Error("no movie id provided. movie id is required for rating.");
    }
    if (!trimmedReview) {
      throw new Error("review is empty or nonexistent.");
    }
    console.log(
      `they want to give the movie with id of: ${movieId} a review with content of: ${trimmedReview}`
    );

    const upsertedMovie = await db
      .insert(movies)
      .values({
        id: movieId,
      })
      .onConflictDoNothing()
      .returning();
    console.log(`that movie's details are:`, upsertedMovie);

    const newReview = trimmedReview;

    const upsertedEntry = await db
      .insert(reviews)
      .values({
        userId,
        movieId: Number(movieId),
        review: newReview,
      })
      .onConflictDoUpdate({
        target: [ratings.movieId, ratings.userId],
        set: {
          review: trimmedReview,
          updatedAt: new Date(),
          deletedAt: null,
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

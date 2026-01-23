const authModule = require("./auth");

var express = require("express");
var db = require("../db");
var router = express.Router();
var { ratings, reviews, users } = require("../src/db/schema");
const { eq, and, isNull, desc } = require("drizzle-orm");
const { movies } = require("../src/db/schema");

// router.get("/:movieId/:userId", async (req, res, next) => {
//   try {
//     const { movieId, userId } = req.params;
//     if (!userId) {
//       throw new Error("no user id available to proceed.");
//     }
//     if (!movieId) {
//       throw new Error("no movie id provided.");
//     }

//     const existingReview = await db
//       .select()
//       .from(reviews)
//       .where(
//         and(eq(reviews.movieId, movieId), eq(reviews.userId, userId)),
//         isNull(reviews.deletedAt)
//       )
//       .limit(1);
//     console.log("existingReview:", existingReview);
//     const singleItem = existingReview?.[0];
//     res.json(singleItem);
//   } catch (err) {
//     next(err);
//   }
// });

router.get("/:movieId", async (req, res, next) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      throw new Error("no movie id provided.");
    }

    // TODO: Do not fetch reviews that have a deletedAt value
    // TODO: Do not fetch reviews that do not have an associated rating that has a value.
    const allReviewsWithUser = await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(eq(reviews.movieId, movieId), isNull(reviews.deletedAt)))
      .orderBy(desc(reviews.updatedAt));

    console.log("allReviewsWithUser:", allReviewsWithUser);

    const constructedResponse = allReviewsWithUser?.map((resultItem) => {
      const review = resultItem.reviews;
      const user = resultItem.users;
      return {
        id: review.id,
        updatedAt: review.updatedAt,
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

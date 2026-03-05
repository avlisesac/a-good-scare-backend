var express = require("express");
var db = require("../db");
var router = express.Router();
var { ratings, lists, listItems } = require("../src/db/schema");
const { eq, and, isNotNull, inArray } = require("drizzle-orm");
const { calculateAverate } = require("../utils");

router.get("/:listId", async (req, res, next) => {
  try {
    const { listId } = req.params;
    if (!listId) {
      throw new Error("no list id available to proceed.");
    }

    const rows = await db
      .select({
        list: lists,
        item: listItems,
      })
      .from(lists)
      .leftJoin(listItems, eq(listItems.listId, lists.id))
      .where(eq(lists.id, listId))
      .orderBy(listItems.listPosition);

    if (!rows.length) {
      return res.status(404).json({ error: "List not found" });
    }

    const items = rows
      .filter((row) => row.item !== null)
      .map((row) => row.item);

    const movieIds = items.map((item) => item.movieId);

    const allRatings = movieIds.length
      ? await db
          .select()
          .from(ratings)
          .where(
            and(inArray(ratings.movieId, movieIds), isNotNull(ratings.rating)),
          )
      : [];

    const ratingsByMovie = {};

    for (const rating of allRatings) {
      if (!ratingsByMovie[rating.movieId]) {
        ratingsByMovie[rating.movieId] = [];
      }
      ratingsByMovie[rating.movieId].push(rating);
    }

    const tmdbApiKey = process.env.TMDB_API_KEY;
    console.log("apiKey:", tmdbApiKey);

    const movieDetailsArray = await Promise.all(
      movieIds.map((id) => {
        const url = `https://api.themoviedb.org/3/movie/${id}`;
        console.log("url:", url);
        return fetch(url, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            "Content-Type": "application/json",
          },
        }).then((res) => res.json());
      }),
    );

    const moviesById = {};
    movieDetailsArray.forEach((movie) => {
      moviesById[movie.id] = movie;
    });

    const itemsWithAverages = items.map((item) => {
      const movieRatings = ratingsByMovie[item.movieId] || [];

      return {
        ...item,
        ...calculateAverate(movieRatings),
        movie: moviesById[item.movieId] || null,
      };
    });

    const list = {
      ...rows[0].list,
      items: itemsWithAverages,
    };

    res.json(list);

    // TODO: test this!
  } catch (err) {
    next(err);
  }
});

module.exports = router;

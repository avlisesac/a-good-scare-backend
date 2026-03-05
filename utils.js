export const calculateAverate = (ratings) => {
  if (!ratings?.length) {
    return {
      average: "(No reviews yet)",
      icon: "unknown",
    };
  }

  const ratingsCount = ratings.length;
  const posRatings = ratings.filter((r) => r.rating === "pos");

  const averageRating = Math.round((posRatings.length / ratingsCount) * 100);

  return {
    average: `${averageRating}% (${ratingsCount} total reviews)`,
    icon: averageRating < 49 ? "skip" : "watch",
  };
};

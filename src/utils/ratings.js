// Community votes (hardcoded in photos.js for now) plus this user's own vote, if any.
// Used by PhotoCard to show the score and by Gallery to sort by rating.
// BACKEND: once the server stores the votes, return its totals directly instead.
export function getCommunityStats(photo, myRating) {
  const count = photo.ratingCount + (myRating > 0 ? 1 : 0)
  const average = count > 0 ? (photo.ratingTotal + myRating) / count : 0
  return { count, average }
}

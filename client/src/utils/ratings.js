// The server's ratingTotal / ratingCount already include every user's vote
// (including this user's), so the average is just total / count.
// Used by PhotoCard to show the score and by Gallery to sort by rating.
export function getCommunityStats(photo) {
  const count = photo.ratingCount
  const average = count > 0 ? photo.ratingTotal / count : 0
  return { count, average }
}

import moment from 'moment-timezone';
import { IGNORED_ACCOUNTS } from './constants.js';

export function calculateRelevance(toot) {
  if (!toot || !toot.account || !toot.account.id) {
    console.warn('Ignoring toot without account information:', toot);
    return null;
  }

  try {
    const w_F = 0.4; // Weight for favorites
    const w_B = 0.3; // Weight for boosts
    const w_N = 0.3; // Weight for followers
    const relevanceScore = Math.round((w_F * toot.favourites_count + w_B * toot.reblogs_count + w_N * (toot.account.followers_count || 0)) * 10) / 10;
    const result = {
      ...toot,
      relevanceScore,
    };
    return result;
  } catch (error) {
    console.error(`Error calculating relevance score for toot ${toot.id || 'unknown'}:`, error);
    return null;
  }
}

export function sortTootsByRelevance(toots) {
  return Promise.all(toots.map(calculateRelevance))
    .then(relevanceScores => relevanceScores.sort((a, b) => b.relevanceScore - a.relevanceScore));
}

export function removeIgnoredToots(toots) {
  return toots.filter(toot => !IGNORED_ACCOUNTS.includes(toot.account.username));
}

export function filterTootsByDate(toots, date) {
  return toots.filter(toot => moment(toot.created_at).format('YYYY-MM-DD') === date);
}

export function generateTootLink(tootId) {
  if (!tootId) {
    throw new Error('Toot ID is required');
  }

  const mastodonUrl = new URL(process.env.MASTODON_URL);
  mastodonUrl.pathname = mastodonUrl.pathname.replace('/api/v1', '');
  const url = new URL(`web/statuses/${tootId}`, mastodonUrl.origin);

  return url.href;
}

export async function calculateSumOfUses(hist) {
  const sum = hist.reduce((acc, curr) => acc + parseInt(curr.uses), 0);
  return sum;
}

export async function getPresentDayTimestamp(history) {
  const presentDay = moment().tz('UTC').startOf('day').unix();
  const presentDayTimestamp = (await history).find((item) => item.day === presentDay.toString());
  return presentDayTimestamp ? presentDayTimestamp.day : null;
}

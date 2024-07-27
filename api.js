import { MASTODON_URL, CLIENT_KEY, CLIENT_SECRET, ACCESS_TOKEN } from './config.js';
import Mastodon from'mastodon-api';
import { getPresentDayTimestamp } from './utils.js';

const M = new Mastodon({
  client_key: CLIENT_KEY,
  client_secret: CLIENT_SECRET,
  access_token: ACCESS_TOKEN,
  timeout_ms: 60 * 1000,
  api_url: MASTODON_URL,
});

export async function fetchTootsFromAPI(hashtag, params) {
  try {
    const response = await M.get(`timelines/tag/${hashtag}`, params);
    return response;
  } catch (error) {
    console.error(`Error fetching toots from API: ${error}`);
    throw error;
  }
}


export async function getHashtagUse(hashtag) {
    try {
      const response = await M.get(`tags/${hashtag}`);
      const accounts = response.data.accounts;
      const history = response.data.history;
      return history;
    } catch (error) {
      console.error(`Error fetching hashtag use: ${error}`);
      throw error;
    }
  }

  // Function that returns the result of getHashtagUse timestamp matching the present day timestamp
export async function presentDayHashtagUse(hashtag) {
  const history = await getHashtagUse(hashtag);
  const presentDay = await getPresentDayTimestamp(history);
  return presentDay ? history.filter((item) => item.day === presentDay) : null;
}
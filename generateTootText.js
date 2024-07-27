import { generateTootLink, calculateSumOfUses, getPresentDayTimestamp} from './utils.js';
import { getHashtagUse,presentDayHashtagUse } from './api.js';

const TOP_TOOTS_COUNT = 5;

export async function generateTootText(hashtag, toots) {
  if (!hashtag || !toots || toots.length === 0) return null;

  const [todayUses, history] = await Promise.all([
    presentDayHashtagUse(hashtag),
    getHashtagUse(hashtag)
  ]);
  if (!history || !history.length) return null;

  const [historicUses, presentDay] = await Promise.all([
    calculateSumOfUses(history),
    getPresentDayTimestamp(history)
  ]);
  if (!presentDay) return null;

  const topToots = toots.slice(0, TOP_TOOTS_COUNT);
  const topTootDetailsPromises = topToots.map(async ({
    account = { username: '(unknown username)', followers_count: 0 },
    favourites_count = 0,
    reblogs_count = 0,
    relevanceScore = 0,
    id,
  }) => {
    const link = await generateTootLink(id);
    return [account.username, account.followers_count, favourites_count, reblogs_count, relevanceScore, link];
  });
  const topTootDetails = await Promise.all(topTootDetailsPromises);

  const tootText = [
    `Tag do dia: #${hashtag}\n\n`,
    `Posts na semana: ${historicUses}\n`,
    `Participantes: ${history[0].accounts || 'unknown'}\n`,
    `Posts hoje: ${todayUses[0]?.uses || 'unknown'}\n\n`,
    `Principais posts de hoje:\n\n`,
    ...topTootDetails.map(([account, followers_count, favourites_count, reblogs_count, relevanceScore, link], i) => [
        `Publicado por ${account}\n`,
        `Seguidores: ${followers_count}\n`,
        `⭐ ${favourites_count} `,
        `🔄 ${reblogs_count} `,
        `📈 ${relevanceScore}\n`,
        `🔗 ${link}\n\n`,
    ].join('')),
  ].join('');

  return tootText;
}

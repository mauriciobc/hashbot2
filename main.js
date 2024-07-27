import { HASHTAGS, TOOTS_PER_PAGE } from './constants.js';
import { PREFERRED_TIMEZONE } from './config.js';
import { fetchTootsFromAPI } from './api.js';
import { sortTootsByRelevance, removeIgnoredToots, filterTootsByDate } from './utils.js';
import { generateTootText } from './generateTootText.js';
import readline from 'readline';
import moment from'moment-timezone';


async function main() {
  const hashtag = HASHTAGS[new Date().getDay()];
  const currentDate = moment().tz(PREFERRED_TIMEZONE).format('YYYY-MM-DD');
  const toots = await fetchToots(hashtag);
  const sortedToots = await sortTootsByRelevance(toots);
  const allowedToots = await removeIgnoredToots(sortedToots);
  const todaysToots = await filterTootsByDate(allowedToots, currentDate);
  const tootText = await generateTootText(hashtag, todaysToots);
  console.log(tootText);

  const answer = await new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Quer publicar o post? (s/n) ', answer => {
      rl.close();
      resolve(answer);
    });
  });

  if (answer.toLowerCase() === 's') {
    console.log(tootText);
    await createToot(tootText);
  }
}

async function fetchToots(hashtag) {
  try {
    let toots = [];
    let maxId = null;
    let progress = 0;
    console.log(`Obtendo posts para ${hashtag}...`);

    while (true) {
      const params = {
        tag: hashtag,
        limit: TOOTS_PER_PAGE,
      };
      if (maxId) {
        params.max_id = maxId;
      }

      const response = await fetchTootsFromAPI(hashtag, params);
      if (!Array.isArray(response.data)) {
        console.error('Erro ao obter posts:', response);
        break;
      }

      const newToots = response.data.filter(toot => toot && moment(toot.created_at).unix() >= moment().startOf('day').unix());
      toots.push(...newToots);

      maxId = newToots[newToots.length - 1]?.id;
      progress += newToots.length;

      if (newToots.length < TOOTS_PER_PAGE) {
        break;
      }
    }

    console.log(`Posts obtidos: ${toots.length}`);
    console.log(`Progresso: ${progress} / ${toots.length}`);
    return toots;
  } catch (error) {
    console.error('Erro ao obter posts:', error);
    throw error;
  }
}

async function createToot(tootText) {
  console.log('Entering createToot function');
  console.log('tootText:', tootText, tootText.length);

  if (typeof tootText!=='string') {
    throw new Error('Toot text must be a string');
  }

  if (tootText.trim() === '') {
    throw new Error('Toot text cannot be empty');
  }

  try {
    console.log('Attempting to create toot');
    const response = await fetch(`${process.env.MASTODON_URL}statuses`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: tootText,
        sensitive: false,
        visibility: 'public',
        language: 'pt'
      })
    });

    if (!response.ok) {
      throw new Error(`Error creating toot: ${response.status} ${response.statusText}`);
    }

    const toot = await response.json();
    console.log('Post criado com sucesso!');
    console.log('Detalhes do post:', toot);
  } catch (error) {
    console.error('Erro ao criar o post:', error);
    throw error;
  }
}

main();
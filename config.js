import dotenv from 'dotenv';
dotenv.config();

export const CLIENT_KEY = process.env.CLIENT_KEY;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export const MASTODON_URL = process.env.MASTODON_URL;
export const PREFERRED_TIMEZONE = 'America/Sao_Paulo';
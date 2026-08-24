import axios from 'axios';
import fs from 'fs';
import { buildReadme, SummarySchema } from './readme';

const SUMMARY_API = 'https://emasuriano.com/api/summary';
const USER_AGENT = 'EmaSuriano-Profile-README-Updater/1.0 (+https://github.com/EmaSuriano/EmaSuriano)';

const main = async () => {
  const summary = await axios.get(SUMMARY_API, {
    timeout: 10_000,
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  const content = buildReadme(
    SummarySchema.parse(summary.data),
    new Date().toISOString().slice(0, 10),
  );

  fs.writeFileSync('README.md', content);
};

main();

import axios from 'axios';
import fs from 'fs';
import z from 'zod';

const ROW_AMOUNT = 4;
const LINE_SEPARATOR = '\n';
const SUMMARY_API = 'https://emasuriano.com/api/summary';

const LinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});

const SummarySchema = z.object({
  name: z.string(),
  bio: z.string(),
  website: z.string().url(),
  projects: z.array(LinkSchema),
  posts: z.array(LinkSchema),
  talks: z.array(LinkSchema),
});

type Link = z.infer<typeof LinkSchema>;

const createList = (title: string, items: Link[], amount = ROW_AMOUNT) => {
  return [
    `### ${title}`,
    ...items
      .filter((_, i) => i < amount)
      .map((link) => `- [${link.title}](${link.url})`),
  ].join(LINE_SEPARATOR);
};

const buildMarkdown = (lines: string[]): string => {
  return lines.join(LINE_SEPARATOR + LINE_SEPARATOR);
};

const saveInReadme = (content: string) => {
  const today = new Date().toLocaleString('en', {
    year: 'numeric',
    month: '2-digit',
    day: 'numeric',
  });

  fs.writeFileSync(
    'README.md',
    buildMarkdown([
      content,
      '-------------------',
      `Last update: _${today}_`,
      '[![ci](https://github.com/EmaSuriano/EmaSuriano/actions/workflows/event-listener.yml/badge.svg)](https://github.com/EmaSuriano/EmaSuriano/actions/workflows/event-listener.yml)',
    ]),
  );
};

const getSummary = () => {
  return axios.get(SUMMARY_API, {
    headers: {
      // hack for Github Actions that returns 403 when calling with axios ...
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      Referer: 'https://emasuriano.com',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
    },
  });
};

const main = async () => {
  const summary = await getSummary();

  const { name, bio, website, projects, posts, talks } = SummarySchema.parse(
    summary.data,
  );

  const content = [
    `## Hello, I'm ${name} 👋`,
    bio,
    `Latest releases from [${website.split('://').pop()!}](${website}):`,
    createList('Open source projects', projects.reverse()),
    createList('Written posts', posts, 6),
    createList('Talks', talks),
  ];

  saveInReadme(buildMarkdown(content));
};

main();

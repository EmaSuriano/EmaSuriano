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
type Summary = z.infer<typeof SummarySchema>;

const toMarkdownLink = ({ title, url }: Link) => `[${title}](${url})`;

const createSummaryTable = ({
  talks,
  posts,
  projects,
}: Pick<Summary, 'talks' | 'posts' | 'projects'>) => {
  const columns = [
    { header: 'Projects 👨‍💻', rows: projects.map(toMarkdownLink) },
    { header: 'Posts ✍️', rows: posts.map(toMarkdownLink) },
    { header: 'Talks 🗣', rows: talks.map(toMarkdownLink) },
  ];

  const content = new Array(ROW_AMOUNT)
    .fill('')
    .map((_, i) => columns.map((column) => column.rows[i]).join(' | '));

  return [
    columns.map((column) => column.header).join(' | '),
    columns.map((_) => '---').join(' | '),
    ...content,
  ].map((line) => `| ${line} |`);
};

const main = async () => {
  const summary = await axios.get(SUMMARY_API);

  const { name, bio, website, projects, posts, talks } = SummarySchema.parse(
    summary.data,
  );

  const today = new Date().toLocaleString('en', {
    year: 'numeric',
    month: '2-digit',
    day: 'numeric',
  });

  const content = [
    `## Hello, I'm ${name} 👋`,
    bio,
    createSummaryTable({ posts, projects, talks }).join(LINE_SEPARATOR),
    toMarkdownLink("Ema's github stats", 'https://github-readme-stats.vercel.app/api?username=emasuriano&show_icons=true')
    '---',
    `All resources are extracted from ${toMarkdownLink({
      title: website.split('://').pop()!,
      url: website,
    })}`,
    `Last update: _${today}_`,
  ];

  fs.writeFileSync('README.md', content.join(LINE_SEPARATOR + LINE_SEPARATOR));
};

main();

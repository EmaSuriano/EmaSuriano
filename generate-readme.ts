import axios from 'axios';
import fs from 'fs';
import z from 'zod';

const ROW_AMOUNT = 4;
const LINE_SEPARATOR = '\n';
const SUMMARY_API = 'https://emasuriano.com/api/summary';

const LinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  image: z.boolean().optional()
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

const toMarkdownLink = ({ title, url, image }: Link) => `${image ? '!': ''}[${title}](${url})`;

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

const createList = (title: string, items: Link[]) => {
  return [`### ${title}`, ...items.filter((_,i) => i<ROW_AMOUNT).map(link => `- ${toMarkdownLink(link)}`)].join(LINE_SEPARATOR)
}

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
    createList('Latest projects:', projects),
    createList('Latest posts:', posts),
    createList('Latest talks:', talks),
    toMarkdownLink({
      title: "Ema's github stats",
      url: 'https://github-readme-stats.vercel.app/api?username=emasuriano&show_icons=true',
      image: true,
    }),
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

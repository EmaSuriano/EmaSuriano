import z from 'zod';

const ROW_AMOUNT = 4;
const LINE_SEPARATOR = '\n';
const CI_BADGE =
  '[![ci](https://github.com/EmaSuriano/EmaSuriano/actions/workflows/ci.yml/badge.svg)](https://github.com/EmaSuriano/EmaSuriano/actions/workflows/ci.yml)';

const LinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});

export const SummarySchema = z.object({
  name: z.string(),
  bio: z.string(),
  website: z.string().url(),
  projects: z.array(LinkSchema),
  posts: z.array(LinkSchema),
  talks: z.array(LinkSchema),
});

type Link = z.infer<typeof LinkSchema>;
type Summary = z.infer<typeof SummarySchema>;

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

export const buildReadme = (summary: Summary, updatedAt: string): string => {
  const { name, bio, website, projects, posts, talks } = summary;
  const content = [
    `## Hello, I'm ${name} 👋`,
    bio,
    `Latest releases from [${new URL(website).host}](${website}):`,
    createList('Open source projects', [...projects].reverse()),
    createList('Written posts', posts, 6),
    createList('Talks', talks),
  ];

  return buildMarkdown([
    buildMarkdown(content),
    '-------------------',
    `Last update: _${updatedAt}_`,
    CI_BADGE,
  ]);
};

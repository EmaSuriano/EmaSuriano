const axios = require('axios');
const yaml = require('yaml');
const fs = require('fs');

const ROW_AMOUNT = 4;
const LINE_SEPARATOR = '\n';
const WEBSITE = 'https://emasuriano.com';

const getSummaryFile = async () => {
  const { data } = await axios({
    method: 'GET',
    url: `${WEBSITE}/summary.yml`,
  });

  return yaml.parse(data);
};

const sortAndTrim = (items) => {
  return items
    .sort((x, y) => new Date(y.date) - new Date(x.date))
    .filter((x) => !x.secret)
    .splice(0, ROW_AMOUNT);
};

const externalLink = ({ name, link }) => `[${name}](${link})`;
const blogLink = ({ title }) =>
  `[${title}](${WEBSITE}/blog/${title.split(' ').join('-')})`;

const createSummaryTable = ({ talks, posts, projects }) => {
  const talksList = sortAndTrim(talks).map(externalLink);
  const postsList = sortAndTrim(posts).map(blogLink);
  const projectsList = sortAndTrim(projects).map(externalLink);

  const rows = new Array(ROW_AMOUNT)
    .fill('')
    .map(
      (_, i) =>
        `| ${projectsList[i] || ''} ` +
        `| ${postsList[i] || ''} ` +
        `| ${talksList[i] || ''} |`,
    );

  return [
    '| Projects 👨‍💻 | Posts ✍️ | Talks 🗣 |',
    '| --- | --- | --- |',
    ...rows,
  ].join(LINE_SEPARATOR);
};

const main = async () => {
  const summary = await getSummaryFile();
  const [about] = summary.about;

  const content = [
    `## Hello, I'm ${about.name} 👋`,
    about.bio.replace(LINE_SEPARATOR, ' '),
    createSummaryTable(summary),
    '---',
    `All resources are extracted from [${about.website}](${about.website}) ❤️`,
    `Last update: _${new Date().toLocaleString()}_`,
  ];

  fs.writeFileSync('README.md', content.join(LINE_SEPARATOR + LINE_SEPARATOR));
};

main();

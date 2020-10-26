const axios = require('axios');
const yaml = require('yaml');
const fs = require('fs');
require('dotenv').config();

const ROW_AMOUNT = 4;
const LINE_SEPARATOR = '\n';

const getSummaryFile = async () => {
  const { data } = await axios({
    method: 'GET',
    url: `http://emasuriano.com/summary.yml`,
  });

  return yaml.parse(data);
};

const sortAndTrim = (items) => {
  return items
    .sort((x, y) => new Date(y.date) - new Date(x.date))
    .splice(0, ROW_AMOUNT);
};

const createSummaryTable = ({ talks, posts, projects }, website) => {
  const talksList = sortAndTrim(talks).map(
    (talk) => `[${talk.name}](${talk.link})`,
  );
  const postsList = sortAndTrim(posts).map(
    (post) =>
      `[${post.title}](${website}blog/${post.title.split(' ').join('-')})`,
  );
  const projectsList = sortAndTrim(projects).map(
    (project) => `[${project.name}](${project.link})`,
  );

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
    createSummaryTable(summary, about.website),
    '---',
    `All resources are extracted from [${about.website}](${about.website}) ❤️`,
    `Last update: _${new Date().toLocaleString()}_`,
  ];

  fs.writeFileSync('README.md', content.join(LINE_SEPARATOR + LINE_SEPARATOR));
};

main();

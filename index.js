const Github = require('github-api');
const columnify = require('columnify');
const debug = require('debug')('git-hubsearch');
const inspect = require('util').inspect;
const chalk = require('chalk');

const yargs = require('yargs')
  .boolean(['help', 'fork'])
  .default({
    fork: false,
  })
  .alias({
    h: 'help',
    u: 'user',
  })
  .describe({
    user: '',
  })
  .help();

module.exports = () => {
  const argv = yargs.argv;
  debug(inspect(argv));

  const github = new Github({
    token: process.env.GITHUB_TOKEN,
  });

  const criteria = argv._;
  const user = github.getUser(argv.user);

  user.listRepos((err, repos) => {
    if (err) { error(err); }

    repos = repos
      .filter(repo => (argv.fork || !repo.fork))
      .filter(repo =>
        criteria.length === 0 ||
        criteria.some(word =>
          repo.name.indexOf(word) >= 0 ||
          (repo.description && repo.description.indexOf(word) >= 0)))
      .sort((a, b) => a.name > b.name ? 1 : a.name === b.name ? 0 : -1)
      .map(repo => {
        repo.description = repo.description || '';
        repo.homepage = repo.homepage || repo.html_url;
        repo.pushed_at = new Date(repo.pushed_at).toISOString().split('T')[0];

        if (repo.private) {
          repo.name = chalk.gray(repo.name);
          repo.description = chalk.gray(repo.description);
          repo.pushed_at = chalk.gray(repo.pushed_at);
          repo.homepage = chalk.gray(repo.homepage);
        }

        return repo;
      });

    let output = columnify(repos, {
      include: ["name", "description", "pushed_at", "homepage"],
      truncate: false,
      config: {
        name: { maxWidth: 40, truncate: false, truncateMarker: '' },
        description: { },
      }
    });

    criteria.forEach(word => {
      output = output.replace(new RegExp(word, 'gim'), chalk.red(word));
    });

    console.log(output);
  });
};

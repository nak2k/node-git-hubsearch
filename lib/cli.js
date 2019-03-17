const Github = require('github-api');
const columnify = require('columnify');
const debug = require('debug')('git-hubsearch');
const inspect = require('util').inspect;
const chalk = require('chalk');
const yargs = require('yargs');
const { showError } = require('./showError');

function main(callback) {
  const argv = yargs
    .usage('Usage: $0 [search terms ...]')
    .options({
      fork: {
        type: 'boolean',
        default: false,
        description: 'Show forked repos',
      },
      user: {
        type: 'string',
        alias: 'u',
        description: 'Specify an user which owns repos',
      },
      private: {
        type: 'boolean',
        description: 'Show only private repos',
      },
      public: {
        type: 'boolean',
        description: 'Show only public repos',
      },
    })
    .version()
    .help()
    .argv;

  debug(inspect(argv));

  const github = new Github({
    token: process.env.GITHUB_TOKEN,
  });

  const criteria = argv._;
  const user = github.getUser(argv.user);

  user.listRepos((err, repos) => {
    if (err) {
      return callback(err);
    }

    repos = repos
      .filter(repo => (argv.fork || !repo.fork))
      .filter(repo => (!argv.private || repo.private))
      .filter(repo => (!argv.public || !repo.private))
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
      include: ['name', 'description', 'pushed_at', 'homepage'],
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

    callback(null);
  });
}

main(err => {
  if (err) {
    showError(err);
    process.exit(1);
  }
});

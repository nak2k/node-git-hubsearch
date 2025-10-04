import { Octokit } from '@octokit/rest';
import columnify from 'columnify';
import createDebug from 'debug';
import { inspect } from 'util';
import chalk from 'chalk';
import yargs from 'yargs';
import { showError } from './showError.js';

const debug = createDebug('git-hubsearch');

async function main() {
  const argv = await yargs(process.argv.slice(2))
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

  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const criteria = argv._.map(String).filter(word => word.length > 0);

  const repos = await (argv.user
    ? octokit.paginate(octokit.repos.listForUser, {
      username: argv.user,
      type: 'all',
      per_page: 100,
    })
    : octokit.paginate(octokit.repos.listForAuthenticatedUser, {
      per_page: 100,
    }));

  const repos2 = repos
    .filter((repo) => (argv.fork || !repo.fork))
    .filter((repo) => (!argv.private || repo.private))
    .filter((repo) => (!argv.public || !repo.private))
    .filter((repo) =>
      criteria.length === 0 ||
      criteria.some(word =>
        repo.name.indexOf(word) >= 0 ||
        (repo.description && repo.description.indexOf(word) >= 0)))
    .sort((a, b) => a.name > b.name ? 1 : a.name === b.name ? 0 : -1)
    .map((repo) => {
      repo.description = repo.description || '';
      repo.homepage = repo.homepage || repo.html_url;
      repo.pushed_at = new Date(repo.pushed_at!).toISOString().split('T')[0];

      if (repo.private) {
        repo.name = chalk.gray(repo.name);
        repo.description = chalk.gray(repo.description);
        repo.pushed_at = chalk.gray(repo.pushed_at);
        repo.homepage = chalk.gray(repo.homepage);
      }

      return repo;
    });

  const output = columnify(repos2, {
    columns: ['name', 'description', 'pushed_at', 'homepage'],
    config: {
      name: { maxWidth: 40 },
      description: {},
    }
  });

  console.log(criteria.reduce((output, word) => {
    return output.replace(new RegExp(word, 'gim'), chalk.red(word));
  }, output));
}

main().catch(err => {
  if (err) {
    showError(err);
    process.exit(1);
  }
});

/*
 * The MIT License
 *
 * Copyright 2014-2016 Kengo Nakatsuka <kengo.nakatsuka@gmail.com>
 *
 */
var Github = require('github-api');
var columnify = require('columnify');
var debug = require('debug')('git-hubsearch');
var inspect = require('util').inspect;
var chalk = require('chalk');

var yargs = require('yargs')
  .boolean(['help', 'fork'])
  .default({
    user: process.env.USER,
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

module.exports = function() {
  var argv = yargs.argv;
  debug(inspect(argv));

  var github = new Github({});

  var criteria = argv._;
  var user = github.getUser();

  user.userRepos(argv.user, function(err, repos) {
    if (err) { error(err); }

    repos = repos
      .filter(function(repo) {
        return argv.fork || !repo.fork;
      })
      .filter(function(repo) {
        return criteria.length === 0 || criteria.some(function(word) {
          return repo.name.indexOf(word) >= 0
            || (repo.description && repo.description.indexOf(word) >= 0);
        });
      })
      .sort(function(a, b) {
        return a.name > b.name ? 1 : a.name === b.name ? 0 : -1;
      })
      .map(function(repo) {
        repo.homepage = repo.homepage || repo.html_url;
        repo.pushed_at = new Date(repo.pushed_at).toISOString().split('T')[0];
        return repo;
      });

    var output = columnify(repos, {
      include: ["name", "description", "pushed_at", "homepage"],
      truncate: false,
      config: {
        name: { maxWidth: 40, truncate: false, truncateMarker: '' },
        description: { },
      }
    });

    criteria.forEach(function(word) {
      output = output.replace(new RegExp(word, 'gim'), chalk.red(word));
    });

    console.log(output);
  });
};

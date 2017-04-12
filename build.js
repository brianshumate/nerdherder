#! /usr/bin/env node

const async = require('async')
const autoprefixer = require('metalsmith-autoprefixer')
const branch = require('metalsmith-branch')
const calc = require('postcss-calc')
const chalk = require('chalk')
const cleanCss = require('metalsmith-clean-css')
const customMedia = require('postcss-custom-media')
const customProperties = require('postcss-custom-properties')
const duo = require('metalsmith-duo')
const fingerprint = require('metalsmith-fingerprint')
const fs = require('fs-extra')
const GitHubApi = require('github')
const github = new GitHubApi({
  version: '3.0.0',
  protocol: 'https'
})
const layouts = require('metalsmith-layouts')
const metalsmith = require('metalsmith')
const minify = require('metalsmith-html-minifier')
const postcss = require('metalsmith-postcss')
const ProgressBar = require('progress')
const rename = require('metalsmith-rename')
const serve = require('metalsmith-serve')

if (process.argv.length < 4) {
  console.log(chalk.yellow('USAGE: nerdherder <GitHub API token> <location>'))
  process.exit(1)
}

github.authenticate({
  type: 'token',
  token: process.argv[2]
})

var users = []
var wantUsers = -1
var pageNumber = 0

const location = process.argv[3]

async.series([
  function (nextStep) {
    async.whilst(
      function () { return ((wantUsers < 0) || (users.length < wantUsers)) },
      function (nextPage) {
        github.search.users({
          q: 'location:"' + location + '"',
          page: pageNumber,
          per_page: 100
        }, function (err, result) {
          if (err) {
            return nextStep(err)
          }
          if (result.items) {
            users = users.concat(result.items)
          }
          if ((wantUsers < 0) && (result.total_count)) {
            wantUsers = result.total_count
            const locationHeader = '<h2 class="text-right">Herding ' + wantUsers + ' nerds in ' + location + '</h2>'
            const locationTemplatePath = 'partials/location.hbs'
            fs.writeFile(locationTemplatePath, locationHeader, function (err) {
              if (err) console.error(chalk.red(err))
            })
          }
          pageNumber += 1
          return nextPage(null)
        })
      },
      nextStep
    )
  },
  function (nextStep) {
    const nerdsTemplatePath = 'partials/allnerds.hbs'
    fs.remove(nerdsTemplatePath, function (err) {
      if (err) return console.error(chalk.red('ERROR: ' + err))
    })
    var bar = new ProgressBar('Herding nerds [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: users.length
    })
    async.eachSeries(users, function (user, nextUser) {
      github.user.getFrom({
        user: user.login,
        sort: 'updated',
        direction: 'desc',
        page: 0,
        per_page: 100
      }, function (err, result) {
        if (err) {
          console.error(chalk.red(err))
        }
        if (result) {
          var fullName = result.name
          var avatarURL = result.avatar_url
          var blogURL = '#'
          var canHire = 'No'
          var companyName = 'None'
          var emailAddress = '#'
          var emailButton = 'disabled hollow button'
          var followerCount = result.followers
          var ghUser = result.login
          var repoCount = result.public_repos
          var webButton = 'disabled hollow button'
          if (result.blog) {
            var prefix = 'http://'
            if (result.blog.substr(0, prefix.length) !== prefix) {
              blogURL = prefix + result.blog
            }
            webButton = 'secondary hollow button'
          }
          if (result.company) { companyName = result.company }
          if (result.email) {
            emailAddress = result.email
            emailButton = 'hollow button'
          }
          if (result.hireable === true) { canHire = 'Yes' }
          var nerd = ''
          nerd = '{{> nerd gh_user="' + ghUser + '" name="' + fullName + '" avatar="' + avatarURL + '" company="' + companyName + '" for_hire="' + canHire + '" repo_count="' + repoCount + '" follower_count="' + followerCount + '" email_url="' + emailAddress + '" website_url="' + blogURL + '" email_button_class="' + emailButton + '" web_button_class="' + webButton + '" }}\n'
          fs.appendFile(nerdsTemplatePath, nerd, function (err) {
            if (err) console.error(chalk.red(err))
            bar.tick()
          })
        }
        return nextUser(null)
      })
    }, nextStep)
  },
  function (nextStep) {
    const plugins = [
      customMedia,
      customProperties,
      calc
    ]
    const supported = {browsers: ['> 1%', 'last 2 versions', 'IE >= 9']}
    metalsmith(__dirname)
      .use(branch('*.hbs')
        .use(layouts({
          engine: 'handlebars',
          partials: 'partials'
        })))
      // process CSS
      .use(duo({entry: ['styles/style.css']}))
      .use(autoprefixer(supported))
      .use(postcss(plugins))
      .use(cleanCss({files: 'styles/style.css'}))
      .use(fingerprint({pattern: ['styles/style.css']}))
      // process templates
      .use(rename([[/\.hbs$/, '.html']]))
      .use(minify())
      // serve site on port 8080
      .use(serve({
        port: 8080,
        verbose: true
      }))
      // build
      .build(function (err) {
        if (err) {
          console.error(chalk.red(err))
        }
      })
    nextStep
  }
], function (err) {
  if (err) {
    console.error(chalk.red(err))
  }
  process.exit(0)
})

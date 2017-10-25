#!/usr/bin/env node

var inquirer = require('inquirer');
var clone = require('git-clone');

const repositories = {
  'wyvern': 'https://github.com/bitterendio/wyvern.git',
  'wyvern-new': 'https://github.com/bitterendio/wyvern.git',
  'wyvern-child': 'https://github.com/bitterendio/wyvern-child.git',
  'wyvern-shop': 'https://github.com/bitterendio/wyvern-shop.git',
  'wordpress': 'https://github.com/WordPress/WordPress.git'
};

let listAnswer = {};
let inputAnswer = {};

/* List questions */
const listQuestions = [
  {
    type: 'list',
    name: 'installation',
    message: 'What kind of installation do you want?',
    choices: [
      new inquirer.Separator('=== With Wordpress ==='),
      {
        name: 'Wordpress + Wyvern + Wyvern Child',
        value: {
          slug: ['wordpress', 'wyvern', 'wyvern-child'],
          type: 'wordpress',
          count: 3,
        },
      },
      {
        name: 'Wordpress + Wyvern + Wyvern Shop',
        value: {
          slug: ['wordpress', 'wyvern', 'wyvern-shop'],
          type: 'wordpress',
          count: 3,
        },
      },
      {
        name: 'Wordpress + Wyvern',
        value: {
          slug: ['wordpress', 'wyvern'],
          type: 'wordpress',
          count: 2,
        },
      },
      new inquirer.Separator('=== Just theme(s) ==='),
      {
        name: 'Wyvern + Wyvern Child',
        value: {
          slug: ['wyvern', 'wyvern-child'],
          type: 'theme',
          count: 2,
        },
      },
      {
        name: 'Wyvern',
        value: {
          slug: ['wyvern'],
          type: 'theme',
          count: 1,
        },
      },
      {
        name: 'Wyvern 0.2.0',
        value: {
          slug: ['wyvern-new'],
          type: 'theme',
          branch: '0.2.0',
          count: 1,
        },
      },
      {
        name: 'Wyvern Child',
        value: {
          slug: ['wyvern-child'],
          type: 'theme',
          count: 1,
        },
      },
      {
        name: 'Wyvern Shop',
        value: {
          slug: ['wyvern-shop'],
          type: 'theme',
          count: 1,
        },
      }
    ],
  }
];

inquirer.prompt(listQuestions).then((answer) => {
  listAnswer = answer.installation;
  const type = listAnswer.type;
  const count = listAnswer.count;
  const slug = listAnswer.slug;
  const branch = listAnswer.branch;

  function isType(installationType) {
    return installationType === type;
  };

  const inputs = [
    // Wordpress installations
    {
      type: 'input',
      name: 'path[0]',
      message: 'Where to clone Wordpress?',
      default: function () {
        return 'wordpress';
      },
      when: isType('wordpress'),
    },
    {
      type: 'input',
      name: 'path[1]',
      message: 'Name of ' + slug[1] + ' theme?',
      default() {
        return slug[1];
      },
      when: isType('wordpress') && count > 1,
    },
    {
      type: 'input',
      name: 'path[2]',
      message: 'Name of ' + slug[2] + ' theme?',
      default() {
        return slug[2];
      },
      when: isType('wordpress') && count > 2,
    },
    // Just themes installation
    {
      type: 'input',
      name: 'path[0]',
      message: 'Where to clone ' + slug[0] + ' theme?',
      default() {
        return slug[0];
      },
      when: isType('theme') && count >= 1,
    },
    {
      type: 'input',
      name: 'path[1]',
      message: 'Where to clone ' + slug[1] + ' theme?',
      default() {
        return slug[1];
      },
      when: isType('theme') && count > 1,
    },
  ];

  inquirer.prompt(inputs).then((inputsAnswer) => {
    inputAnswer = inputsAnswer;
    const paths = inputAnswer.path;

    // Just theme
    if (type === 'theme') {
      for (let i = 0; i < count; i++) {
        console.log('Cloning ' + slug[i] + ' theme from ' + repositories[slug[i]] + ' to /' + paths[i] + '...');
        let options = [];
        if (branch) {
          options = {checkout: branch};
        }
        clone(repositories[slug[i]], paths[i], options, function (err) {
          if (typeof err === 'undefined') {
            console.log(slug[i] + ' DONE!');
          } else {
            console.log(err);
          }
        })
      }
    // With wordpress
    } else if (type === 'wordpress') {
      const themesPath = paths[0] + '/wp-content/themes/';
      console.log('Cloning ' + slug[0] + ' from ' + repositories[slug[0]] + ' to /' + paths[0] + '...');
      // Clone wordpress
      clone(repositories[slug[0]], paths[0], [], function(err) {
        if (typeof err === 'undefined') {
          console.log(slug[0] + ' DONE!');
          // Clone theme(s)
          for (let i = 1; i < count; i++) {
            console.log('Cloning ' + slug[i] + ' theme from ' + repositories[slug[i]] + ' to /' + themesPath + paths[i] + '...');
            clone(repositories[slug[i]], themesPath + paths[i], [], function (err) {
              if (typeof err === 'undefined') {
                console.log(slug[i] + ' DONE!');
              } else {
                console.log(err);
              }
            })
          }
        } else {
          console.log(err);
        }
      });
    }
  });
});

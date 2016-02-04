/**
 * Generates a new project.
 * @module KickstartGenerator
 * @requires chalk
 * @requires mkdirp
 * @requires underscore.string
 * @requires yeoman-generator
 * @requires yosay
 * @author mail@markus-falk.com schramm@webit.de
 */

'use strict';

var

chalk = require('chalk'),
mkdirp = require('mkdirp'),
string = require('underscore.string'),
yeoman = require('yeoman-generator'),
yosay = require('yosay'),

KickstartGenerator = yeoman.Base.extend({

  /**
   * Loads package.json and waits for callback to finish.
   * @function init
   * @private
   */
  init: function () {

    this.pkg = require('../package.json');

    this.on('end', function () {

      if(this.wysiwygCMS) {
        this.log('Don\'t forget to run: ' + chalk.yellow('yo kickstart-webit:addcomponent backend'));
        this.log('\n');
      }
    });

  },

  /**
   * Ask user on project details.
   * @function askFor
   * @private
   */
  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Sit back and relax while I setup your project.'));

    var prompts = [
      {
        type: 'input',
        name: 'ProjectName',
        message: 'What is the project\'s name?'
      },
      {
        type: 'input',
        name: 'ProjectManager',
        message: 'Who is the project manager?'
      },
      {
        type: 'input',
        name: 'GraphicDesigner',
        message: 'Who is the graphic designer?'
      },
      {
        type: 'input',
        name: 'HTMLDeveloper',
        message: 'Who is developing the front end?'
      },
      {
        type: 'confirm',
        name: 'ProjectServer',
        message: 'Do you want to deploy to a webserver?',
        default: true,
      },
      {
        when: function(response) {
          return response.ProjectServer;
        },
        type: 'input',
        name: 'Username',
        message: 'What is the Username?'
      },
      {
        when: function(response) {
          return response.ProjectServer;
        },
        type: 'input',
        name: 'sshPath',
        message: 'Please insert the Path to your ssh-Key, starting from Home. (e.g.: .ssh/id_rsa)'
      },
      {
        when: function(response) {
          return response.ProjectServer;
        },
        type: 'input',
        name: 'HostServer',
        message: 'What is the Hostserver?'
      },
      {
        when: function(response) {
          return response.ProjectServer;
        },
        type: 'input',
        name: 'DeployPath',
        message: 'What is the Deploymentpath?'
      },
      {
        type: 'confirm',
        name: 'wysiwygCMS',
        message: 'Do you need additional setup for your wysiwyg CMS?',
        default: false
      },
      {
        type: 'confirm',
        name: 'oldIE',
        message: 'Would you like to support legacy IE (<9)?',
        default: false
      },
      {
        type: 'confirm',
        name: 'livereload',
        message: 'Would you like include livereload.js into your sandbox.html?',
        default: true
      },
      {
        type: 'list',
        name: 'WCAG2',
        message: 'What WCAG2A level would you like to develop for?',
        choices: [{
          name: 'A',
          value: 'A'
        },
        {
          name: 'AA',
          value: 'AA'
        },
        {
          name: 'AAA',
          value: 'AAA'
        }]
      }
    ];

    this.prompt(prompts, function (answers) {

      // README
      this.GraphicDesigner = answers.GraphicDesigner;
      this.HTMLDeveloper = answers.HTMLDeveloper;
      this.ProjectManager = answers.ProjectManager;
      this.ProjectName = string.slugify(answers.ProjectName);
      this.ProjectServer = answers.ProjectServer;
      this.HostServer = answers.HostServer;
      this.Username = answers.Username;
      this.sshPath = answers.sshPath;
      this.DeployPath = answers.DeployPath;

      // wysiwygCMS
      this.wysiwygCMS = answers.wysiwygCMS;

      // livereload
      this.livereload = answers.livereload;

      // Support level
      this.oldIE = answers.oldIE;
      this.WCAG2 = answers.WCAG2;

      done();
    }.bind(this));
  },

  /**
   * Create empty folders needed for project.
   * @function folders
   * @private
   */
  folders: function () {
    mkdirp.mkdirp('img');
  },

  /**
   * Create all package files from templates.
   * @function packagefiles
   * @private
   */
  packagefiles: function () {

    this.fs.copyTpl(
      this.templatePath('_accessibilityrc'),
      this.destinationPath('.accessibilityrc')
    );

    this.fs.copyTpl(
      this.templatePath('_bowerrc'),
      this.destinationPath('.bowerrc')
    );

    this.fs.copyTpl(
      this.templatePath('_gitignore'),
      this.destinationPath('.gitignore'),
      {
        ProjectServer: this.ProjectServer
      }
    );

    this.fs.copyTpl(
      this.templatePath('_gems.rb'),
      this.destinationPath('gems.rb')
    );

    this.fs.copyTpl(
      this.templatePath('_editorconfig'),
      this.destinationPath('.editorconfig')
    );

    this.fs.copyTpl(
      this.templatePath('_csslintrc'),
      this.destinationPath('.csslintrc')
    );

    this.fs.copyTpl(
      this.templatePath('_scsslintrc'),
      this.destinationPath('.scsslintrc')
    );

    this.fs.copyTpl(
      this.templatePath('_jshintrc'),
      this.destinationPath('.jshintrc')
    );

    this.fs.copyTpl(
      this.templatePath('_bower.json'),
      this.destinationPath('bower.json'),
      {
        ProjectName: this.ProjectName,
        oldIE: this.oldIE
      }
    );

    this.fs.copyTpl(
      this.templatePath('_gruntfile.js'),
      this.destinationPath('gruntfile.js'),
      {
        ProjectName: this.ProjectName,
        ProjectServer: this.ProjectServer,
        WCAG2: this.WCAG2,
        oldIE: this.oldIE
      }
    );

    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      {
        ProjectName: this.ProjectName,
        ProjectServer: this.ProjectServer
      }
    );

    this.fs.copyTpl(
      this.templatePath('_clientConfig.json'),
      this.destinationPath('clientConfig.json'),
      {
        ProjectName: this.ProjectName,
        ProjectServer: this.ProjectServer,
        sshPath: this.sshPath
      }
    );

    this.fs.copyTpl(
      this.templatePath('_hostConfig.json'),
      this.destinationPath('hostConfig.json'),
      {
        ProjectName: this.ProjectName,
        ProjectServer: this.ProjectServer,
        Username: this.Username,
        HostServer: this.HostServer,
        DeployPath: this.DeployPath
      }
    );

    this.fs.copyTpl(
      this.templatePath('_readme.md'),
      this.destinationPath('README.md'),
      {
        ProjectName: this.ProjectName,
        WCAG2: this.WCAG2,
        oldIE: this.oldIE,
        GraphicDesigner: this.GraphicDesigner,
        HTMLDeveloper: this.HTMLDeveloper,
        ProjectManager: this.ProjectManager
      }
    );

  },

  /**
   * Create all javascript files from templates.
   * @function javascript
   * @private
   */
  javascript: function () {

    this.fs.copyTpl(
      this.templatePath('_frontend-template-setup.js'),
      this.destinationPath('components/' + this.ProjectName + '.js'),
      {
        oldIE: this.oldIE
      }
    );

    this.fs.copyTpl(
      this.templatePath('_main.js'),
      this.destinationPath('components/app/main.js'),
      {
        oldIE: this.oldIE
      }
    );
  },

  /**
   * Create all files needed for QUnit from templates.
   * @function qunit
   * @private
   */
  qunit: function () {

    this.fs.copyTpl(
      this.templatePath('qunit/_qunit-test-suite.html'),
      this.destinationPath('qunit/qunit-test-suite.html'),
      {
        ProjectName: this.ProjectName
      }
    );

    this.fs.copy(
      this.templatePath('qunit/_unit.js'),
      this.destinationPath('qunit/unit.js')
    );

    this.fs.copy(
      this.templatePath('qunit/_config.js'),
      this.destinationPath('qunit/config.js')
    );

  },

  /**
   * Create all scss files from templates.
   * @function styles
   * @private
   */
  styles: function () {
    this.fs.copyTpl(
      this.templatePath('_frontend-template-setup.scss'),
      this.destinationPath('components/' + this.ProjectName + '.scss')
    );
  },

  /**
   * Create all HTML files from templates.
   * @function html
   * @private
   */
  html: function () {
    this.fs.copyTpl(
      this.templatePath('_sandbox.html'),
      this.destinationPath('sandbox.html'),
      {
        ProjectName: this.ProjectName,
        oldIE: this.oldIE,
        wysiwygCMS: this.wysiwygCMS,
        livereload: this.livereload
      }
    );
  },

  /**
   * Create all Components from templates.
   * @function components
   * @private
   */
  components: function () {

    // Site-Icons
    this.fs.copyTpl(
      this.templatePath('site-icons/_site-icons.html'),
      this.destinationPath('components/app/site-icons/site-icons.html')
    );

    this.fs.copyTpl(
      this.templatePath('site-icons/_windows-tile-icon.html'),
      this.destinationPath('components/app/site-icons/windows-tile-icon.html')
    );

    this.fs.copy(
      this.templatePath('site-icons/img/_favicon.ico'),
      this.destinationPath('components/app/site-icons/img/favicon.ico')
    );

    this.fs.copy(
      this.templatePath('site-icons/img/_apple-touch-icon.png'),
      this.destinationPath('components/app/site-icons/img/apple-touch-icon.png')
    );

    this.fs.copy(
      this.templatePath('site-icons/img/_windows-tile-icon.png'),
      this.destinationPath('components/app/site-icons/img/windows-tile-icon.png')
    );

  },

  /**
   * Automatically install all dependencies.
   * @function install
   * @private
   */
  install: function () {

    if (!this.options['skip-install']) {
      // bower & npm
      this.installDependencies();

      // gems
      this.log('Running ' + chalk.yellow.bold('bundle install') + ' for you to install the required dependencies. If this fails, try running the command yourself.');
      this.log('\n');
      this.spawnCommand('bundle', ['install']);
    }

  }

});

module.exports = KickstartGenerator;

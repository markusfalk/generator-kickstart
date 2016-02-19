/**
 * Adds a new component to the project.
 * @module AddcomponentGenerator
 * @requires chalk
 * @requires mkdirp
 * @requires underscore.string
 * @requires yeoman-generator
 * @author mail@markus-falk.com
 */

'use strict';

var

chalk = require('chalk'),
mkdirp = require('mkdirp'),
string = require('underscore.string'),
yeoman = require('yeoman-generator'),
lineNumber = require('line-number'),

AddcomponentGenerator = yeoman.Base.extend({

  /**
   * Loads package.json and binds events.
   * @function init
   * @private
   */
  init: function () {

    this.on('end', function () {
      // output a little help
      if (this.ComponentType === 'standardModule') {
        if(this.includeHTML) {
          this.log('You can use it in your HTML with ' + chalk.yellow('{app:{' + string.slugify(this.name) + '}}'));
        }
      } else {
        if(this.includeHTML) {
          this.log('You can use it in your HTML with ' + chalk.yellow('{deferred:{' + string.slugify(this.name) + '}}'));
        }
      }
    });

    // take care of error handling
    this.on('error', function(message) {
      // print error message
      this.log.error(message);
      // exit shell
      process.exit(5);
    });

    // load package.json
    try {
      this.pkg = this._loadJSON('package.json');
    } catch (error) {
      this.emit('error', error);
      return;
    }
  },

  /**
   * Converts user's answers into Booleans.
   * @function _hasFeature
   * @returns {Boolean} Is this feature wanted?
   * @private
   */
  _hasFeature: function (feature) {
    return this.features && this.features.indexOf(feature) !== -1;
  },

  /**
   * Loads JSON files.
   * @function _loadJSON
   * @returns {JSON} file's contents
   * @private
   */
  _loadJSON: function(name) {
    var json = this.fs.readJSON(name);

    if(json) {
      return json;
    } else {
      throw new Error('Could not open ' + name + '. Are you in root directory of the project?');
    }

  },

  /**
   * Asks user questions about the component.
   * @function askForApp
   * @private
   */
  askForApp: function () {
    var done = this.async();

    var prompts = [
      {
        type: 'list',
        name: 'ComponentType',
        message: 'What type of module would you like to add?',
        choices: [{
          name: 'Standard module (compiled to main file)',
          value: 'standardModule'
        },
        {
          name: 'Deferred module (dynamically loaded)',
          value: 'DeferredModule'
        }]
      },
      {
        type: 'checkbox',
        name: 'whatFiles',
        message: 'What assets do you need?',
        choices: [
          {
            name: 'HTML',
            value: 'includeHTML',
            checked: true
          },
          {
            name: 'SCSS',
            value: 'includeSCSS',
            checked: true
          },
          {
            name: 'JS',
            value: 'includeJS',
            checked: true
          },
          {
            name: 'QUnit Test',
            value: 'includeQUnit',
            checked: false
          }
        ]
      }
    ];

    this.prompt(prompts, function (answers) {

      this.features = answers.whatFiles;

      this.includeHTML = this._hasFeature('includeHTML');
      this.includeJS = this._hasFeature('includeJS');
      this.includeQUnit = this._hasFeature('includeQUnit');
      this.includeSCSS = this._hasFeature('includeSCSS');

      this.ComponentType = answers.ComponentType;

      done();
    }.bind(this));
  },

  /**
   * Set paths depending on user's answers.
   * @function setDefaults
   * @private
   */
  setDefaults: function () {

    if (this.ComponentType === 'standardModule') {
      this.directory = 'components/app/';
    } else {
      this.directory = 'components/app/_deferred/';
    }

  },

  /**
   * Add all wanted files to the new component.
   * @function addApp
   * @private
   */
  addApp: function () {

    // set path
    var
    path = this.directory + string.slugify(this.name);

    // create directory
    mkdirp.mkdirp(path);

    if (this.includeJS) {
      this.fs.copyTpl(
        this.templatePath('_component.js'),
        this.destinationPath(path + '/' + string.slugify(this.name) + '.js'),
        {
          class_name: string.classify(this.name),
          _name: string.underscored(this.name),
          slug_name: string.slugify(this.name)
        }
      );
    }

    // use underscored file name for standard modules
    var SCSSFile = path + '/_' + string.slugify(this.name) + '.scss';

    // use normal filename to render deferred file
    if(this.ComponentType === 'DeferredModule') {
      SCSSFile = path + '/' + string.slugify(this.name) + '.scss';
    }

    if (this.includeSCSS) {
      this.fs.copyTpl(
        this.templatePath('_component.scss'),
        this.destinationPath(SCSSFile),
        {
          slug_name: string.slugify(this.name)
        }
      );
    }

    if (this.includeHTML) {
      this.fs.copyTpl(
        this.templatePath('_component.html'),
        this.destinationPath(path + '/' + string.slugify(this.name) + '.html'),
        {
          slug_name: string.slugify(this.name)
        }
      );
    }

    if (this.includeQUnit) {
      this.fs.copyTpl(
        this.templatePath('_qunit-test.js'),
        this.destinationPath(path + '/test-' + string.slugify(this.name) + '.js'),
        {
          class_name: string.classify(this.name),
          slug_name: string.slugify(this.name)
        }
      );
    }
  },

  /**
   * Add the new component to the scss base file.
   * @function addStyling
   * @private
   */
  addStyling: function () {

    if (this.includeSCSS) {

      var
      path = 'components/' + this.pkg.name + '.scss';

      // also enable to use hidden scss with _
      // this way project-name.scss can be imported
      // for theming support
      if(!this.fs.exists(path)) {
        path = 'components/_' + this.pkg.name + '.scss';
      }

      // exit app when file doesn't exist
      if(!this.fs.exists(path)) {
        this.emit('error', 'Does ' + path + ' exist?');
      }

      // read
      var
      file = this.fs.read(path),
      regex = new RegExp('/' + string.slugify(this.name) + '/', 'g'),
      line = lineNumber(file, regex);

      if (line.length === 0) {

        // compose
        if (this.ComponentType === 'standardModule') {
          file += '@import \'app/' + string.slugify(this.name) + '/' + string.slugify(this.name) + '\';\n';
        } else {
          file += '@import \'app/_deferred/' + string.slugify(this.name) + '/' + string.slugify(this.name) + '\';\n';
        }

        // write
        this.fs.write(path, file);

      } else {
        // component is already in main scss file
        this.log(chalk.cyan('already defined on line: ') + chalk.yellow(line[0].number) + ' (' + path + ')');
      }
    }
  },

  /**
   * Add the new component to the requirejs config file.
   * @function addToRequireJS
   * @private
   */
  addToRequireJS: function () {

    if (this.includeJS) {

      var
      path = 'components/' + this.pkg.name + '.js';

      // exit app when file doesn't exist
      if(!this.fs.exists(path)) {
        this.emit('error', 'Does ' + path + ' exist?');
      }

      var file = this.fs.read(path),
      match = '//{{app}}',
      regex = new RegExp('/' + string.slugify(this.name) + '/', 'g'),
      line = lineNumber(file, regex),
      newcontent,
      newfile;

      if (line.length === 0) {

        // compose
        if (this.ComponentType === 'standardModule') {
          newcontent = '//{{app}}\n    \'' + string.slugify(this.name) + '\': \'' + 'app/' + string.slugify(this.name) + '/'+ string.slugify(this.name) + '\',';
        } else {
          newcontent = '//{{app}}\n    \'' + string.slugify(this.name) + '\': \'' + 'app/_deferred/' + string.slugify(this.name) + '/'+ string.slugify(this.name) + '\',';
        }

        // replace and write if component isn't defined in config
        newfile = file.replace(match, newcontent);
        this.fs.write(path, newfile);

      } else {
        // component is already in config file
        this.log(chalk.cyan('already defined on line: ') + chalk.yellow(line[0].number) + ' (' + path + ')');
      }

    }
  }

});

module.exports = AddcomponentGenerator;

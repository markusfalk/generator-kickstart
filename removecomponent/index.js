/**
 * Adds a new component to the project.
 * @module RemovecomponentGenerator
 * @requires underscore.string
 * @requires yeoman-generator
 * @author mail@markus-falk.com
 */

'use strict';

var

string = require('underscore.string'),
yeoman = require('yeoman-generator'),

RemovecomponentGenerator = yeoman.NamedBase.extend({

  /**
   * Sets required arguments.
   * @function constructor
   * @private
   */
  constructor: function () {
    yeoman.Base.apply(this, arguments);

    this.argument('name', {
      required: true,
      type: String,
      desc: 'The component name.'
    });

    // take care of error handling
    this.on('error', function(message) {
      // print error message
      this.log.error(message);
      // exit shell
      process.exit(5);
    });

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
   * Loads package.json.
   * @function getPackage
   * @private
   */
  getPackage: function () {
    try {
      this.pkg = this._loadJSON('package.json');
    } catch (error) {
      this.emit('error', error);
      return;
    }
  },

  /**
   * Asks user questions about the component.
   * @function prompts
   * @private
   */
  prompts: function () {
    var done = this.async();

    var prompts = [
      {
        type: 'list',
        name: 'ComponentType',
        message: 'What type of module would you like to remove?',
        choices: [{
          name: 'Standard module (compiled to main file)',
          value: 'standardModule'
        },
        {
          name: 'Deferred module (dynamically loaded)',
          value: 'DeferredModule'
        }]
      }
    ];

    this.prompt(prompts, function (answers) {
      this.features = answers.whatFiles;
      this.ComponentType = answers.ComponentType;

      done();
    }.bind(this));
  },

  /**
   * Set paths depending on user's answers.
   * @function setDefaults
   * @private
   */
  setDefaults: function() {
    if (this.ComponentType === 'standardModule') {
      this.directory = 'components/app/';
    } else {
      this.directory = 'components/app/_deferred/';
    }
  },

  /**
   * Removes all component's files.
   * @function addApp
   * @private
   */
  removeApp: function () {
    // remove folder from app/
    this.fs.delete(this.directory + this.name);
  },

  /**
   * Removes component's styling from base file.
   * @function addApp
   * @private
   */
  removeStyling: function () {

    var
    path = 'components/' + this.pkg.name + '.scss',
    match,
    newcontent = '';

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

    var file = this.fs.read(path);

    if (this.ComponentType === 'standardModule') {
      match = '@import \'app\/' + string.slugify(this.name) + '\/' + string.slugify(this.name) + '\';\n';
    } else {
      match = '@import \'app\/_deferred\/' + string.slugify(this.name) + '\/' + string.slugify(this.name) + '\';\n';
    }

    var newfile = file.replace(match, newcontent);

    this.fs.write(path, newfile);
  },

  /**
   * Removes component's styling from requirejs config.
   * @function addApp
   * @private
   */
  removeFromRequireJS: function () {

    var
    path = 'components/' + this.pkg.name + '.js';

    // exit app when file doesn't exist
    if(!this.fs.exists(path)) {
      this.emit('error', 'Does ' + path + ' exist?');
    }

    var
    file = this.fs.read(path),
    newcontent = '',
    match;

    if (this.ComponentType === 'standardModule') {
      match = '\'' + string.slugify(this.name) + '\': \'app/' + string.slugify(this.name) + '/' + string.slugify(this.name) + '\',\n';
    } else {
      match = '\'' + string.slugify(this.name) + '\': \'app/_deferred/' + string.slugify(this.name) + '/' + string.slugify(this.name) + '\',\n';
    }

    var newfile = file.replace(match, newcontent);
    this.fs.write(path, newfile);
  }

});

module.exports = RemovecomponentGenerator;

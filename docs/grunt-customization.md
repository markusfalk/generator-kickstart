## Grunt Tasks

### grunt
Builds the whole project into ```build/```.

### grunt watch
The ```watch```-task is used during development and smartly builds only what is needed.

### grunt preview
Builds minified and optimized assets for deployment into ```build/```. Deploy build to any Server with ssh-deploy. Can be used by other deployment scripts to get the whole front-end production ready.

### grunt live
Builds minified and optimized assets for deployment into ```build/```.
Can be used by other deployment scripts to get the whole front-end production ready.

### grunt test
Runs all quality assurance tasks. This task can be used in a pre-commit hook to keep
the repository on a high level of quality.

### grunt doc
Creates JavaScript documentation in ```documentation/```.

## Customization of your grunt tasks

For each customizable task there is a ```.*rc```-file that you can use to make these tasks fit your needs.

* Accessibility-Linter: [.accessibilityrc](https://github.com/yargalot/grunt-accessibility/)
* JSHint: [.jshintrc](http://www.jshint.com/docs/options/)
* OOCSS-Linter: [.csslintrc](https://github.com/CSSLint/csslint/wiki/Rules)
* SCSS-Linter: [.scsslintrc](https://github.com/brigade/scss-lint/blob/master/lib/scss_lint/linter/README.md)

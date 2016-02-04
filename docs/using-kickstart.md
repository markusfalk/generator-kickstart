### Start new project

Navigate to an **empty** folder where you want to setup your new project. Then use the following command to start the generator and answer a few questions. It will ask for a few things put to a README.md and what libs you might want to use.

```bash
$ yo kickstart-webit [--skip-install]
```

With 'skip-install' option set Kickstart will not install node, bower or gems.

### Adding a new component

The command will add your styles to the .scss and to the requireJS config file. It will ask if the component is a 'standard module' or 'deferred module'. If the component uses JS this will do the following:

* **standard**: add requireJS module to main and add component to app/
* **deferred**: you will have to require the module yourself and the component is added to app/_deferred/

```bash
$ yo kickstart-webit:addcomponent <name>
```

You can also use this command multiple times on the same component to add HTML, SCSS or JS as you need it.

### Removing a component

This command removes a component, all its files and references in .scss and .js.

```bash
$ yo kickstart-webit:removecomponent <name>
```

### Adding a lib

It is recommended to use bower itself to add new packages to lib.

```bash
$ bower install <package-name> --save
```

Don't forget to add your lib to &lt;project-name&gt;.scss or &lt;project-name&gt;.js if needed.
Kickstart uses [sass-css-importer](https://github.com/chriseppstein/sass-css-importer) which lets you import CSS with 'CSS:'-prefix.

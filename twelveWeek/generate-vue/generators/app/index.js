const Generator = require('yeoman-generator');
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }
  async initPackage() {
    const answer = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: this.appname, // Default to current folder name
      },
    ]);
    const pkgJson = {
      name: answer.name,
      version: '1.0.0',
      description: '',
      main: 'index.js',
      scripts: {
        webpack: 'webpack',
        test: 'echo "Error: no test specified" && exit 1',
      },
      author: '',
      license: 'ISC',
      devDependencies: {},
      dependencies: {},
    };

    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    this.npmInstall(['vue']);
    this.npmInstall(['webpack', 'vue-loader', 'babel-loader', 'css-loader', 'webpack-cli', 'vue-template-compiler'], {
      'save-dev': true,
    });
  }

  async copyTemplate() {
    const answer = await this.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Your title',
        default: this.appname, // Default to current folder name
      },
    ]);
    this.fs.copyTpl(this.templatePath('helloWorld.vue'), this.destinationPath('src/components/helloWorld.vue'));
    this.fs.copyTpl(this.templatePath('index.html'), this.destinationPath('src/index.html'), answer);
    this.fs.copyTpl(this.templatePath('main.js'), this.destinationPath('src/main.js'));
    this.fs.copyTpl(this.templatePath('webpack.config.js'), this.destinationPath('webpack.config.js'));
  }
};

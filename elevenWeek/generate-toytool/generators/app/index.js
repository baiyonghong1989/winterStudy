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
        build: 'webpack --watch',
        test: 'mocha --require @babel/register',
        coverage: 'nyc mocha',
      },
      author: '',
      license: 'ISC',
      devDependencies: {},
      dependencies: {},
    };

    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    this.npmInstall(['vue']);
    this.npmInstall(
      [
        'webpack',
        'vue-loader',
        'babel-loader',
        'css-loader',
        'webpack-cli',
        'vue-template-compiler',
        'copy-webpack-plugin',
        '@babel/preset-env',
        '@babel/register',
        '@babel/core',
        '@istanbuljs/nyc-config-babel',
        'nyc',
        'mocha',
        'babel-plugin-istanbul',
      ],
      {
        'save-dev': true,
      },
    );
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
    this.fs.copyTpl(this.templatePath('.babelrc'), this.destinationPath('.babelrc'));
    this.fs.copyTpl(this.templatePath('.nycrc'), this.destinationPath('.nycrc'));
    this.fs.copyTpl(this.templatePath('test-case.js'), this.destinationPath('test/test-case.js'));
  }
};

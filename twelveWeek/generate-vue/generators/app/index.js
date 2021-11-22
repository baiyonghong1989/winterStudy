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
        test: 'echo "Error: no test specified" && exit 1',
      },
      author: '',
      license: 'ISC',
      devDependencies: {},
      dependencies: {},
    };

    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    this.npmInstall(['vue']);
    this.npmInstall(['webpack', 'vue-loader'], { 'save-dev': true });
  }

  copyTemplate() {
    this.fs.copyTpl(this.templatePath('helloWorld.vue'), this.destinationPath('src/helloWorld.vue'));
  }
};

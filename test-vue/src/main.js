import vue from 'vue';
import HelloWorld from './components/helloWorld.vue';
console.log(123)
new vue({
  el: '#app',
  template: '<HelloWorld></HelloWorld>',
});

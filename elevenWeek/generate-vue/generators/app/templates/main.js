import vue from 'vue';
import HelloWorld from './components/HelloWorld.vue';
new vue({
  el: '#app',
  render: (h) => h(HelloWorld),
});

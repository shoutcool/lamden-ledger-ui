import { createApp } from 'vue'
import App from './App.vue'
import VueNumberInput from '@chenfengyuan/vue-number-input';
import VueMarkdownIt from 'vue3-markdown-it';
import router from './router/index.js'


const app = createApp(App);

app.component('vue-number-input', VueNumberInput);
app.component('vue3-markdown-it', VueMarkdownIt);
app.use(router);
//console.log(VueNumberInput.name)

app.mount('#app')

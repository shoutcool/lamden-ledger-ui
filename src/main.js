import { createApp } from 'vue'
import App from './App.vue'
import VueNumberInput from '@chenfengyuan/vue-number-input';

const app = createApp(App);

app.component('vue-number-input', VueNumberInput);
//console.log(VueNumberInput.name)

app.mount('#app')

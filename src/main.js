import { createApp } from 'vue'
import App from './App.vue'
import { createStore } from 'vuex'
import VueNumberInput from '@chenfengyuan/vue-number-input';
import VueMarkdownIt from 'vue3-markdown-it';
import router from './router/index.js'
import VueUniversalModal from 'vue-universal-modal'
import VueClipboard from 'vue3-clipboard'
import 'vue-universal-modal/dist/index.css'

// Create a new store instance.
const store = createStore({
    state() {
        return {
            mainnet: false
        }
    },
    mutations: {
        networkChange(state, newNetwork) {
            console.log("New Mainnet value in store " + newNetwork)
            state.mainnet = newNetwork
        }
    }
})

const app = createApp(App);

app.component('vue-number-input', VueNumberInput);
app.component('vue3-markdown-it', VueMarkdownIt);
app.use(VueUniversalModal, {
    teleportTarget: '#modals'
})
app.use(router);
app.use(store);
app.use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true,
});
//console.log(VueNumberInput.name)

app.mount('#app')

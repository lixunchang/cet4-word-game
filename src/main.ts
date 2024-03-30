import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css'
import './assets/main.css';

const app = createApp(App)

app.use(ElementPlus)

app.use(createPinia())
app.use(router)
app.mount('#app')

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js').then(registration => {
//       console.log('Service Worker registered with scope: ', registration.scope);
//     }).catch(error => {
//       console.log('Service Worker registration failed: ', error);
//     });
//   });
// }

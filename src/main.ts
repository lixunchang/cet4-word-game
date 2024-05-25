import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css'
import './assets/main.css';
import axios from 'axios';
import VForm3 from 'vform3-builds'  //引入VForm 3库
import 'vform3-builds/dist/designer.style.css'  //引入VForm3样式

import '@jcsk/logic-flow-service/dist/style.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(VForm3)  //全局注册VForm 3(同时注册了v-form-designer和v-form-render组件)

app.use(createPinia())
app.use(router)
/* 注意：如果你的项目中有使用axios，请用下面一行代码将全局axios复位为你的axios！！ */
window.axios = axios
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

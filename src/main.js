import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

//导入全局样式
import './assets/css/global.css'
//导入图标字体
import './assets/fonts/iconfont.css'

import axios from 'axios'

//树形插件
import TreeTable from 'vue-table-with-tree-grid'

Vue.component('tree-table', TreeTable)

//编辑器
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//进度条
import NProgress from 'nprogress'
import  'nprogress/nprogress.css'

Vue.use(VueQuillEditor, /* { default global options } */)


Vue.prototype.$http = axios
//配置请求的根路径
axios.defaults.baseURL =  'http://127.0.0.1:8888/api/private/v1/'
// 配置拦截器
//在request拦截器中展示京都条
axios.interceptors.request.use(config =>{
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在 response 拦截器中隐藏进度条
axios.interceptors.response.use(config =>{
  NProgress.done()
  return config
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

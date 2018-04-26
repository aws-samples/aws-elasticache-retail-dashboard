// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

// for our UI
import Buefy from 'buefy'
import 'buefy/lib/buefy.css'
import 'font-awesome/css/font-awesome.min.css'

// and websocket connection to backend
import socketio from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'

const SocketUrl = process.env.NODE_ENV === 'production' ? window.location.href : 'http://localhost:8080'
console.log(`Connecting to backend at ${SocketUrl}/socket`)

Vue.use(Buefy, { defaultIconPack: 'fa' })
Vue.use(VueSocketIO, socketio(SocketUrl, { path: '/socket' }), store)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})

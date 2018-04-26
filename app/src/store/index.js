import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isConnected: false,
    orders: {},
    sales: {}
  },

  getters: {
    isConnected: state => state.isConnected,
    // orders
    latestSales: state => state.orders.latestSales,
    orderCount: state => state.orders.orderCount,
    popularItems: state => state.orders.popularItems,
    uniqueItemCount: state => state.orders.uniqueItemCount,
    // sales
    sales: state => state.sales
  },

  mutations: {
    SOCKET_CONNECT (state) {
      state.isConnected = true
    },

    SOCKET_DISCONNECT (state) {
      state.isConnected = false
    },

    SOCKET_ORDERS (state, message) {
      state.orders = Object.assign({}, message[0])
    },

    SOCKET_SALES (state, message) {
      state.sales = Object.assign({}, message[0])
    }
  }
})

import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/*Enbled nedb*/
const electron = require('electron');
Vue.electron   = Vue.prototype.$electron = electron;
const userData = electron.remote.app.getPath('userData');
const Database = require('nedb'); 

/*Danh sách table chứa data*/
var db = {};
const tables = {
	Threads: 'Threads',
	Questions: 'Questions',
};

for(let k in tables) {
	db[k] = new Database({ filename: userData+'/db/'+ tables[k] +'.db', autoload: true });
}

Vue.db   = Vue.prototype.$db = db;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')

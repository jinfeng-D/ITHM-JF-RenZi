import Vue from "vue";

import "normalize.css/normalize.css"; // A modern alternative to CSS resets

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from "element-ui/lib/locale/lang/en"; // lang i18n

import "@/styles/index.scss"; // global css

import App from "./App";
import store from "./store";
import router from "./router";

import "@/icons"; // icon
import "@/permission"; // permission control
import * as directives from "@/directives";
import Component from "@/components";
import i18n from "@/lang";
// 时间过滤器
import * as filters from "@/filters";
import checkPermission from "@/mixin/checkPermission";
Vue.mixin(checkPermission); // 表示所有的组件都拥有了检查的方法
Vue.use(Component);
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value),
});

Object.keys(directives).forEach((key) => {
  // 注册自定义指令
  Vue.directive(key, directives[key]);
});
// set ElementUI lang to EN
Vue.use(ElementUI, { locale });
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  store,
  i18n,
  render: (h) => h(App),
});

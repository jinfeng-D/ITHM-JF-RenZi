// 权限拦截 导航守卫 路由守卫  router
import router from "@/router"; // 引入路由实例
import store from "@/store"; // 引入vuex store实例
import NProgress from "nprogress"; // 引入一份进度条插件
import "nprogress/nprogress.css"; // 引入进度条样式
// 定义的白名单
const whiteList = ["/login", "/404"]; // no redirect whitelist
router.beforeEach(async (to, from, next) => {
  NProgress.start(); //开启进度条
  // 判断有没有token
  if (store.getters.token) {
    // 如果有token, 判断是不是去登录页;
    if (to.path === "/login") {
      // 就放行,如果有token跳到登录页的时候,就直接转到主页
      next("/");
    } else {
      if (!store.getters.userId) {
        // 如果没有id这个值 才会调用 vuex的获取资料的action
        const { roles } = await store.dispatch("user/getUserInfo");
        const routes = await store.dispatch(
          "permission/filterRoutes",
          roles.menus
        );

        // 为什么要写await 因为我们想获取完资料再去放行
        router.addRoutes([
          ...routes,
          { path: "*", redirect: "/404", hidden: true },
        ]); // 添加到路由表
        next(to.path);
      }
      next(); //如果没有token 去登录页就直接放行
    }
  } else {
    //如果没有token
    if (whiteList.indexOf(to.path) > -1) {
      // 如果找到了,表示在白名单里面 放行
      // 如果没有资料了 获取资料

      next();
    } else {
      // 如果没有token,没有在白名单,就跳到登录页登录
      next("/login");
    }
  }
  // 手动强制关闭一次  为了解决 手动切换地址时  进度条的不关闭的问题
  NProgress.done();
});
// 后置守卫
router.afterEach(function () {
  NProgress.done(); // 关闭进度条
});

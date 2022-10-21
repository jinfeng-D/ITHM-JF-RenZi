import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";
// 导入路由
// 引入多个模块的规则
import approvalsRouter from "./modules/approvals";
import departmentsRouter from "./modules/departments";
import employeesRouter from "./modules/employees";
import permissionRouter from "./modules/permission";
import attendancesRouter from "./modules/attendances";
import salarysRouter from "./modules/salarys";
import settingRouter from "./modules/setting";
import socialRouter from "./modules/social";
import userRouter from "./modules/user";
// 动态路由
// 动态路由
export const asyncRoutes = [
  approvalsRouter,
  departmentsRouter,
  employeesRouter,
  permissionRouter,
  attendancesRouter,
  salarysRouter,
  settingRouter,
  socialRouter,
];
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login"),
    hidden: true,
  },

  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true,
  },

  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index"),
        meta: { title: "首页", icon: "dashboard" },
      },
    ],
  },
  {
    path: "/import",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "",
        component: () => import("@/views/import"),
      },
    ],
  },
  userRouter,
  // 404 page must be placed at the end !!!
  // { path: "*", redirect: "/404", hidden: true },
];

const createRouter = () =>
  new Router({
    mode: "history", // require service support
    base: "/hr/", //配置基础地址
    scrollBehavior: () => ({ y: 0 }),
    routes: [...constantRoutes],
  });

const router = createRouter();
// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter(); //重置路由的方法
  router.matcher = newRouter.matcher; // reset router
}

export default router;

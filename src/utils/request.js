import { Message } from "element-ui";
import store from "@/store";
import router from "@/router";
import { getTimeStamp } from "./auth";
const TimeOut = 3600; //定义超时时间 秒单位
// import axios from 'axios'
// import { MessageBox, Message } from 'element-ui'
// import store from '@/store'
// import { getToken } from '@/utils/auth'

// // create an axios instance
// const service = axios.create({
//   baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
//   // withCredentials: true, // send cookies when cross-domain requests
//   timeout: 5000 // request timeout
// })

// // request interceptor
// service.interceptors.request.use(
//   config => {
//     // do something before request is sent

//     if (store.getters.token) {
//       // let each request carry token
//       // ['X-Token'] is a custom headers key
//       // please modify it according to the actual situation
//       config.headers['X-Token'] = getToken()
//     }
//     return config
//   },
//   error => {
//     // do something with request error
//     console.log(error) // for debug
//     return Promise.reject(error)
//   }
// )

// // response interceptor
// service.interceptors.response.use(
//   /**
//    * If you want to get http information such as headers or status
//    * Please return  response => response
//   */

//   /**
//    * Determine the request status by custom code
//    * Here is just an example
//    * You can also judge the status by HTTP Status Code
//    */
//   response => {
//     const res = response.data

//     // if the custom code is not 20000, it is judged as an error.
//     if (res.code !== 20000) {
//       Message({
//         message: res.message || 'Error',
//         type: 'error',
//         duration: 5 * 1000
//       })

//       // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
//       if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
//         // to re-login
//         MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
//           confirmButtonText: 'Re-Login',
//           cancelButtonText: 'Cancel',
//           type: 'warning'
//         }).then(() => {
//           store.dispatch('user/resetToken').then(() => {
//             location.reload()
//           })
//         })
//       }
//       return Promise.reject(new Error(res.message || 'Error'))
//     } else {
//       return res
//     }
//   },
//   error => {
//     console.log('err' + error) // for debug
//     Message({
//       message: error.message,
//       type: 'error',
//       duration: 5 * 1000
//     })
//     return Promise.reject(error)
//   }
// )

// export default service
// 导出一个axios的实例  而且这个实例要有请求拦截器 响应拦截器
import axios from "axios";
const service = axios.create({
  // 如果执行 npm run dev  值为 /api 正确  /api 这个代理只是给开发环境配置的代理
  // 如果执行 npm run build 值为 /prod-api  没关系  运维应该在上线的时候 给你配置上 /prod-api的代理
  baseURL: process.env.VUE_APP_BASE_API, // 设置axios请求的基础的基础地址
  timeout: 5000, // 定义5秒超时
}); // 创建一个axios的实例
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    if (store.getters.token) {
      // 如果有token的时候,每次发起请求都去检查下时间戳是否超时
      if (IsCheckTiomeOut()) {
        // 如果是ture表示过期了
        store.dispatch("user/logout"); //登出操作
        // 再跳转到登录页
        router.push("/login");
        return Promise.reject(new Error("token超时了"));
      }
      config.headers["Authorization"] = `Bearer ${store.getters.token}`;
    }
    return config; // 必须返回配置,否则请求出错
  },
  (error) => {
    if (
      error.response &&
      error.response.data &&
      err.response.data.data === 10002
    ) {
      store.dispatch("user/logout");
      router.push("/login");
    } else {
      Message.error(error.message);
    }
    return Promise.reject(error);
  }
);
// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { success, message, data } = response.data;
    if (success) {
      return data;
    } else {
      Message.error(message);
      return Promise.reject(new Error(message));
    }
  },
  (error) => {
    Message.error(error.message);
    return Promise.reject(error);
  }
); // 响应拦截器
// 检查是否超时
function IsCheckTiomeOut() {
  let currentTiome = Date.now(); //当前的时间戳
  let timeStamp = getTimeStamp(); //存在缓存的时间戳
  return (currentTiome - timeStamp) / 1000 > TimeOut;
}
export default service; // 导出axios实例

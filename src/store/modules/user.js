import { getToken, setToken, removeToken, setTimeStamp } from "@/utils/auth";
import { login, getUserInfo, getUserDetailById } from "@/api/user";
import { resetRouter } from "@/router";
// 状态
const state = {
  token: getToken(), //初始化token
  userInfo: {},
};
// 修改状态
const mutations = {
  setToken(state, token) {
    state.token = token;
    setToken(token); //自动缓存同步
  },
  removeToken(state) {
    state.token = null;
    removeToken();
  },
  setUserInfo(state, result) {
    state.userInfo = result;
  },
  removeUserInfo(state) {
    state.userInfo = {};
  },
};
// 执行异步
const actions = {
  async login(context, data) {
    // 经过响应拦截器的处理之后 这里的result实际上就是 token
    const result = await login(data); // 实际上就是一个promise  result就是执行的结果
    // axios默认给数据加了一层data
    // 表示登录接口调用成功 也就是意味着你的用户名和密码是正确的
    // 现在有用户token
    // actions 修改state 必须通过mutations
    // context.commit('setToken', result.data.data)
    context.commit("setToken", result);
    // 将定义的时间戳放到缓存里面
    setTimeStamp();
  },
  async getUserInfo(context) {
    const result = await getUserInfo();
    const baseInfo = await getUserDetailById(result.userId);
    const baseResult = { ...result, ...baseInfo };
    context.commit("setUserInfo", baseResult);

    return baseResult;
  },
  logout(context) {
    context.commit("removeToken");
    context.commit("removeUserInfo");
    context.dispatch("tagsView/delAllViews", null, { root: true });
    resetRouter();
    context.commit("permission/setRoutes", [], { root: true });
  },
};
export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

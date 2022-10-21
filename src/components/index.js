// 负责所有的公共组件注册
import PageTools from "./PageTools";
import UploadExcel from "./UploadExcel";
import ImageUpload from "./ImageUpload";
import Print from "vue-print-nb";
import ScreenFull from "./ScreenFull";
import ThemePicker from "./ThemePicker";
import LangSelect from "./lang";
import TagsView from "./TagsView";

export default {
  install(Vue) {
    Vue.component("PageTools", PageTools);
    Vue.component("UploadExcel", UploadExcel);
    Vue.component("ImageUpload", ImageUpload);
    Vue.use(Print); //注册打印组件
    Vue.component("ScreenFull", ScreenFull); // 注册全屏组件
    Vue.component("ThemePicker", ThemePicker);
    Vue.component("LangSelect", LangSelect);
    Vue.component("TagsView", TagsView);
  },
};

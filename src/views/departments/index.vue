<template>
  <div class="app-container" v-loading="loading">
    <el-card class="tree-card">
      <tree-tools :tree-node="company" :is-root="true" @addDepts="addDepts" />
      <el-tree :data="departs" :props="defaultProps" default-expand-all>
        <tree-tools
          slot-scope="{ data }"
          :tree-node="data"
          @delDepts="getDepartments"
          @addDepts="addDepts"
          @editDepts="editDepts"
        />
      </el-tree>
    </el-card>
    <add-dept
      ref="addDept"
      :show-dialog.sync="showDialog"
      :tree-node="node"
      @addDepts="getDepartments"
    />
  </div>
</template>

<script>
import TreeTools from "./components/tree-tools.vue";
import { getDepartments } from "@/api/departments";
import { tranListToTreeData } from "@/utils";
import AddDept from "./components/add-dept.vue";
export default {
  name: "Departments",
  data() {
    return {
      company: {}, // 就是头部的数据结构
      departs: [],
      defaultProps: {
        label: "name", // 表示 从这个属性显示内容
      },
      showDialog: false,
      node: {},
      loading: false,
    };
  },
  components: {
    TreeTools,
    AddDept,
  },
  created() {
    this.getDepartments();
  },
  methods: {
    async getDepartments() {
      this.loading = true;
      const result = await getDepartments();
      this.departs = tranListToTreeData(result.depts, "");
      this.company = { name: result.companyName, manager: "负责人", id: "" };
      this.loading = false;
    },
    addDepts(node) {
      this.showDialog = true;
      this.node = node;
    },
    editDepts(node) {
      this.node = node;
      this.showDialog = true;
      this.$refs.addDept.getDepartDetail(node.id);
    },
  },
};
</script>

<style>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>


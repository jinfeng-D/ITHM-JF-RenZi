<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 靠右的按钮 -->
      <page-tools>
        <template v-slot:after>
          <el-button type="primary" size="small" @click="addPermission(1, '0')">
            添加权限
          </el-button>
        </template>
      </page-tools>
      <!-- 表格 -->
      <el-table border :data="list" row-key="id">
        <el-table-column align="center" label="名称" prop="name" />
        <el-table-column align="center" label="标识" prop="code" />
        <el-table-column align="center" label="描述" prop="description" />
        <el-table-column align="center" label="操作">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              v-if="row.type === 1"
              @click="addPermission(2, row.id)"
            >
              添加
            </el-button>
            <el-button type="text" @click="editPermission(row.id)">
              编辑
            </el-button>
            <el-button type="text" @click="delPermission(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 放置一个弹层 用来编辑新增节点 -->
    <el-dialog
      :title="`${showText}权限点`"
      :visible="showDialog"
      @close="btnCancel"
    >
      <!-- 表单 -->
      <el-form
        ref="permForm"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" style="width: 90%" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="formData.code" style="width: 90%" />
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input v-model="formData.description" style="width: 90%" />
        </el-form-item>
        <el-form-item label="开启">
          <el-switch
            v-model="formData.enVisible"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" type="primary" @click="btnOK">确定</el-button>
          <el-button size="small" @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { tranListToTreeData } from "@/utils";
import {
  updatePermission,
  addPermission,
  getPermissionDetail,
  delPermission,
  getPermissionList,
} from "@/api/permission";
export default {
  data() {
    return {
      list: [],
      formData: {
        name: "", // 名称
        code: "", // 标识
        description: "", // 描述
        type: "", // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: "", // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: "0", // 开启
      },
      rules: {
        name: [
          { required: true, message: "权限名称不能为空", trigger: "blur" },
        ],
        code: [
          { required: true, message: "权限标识不能为空", trigger: "blur" },
        ],
      },
      showDialog: false,
    };
  },
  computed: {
    showText() {
      return this.formData.id ? "编辑" : "新增";
    },
  },
  created() {
    this.getPermissionList();
  },
  methods: {
    async getPermissionList() {
      this.list = tranListToTreeData(await getPermissionList(), "0");
    },
    // 删除按钮的操作
    async delPermission(id) {
      try {
        await this.$confirm("确定要删除该数据吗");
        await delPermission(id);
        this.getPermissionList();
        this.$message.success("删除成功");
      } catch (error) {
        console.log(error);
      }
    },
    // 弹出层确定按钮的操作
    btnOK() {
      this.$refs.permForm
        .validate()
        .then(() => {
          if (this.formData.id) {
            //校验通过后,有id就是修改权限
            return updatePermission(this.formData);
          } else {
            //没有id就是添加权限
            return addPermission(this.formData);
          }
        })
        .then(() => {
          this.$message.success("新增成功");
          this.getPermissionList();
          this.showDialog = false;
        });
    },
    // 点击弹出层的取消按钮
    btnCancel() {
      this.formData = {
        name: "", // 名称
        code: "", // 标识
        description: "", // 描述
        type: "", // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: "", // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: "0", // 开启
      };
      // 只能重置为最初的状态，还可以重置表单校验结果
      this.$refs.permForm.resetFields();
      this.showDialog = false;
    },
    addPermission(type, pid) {
      this.formData.pid = pid;
      this.formData.type = type;
      this.showDialog = true;
    },
    async editPermission(id) {
      this.formData = await getPermissionDetail(id);
      this.showDialog = true;
    },
  },
};
</script>

<style>
</style>


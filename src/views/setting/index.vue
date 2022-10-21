<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <!-- 放置页签 -->
          <el-tab-pane label="角色管理">
            <!-- 新增角色按钮 -->
            <el-row style="height: 60px">
              <el-button
                icon="el-icon-plus"
                size="small"
                type="primary"
                @click="showDialog = true"
                >新增角色</el-button
              >
            </el-row>
            <!-- 表格 -->
            <el-table border="" :data="list">
              <el-table-column
                align="center"
                type="index"
                label="序号"
                width="120"
              />
              <el-table-column
                align="center"
                prop="name"
                label="名称"
                width="240"
              />
              <el-table-column align="center" prop="description" label="描述" />
              <el-table-column align="center" label="操作">
                <template slot-scope="{ row }">
                  <el-button
                    size="small"
                    type="success"
                    @click="assignPerm(row.id)"
                    >分配权限</el-button
                  >
                  <el-button
                    size="small"
                    type="primary"
                    @click="editRole(row.id)"
                    >编辑</el-button
                  >
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteRole(row.id)"
                    >删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页组件 -->
            <!-- 放置分页组件 -->
            <el-row
              type="flex"
              justify="center"
              align="middle"
              style="height: 60px"
            >
              <el-pagination
                :current-page="page.page"
                :page-size="page.pagesize"
                :total="page.total"
                layout="prev, pager, next"
                @current-change="changePage"
              />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="公司信息">
            <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
              show-icon
              :closable="false"
            />
            <el-form label-width="120px" style="margin-top: 50px">
              <el-form-item label="公司名称">
                <el-input
                  v-model="formData.name"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input
                  v-model="formData.companyAddress"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input
                  v-model="formData.mailbox"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remarks"
                  type="textarea"
                  :rows="3"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 弹出层 -->
    <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
      <el-form
        ref="roleForm"
        :model="roleForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" @click="btnCancel">取消</el-button>
          <el-button size="small" type="primary" @click="btnOK">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog
      title="分配权限"
      :visible="showPermDialog"
      @close="btnPermCancel"
    >
      <!-- 权限是一颗树 -->
      <!-- 将数据绑定到组件上 -->
      <!-- :show-checkbox="true" 是否显示复选框 -->
      <!-- check-strictly 如果为true，表示父子之间不互相关联;默认为false互相关联-->
      <!-- :default-checked-keys="selectCheck" 默认选中的节点 -->
      <!-- node-key="id" id作为唯一标识,注意前面不需要加冒号":" -->
      <el-tree
        ref="permTree"
        :data="permData"
        :props="defaultProps"
        :default-expand-all="true"
        :show-checkbox="true"
        :check-strictly="true"
        :default-checked-keys="selectCheck"
        node-key="id"
      />
      <!-- 确定 取消 -->
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnPermOK"
            >确定</el-button
          >
          <el-button size="small" @click="btnPermCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {
  getRoleList,
  getCompanyInfo,
  deleteRole,
  getRoleDetail,
  updateRole,
  addRole,
  assignPerm,
} from "@/api/setting";
import { mapGetters } from "vuex";
import { tranListToTreeData } from "@/utils";
import { getPermissionList } from "@/api/permission";
export default {
  // 组件名称
  name: "",
  // 组件参数 接收来自父组件的数据
  props: {},
  // 局部注册的组件
  components: {},
  // 组件状态值
  data() {
    return {
      list: [], //承接数组
      page: {
        page: 1, //当前页
        pagesize: 10, //每页的数量
        total: 0, // 记录总数量
      },
      formData: {},
      showDialog: false,
      // 专门接收新增或者编辑的编辑的表单数据
      roleForm: {},
      rules: {
        name: [
          { required: true, message: "角色名称不能为空", trigger: "blur" },
        ],
      },
      showPermDialog: false,
      defaultProps: {
        label: "name",
      },
      permData: [], // 专门用来接收权限数据 树形数据
      selectCheck: [], // 定义一个数组来接收 已经选中的节点
      roleId: null, // 用来记录分配角色的id
    };
  },
  // 计算属性
  computed: {
    ...mapGetters(["companyId"]),
    showTitle() {
      return this.formData.id ? "编辑角色" : "新增角色";
    },
  },
  // 侦听器
  watch: {},
  // 组件方法
  methods: {
    // 页面加载后 获取的信息显示
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page);
      this.page.total = total;
      this.list = rows;
    },
    // 公司资料获取
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId);
    },
    changePage(newPage) {
      this.page.page = newPage;
      this.getRoleList;
    },
    // 删除点击事情方法
    async deleteRole(id) {
      try {
        // 弹窗提示是否删除
        await this.$confirm("确定删除该角色吗?");
        // 调用删除接口传入服务器
        await deleteRole(id);
        // 调用获取信息方法重新渲染页面
        this.getRoleList();
        // 提示用户删除成功
        this.$message.success("删除角色成功");
      } catch (error) {
        console.log(error);
      }
    },
    // 编辑按钮点击事件的方法
    async editRole(id) {
      this.showDialog = true;
      this.roleForm = await getRoleDetail(id);
    },
    // 弹窗取消按钮事件
    btnCancel() {
      // 重置数据的目的 是在修改的时候依然能够把数据完全重置
      this.roleForm = {
        name: "",
        description: "",
      };
      // 移除校验
      this.$refs.roleForm.resetFields();
      this.showDialog = false;
    },
    // 弹窗确定按钮事件
    async btnOK() {
      try {
        // 校验
        await this.$refs.roleForm.validate();
        // 有roleForm.id就是修改,没有就是新增
        if (this.roleFrom.id) {
          // 修改
          await updateRole(this.roleFrom);
        } else {
          // 新增
          await addRole(this.roleForm);
        }
        // 重新渲染页面
        this.getRoleList();
        this.$message.success("操作成功");
        this.showDialog = false;
      } catch (error) {
        console.log(error);
      }
    },
    // 分配权限弹出层
    async assignPerm(id) {
      // 获取全部权限列表,并转换为树形数据
      this.permData = tranListToTreeData(await getPermissionList(), "0");
      this.roleId = id; // 当前点击的角色id
      const { permIds } = await getRoleDetail(id); //permIds 是当前角色所拥有的权限点数据
      this.selectCheck = permIds; //将当前角色所拥有的权限id赋值
      this.showPermDialog = true;
    },
    // 权限弹窗的确定按钮
    async btnPermOK() {
      await assignPerm({
        permIds: this.$refs.permTree.getCheckedKeys(),
        id: this.roleId,
      });
      this.$message.success("分配权限成功");
      this.showPermDialog = false;
    },
    btnPermCancel() {
      this.selectCheck = []; // 重置数据
      this.showPermDialog = false;
    },
  },
  // 以下是生命周期钩子   注：没用到的钩子请自行删除
  /**
   * 组件实例创建完成，属性已绑定，但DOM还未生成，$ el属性还不存在
   */
  created() {
    this.getRoleList();
    this.getCompanyInfo();
  },
  /**
   * el 被新创建的 vm.$ el 替换，并挂载到实例上去之后调用该钩子。
   * 如果 root 实例挂载了一个文档内元素，当 mounted 被调用时 vm.$ el 也在文档内。
   */
  mounted() {},
};
</script> 

<style scoped lang="less">
</style>
<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <span slot="before"> 共{{ page.total }}条记录 </span>
        <template #after>
          <el-button
            size="small"
            type="warning"
            @click="$router.push('/import')"
          >
            导入
          </el-button>
          <el-button size="small" type="danger" @click="exportData">
            导出
          </el-button>
          <el-button size="small" type="primary" @click="showDialog = true"
            >新增员工
          </el-button>
        </template>
      </page-tools>
      <!-- 放置表格和分页 -->
      <el-card v-loading="loading">
        <el-table border :data="list">
          <el-table-column
            label="序号"
            sortable=""
            type="index"
            align="center"
          />
          <el-table-column
            label="姓名"
            sortable=""
            prop="username"
            align="center"
          />
          <el-table-column label="头像" align="center">
            <template slot-scope="{ row }">
              <img
                v-imagerror="require('@/assets/common/bigUserHeader.png')"
                :src="row.staffPhoto"
                style="
                  border-radius: 50%;
                  width: 100px;
                  height: 100px;
                  padding: 10px;
                "
                alt=""
                @click="showQrCode(row.staffPhoto)"
              />
            </template>
          </el-table-column>

          <el-table-column
            label="工号"
            sortable=""
            prop="workNumber"
            align="center"
          />
          <el-table-column
            label="聘用形式"
            sortable=""
            prop="formOfEmployment"
            align="center"
            :formatter="formatEmployment"
          />
          <el-table-column
            label="部门"
            sortable=""
            prop="departmentName"
            align="center"
          />
          <el-table-column
            label="入职时间"
            sortable=""
            prop="timeOfEntry"
            align="center"
          >
            <template slot-scope="{ row }">
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column
            label="账户状态"
            sortable=""
            prop="enableState"
            align="center"
          >
            <template slot-scope="{ row }">
              <el-switch :value="row.enableState === 1" />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            sortable=""
            fixed="right"
            width="280"
            align="center"
          >
            <template slot-scope="{ row }">
              <el-button
                type="text"
                size="small"
                @click="$router.push(`/employees/detail/${row.id}`)"
                :disabled="!checkPermission('POINT-USER-UPDATE')"
              >
                查看
              </el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">
                角色
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="deleteEmployee(row.id)"
                >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row
          type="flex"
          justify="center"
          align="middle"
          style="height: 60px"
        >
          <el-pagination
            layout="prev, pager, next"
            :page-size="page.size"
            :current-page="page.page"
            :total="page.total"
            @current-change="changePage"
          />
        </el-row>
      </el-card>
    </div>
    <add-employee :show-dialog.sync="showDialog" />
    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <assign-role
      ref="assignRole"
      :show-role-dialog.sync="showRoleDialog"
      :user-id="userId"
    />
  </div>
</template>

<script>
import EmployeeEnum from "@/api/constant/employees";
import { getEmployeeList, delEmployee } from "@/api/employees";
import AddEmployee from "./components/add-employee";
import { formatDate } from "@/filters";
import QrCode from "qrcode";
import AssignRole from "./components/assign-role.vue";
import { thisTypeAnnotation } from "@babel/types";
export default {
  // 组件名称
  name: "employees",
  // 组件参数 接收来自父组件的数据
  props: {},
  // 局部注册的组件
  components: {
    AddEmployee,
    AssignRole,
  },
  // 组件状态值
  data() {
    return {
      loading: false,
      list: [], // 接数据的
      page: {
        page: 1, // 当前页码
        size: 10,
        total: 0, // 总数
      },
      showDialog: false,
      showCodeDialog: false,
      showRoleDialog: false,
      userId: null,
    };
  },
  // 计算属性
  computed: {},
  // 侦听器
  watch: {},
  // 组件方法
  methods: {
    // 分页显示
    changePage(newPage) {
      this.page.page = newPage;
      this.getEmployeeList();
    },
    // 页面开始加载的内容信息
    async getEmployeeList() {
      this.loading = true;
      const { total, rows } = await getEmployeeList(this.page);
      this.page.total = total;
      this.list = rows;
      this.loading = false;
    },
    // 枚举是否是正式员工
    formatEmployment(row, column, cellValue, index) {
      const obj = EmployeeEnum.hireType.find((item) => item.id === cellValue);
      return obj ? obj.value : "未知";
    },
    // 删除员工按钮的点击事件
    async deleteEmployee(id) {
      try {
        await this.$confirm("确定要删除该角色?");
        await delEmployee(id);
        this.getEmployeeList();
        this.$message.success("删除成功");
      } catch (error) {
        console.log(error);
      }
    },
    // 导出excel数据
    exportData() {
      //  做操作
      // 表头对应关系
      const headers = {
        姓名: "username",
        手机号: "mobile",
        入职日期: "timeOfEntry",
        聘用形式: "formOfEmployment",
        转正日期: "correctionTime",
        工号: "workNumber",
        部门: "departmentName",
      };
      // 懒加载
      import("@/vendor/Export2Excel").then(async (excel) => {
        // page: this.page.total 的目的是要一次性把全部的员工列表查询出来
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total,
        });
        // [["张三", "13811111111"，"2018","1", "2018", "10002"],["李思", "13911111111"，"2018","1", "2018", "10002"],...]
        const data = this.formatJson(headers, rows);
        const multiHeader = [["姓名", "主要信息", "", "", "", "", "部门"]];
        const merges = ["A1:A2", "B1:F1", "G1:G2"];
        excel.export_json_to_excel({
          header: Object.keys(headers),
          data,
          filename: "员工资料表",
          multiHeader, // 复杂表头
          merges, // 合并选项
        });
      });
    },
    formatJson(headers, rows) {
      return rows.map((item) => {
        // item是一个对象  { mobile: 132111,username: '张三'  }
        // ["手机号", "姓名", "入职日期" 。。]
        return Object.keys(headers).map((key) => {
          // 需要判断 字段
          if (
            headers[key] === "timeOfEntry" ||
            headers[key] === "correctionTime"
          ) {
            // 格式化日期
            return formatDate(item[headers[key]]);
          } else if (headers[key] === "formOfEmployment") {
            const obj = EmployeeEnum.hireType.find(
              (obj) => obj.id === item[headers[key]]
            );
            return obj ? obj.value : "未知";
          }
          return item[headers[key]];
        });
        // ["132", '张三’， ‘’，‘’，‘’d]
      });
    },
    // 二维码弹出层
    showQrCode(url) {
      if (url) {
        this.showCodeDialog = true;
        this.$nextTick(() => {
          QrCode.toCanvas(this.$refs.myCanvas, url);
        });
      } else {
        this.$message.warning("该用户还未上传头像");
      }
    },
    // 角色的点击事件
    async editRole(id) {
      this.userId = id; //props传值是异步的
      await this.$refs.assignRole.getUserDetailById(id);
      this.showRoleDialog = true;
    },
  },
  // 以下是生命周期钩子   注：没用到的钩子请自行删除
  /**
   * 组件实例创建完成，属性已绑定，但DOM还未生成，$ el属性还不存在
   */
  created() {
    this.getEmployeeList();
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
<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染耳二级权限和三级权限-->
              <el-col :span="19">
                <el-row
                  :class="['vcenter', i2 != 0 ? 'bdtop' : '']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3)"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="ShowEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="ShowSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->

    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      @close="addDialogClose"
      width="50%"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="EditDialogVisible"
      width="50%"
      @close="EditDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="addFormRules"
        ref="EditFromRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUSerInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 配置角色权限对话框 -->

    <el-dialog
      title="分配角色权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogVisibleClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightlist"
        :props="treeProps"
        ref="treeRef"
        show-checkbox
        node-key="id"
        :default-checked-keys="defkeys"
        :default-expand-all="true"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",

  data() {
    return {
      //角色列表数据
      rolelist: [],
      addDialogVisible: false,
      EditDialogVisible: false,
      setRightDialogVisible: false,
      //所有权限的数据
      rightlist: [],
      //树形控件
      treeProps: {
        label: "authName",
        children: "children",
      },
      //默认选中的id值数组
      defkeys: [],
      roleId:'',
      //添加用户的表单数据
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      //编辑时查询到的用户信息对象
      editForm: {},
      //添加表单验证的规则对象
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "角色名称的长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: false, message: "请输入角色描述", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    addUser() {
      //提交前先校验
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return;
        //无错误发起网络请求
        this.$http.post("roles", this.addForm).then((res) => {
          if (res.status != 200) {
            return this.$message.error("添加角色失败！");
          }
          //隐藏对话框
          this.addDialogVisible = false;
          //更新用户列表
          this.getRolesList();

          return this.$message.success("添加角色成功！");
        });
      });
    },
    ShowEditDialog(id) {
      //修改用户信息对话框

      this.$http.get("roles/" + id).then((res) => {
        if (res.data.meta.status != 200) {
          return this.$message.error("查询角色信息失败!");
        }
        this.editForm = res.data.data;
        this.EditDialogVisible = true;
      });
    },
    editUSerInfo() {
      //验证用户信息并提交
      //提交前先校验
      this.$refs.EditFromRef.validate((valid) => {
        if (!valid) return;
        //无错误发起网络请求
        this.$http
          .put("roles/" + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          })
          .then((res) => {
            if (res.status != 200) {
              return this.$message.error("修改角色信息失败！");
            }
            //隐藏对话框
            this.EditDialogVisible = false;
            //更新用户列表
            this.getRolesList();
            return this.$message.success("修改角色信息成功！");
          });
      });
    },
    EditDialogClosed() {
      this.$refs.EditFromRef.resetFields();
    },
    removeUserById(id) {
      //删除角色
      //先提示询问
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http.delete("roles/" + id).then((res) => {
            if (res.data.meta.status != 200) {
              return this.$message.error("删除角色失败!");
            }
            this.getRolesList();
          });

          this.$message({
            type: "success",
            message: "删除角色成功!",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //获取角色列表
    getRolesList() {
      this.$http.get("roles").then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取角色列表失败！");
        }
        this.rolelist = res.data.data;
      });
    },
    removeRightById(role, rightId) {
      //弹窗提示用户是否删除
      //删除角色
      //先提示询问
      this.$confirm("此操作将永久删除该角色权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete(`roles/${role.id}/rights/${rightId.id}`)
            .then((res) => {
              if (res.data.meta.status != 200) {
                return this.$message.error("删除角色权限失败!");
              }
              role.children = res.data.data;
              this.$message({
                type: "success",
                message: "删除角色权限成功!",
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    ShowSetRightDialog(role) {

      //保存id信息
      this.roleId = role.id

      //获取所有三级节点的权限id

      this.getLeafKeys(role, this.defkeys);

      //显示配置权限对话框
      this.setRightDialogVisible = true;

      //发送请求获取全部权限
      this.$http.get("rights/tree").then((res) => {
        if (res.data.meta.status != 200) {
          return this.$message.error("查询角色信息失败!");
        }

        this.rightlist = res.data.data;
      });
    },
    //通过递归函数获取到当前角色下所有三级权限的id
    getLeafKeys(node, arr) {
      //若该节点没有children属性，则说明为三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      //递归遍历每一行节点
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    setRightDialogVisibleClosed(){
      //关闭对话框时，清空权限id数组
      this.defkeys = []
    },
    allotRights(){

      //分配权限
      const keys = [
        //获取全选的id标识
        ...this.$refs.treeRef.getCheckedKeys(),
        //获取未全选的id标识
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')
      this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr}).then(res =>{
        console.log(res);
          if (res.data.meta.status != 200) {
          return this.$message.error("配置角色权限失败!");
        }

        //更新界面
        this.getRolesList()

        this.$message.success("配置角色权限成功！")

      })

      this.setRightDialogVisible = false
    }
  },
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
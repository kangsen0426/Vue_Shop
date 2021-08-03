<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        :closable="false"
        show-icon
        type="warning"
        title="注意：只允许为第三级分类设置相关参数!"
      ></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCate"
            :options="catelist"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            @change="ParamsHandleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handTableClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            @click="showAddDialog"
            :disabled="isBtnDisabled"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  @close="handleClosed(index, scope.row)"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="item.atttr_id"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showeditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleateCate(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            @click="showAddDialog"
            :disabled="isBtnDisabled"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->

          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
               <template slot-scope="scope">
                <el-tag
                  closable
                  @close="handleClosed(index, scope.row)"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="item.atttr_id"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showeditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleateCate(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!--添加动态参数/静态属性对话框  -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="setaddDialogVisible"
      width="50%"
      @close="AddDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormFules"
        ref="addFormRef"
        label-width="110px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setaddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑动态参数/静态属性对话框  -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="seteditDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormFules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="seteditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      inputVisible: false,
      inputValue: "",
      catelist: [],
      //级联选择框双向绑定的数据
      selectedCate: [],
      //被激活的页签的名称
      activeName: "many",
      //动态参数数据
      manyTableData: [],
      //静态属性数据,
      onlyTableData: [],
      //添加表单数据的对象
      addForm: {
        attr_name: "",
      },
      editForm: {
        attr_name: "",
      },
      setaddDialogVisible: false,
      seteditDialogVisible: false,
      addFormFules: {
        attr_name: [
          { required: true, message: "请输入名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "名称的长度在 1 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      editFormFules: {
        attr_name: [
          { required: true, message: "请输入名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "名称的长度在 1 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    isBtnDisabled() {
      //如果按钮需要被禁用，返回true反之false
      return this.selectedCate.length !== 3 ? true : false;
    },
    //当前选中的三级分类id
    cateID() {
      return this.selectedCate.length !== 3 ? null : this.selectedCate[2];
    },
    titleText() {
      return this.activeName === "many" ? "动态参数" : "静态属性";
    },
  },
  methods: {
    //获取商品分类
    getCateList() {
      this.$http.get("categories").then((res) => {
        if (res.data.meta.status != 200) {
          return this.$message.error("获取商品分类信息失败!");
        }

        this.catelist = res.data.data;
      });
    },
    ParamsHandleChange() {
      this.getParamslist();
    },
    handTableClick() {
      //tab页签
      this.getParamslist();
    },
    getParamslist() {
      if (this.selectedCate.length !== 3) {
        //说明选中的不是三级分类
        this.selectedCate = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }

      //根据所选的id获取参数
      this.$http
        .get(`categories/${this.cateID}/attributes`, {
          params: { sel: this.activeName },
        })
        .then((res) => {
          if (res.data.meta.status != 200) {
            return this.$message.error("获取参数信息失败!");
          }

          //处理一下attr_vals
          res.data.data.forEach((item) => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
            //控制文本框的显示与隐藏
            item.inputVisible = false;
            item.inputValue = "";
          });

          if (this.activeName === "many") {
            this.manyTableData = res.data.data;
          } else {
            this.onlyTableData = res.data.data;
          }
        });
    },
    showAddDialog() {
      this.setaddDialogVisible = true;
    },
    showeditDialog(id) {
      //查询当前参数的信息
      this.$http
        .get(`categories/${this.cateID}/attributes/${id}`, {
          params: { attr_sel: this.activeName },
        })
        .then((res) => {
          if (res.data.meta.status != 200) {
            return this.$message.error("获取编辑信息失败!");
          }

          this.editForm = res.data.data;
        });
      this.seteditDialogVisible = true;
    },
    AddDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    addParams() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return this.$message.error("表单数据验证错误!");
      });

      this.$http
        .post(`categories/${this.cateID}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        })
        .then((res) => {
          if (res.data.meta.status != 201) {
            return this.$message.error("添加失败!");
          }
          this.$message.success("添加成功!");
          this.getParamslist();
        });

      this.setaddDialogVisible = false;
    },
    editParams() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return this.$message.error("表单数据验证错误!");
      });
      this.$http
        .put(`categories/${this.cateID}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
        })
        .then((res) => {
          if (res.data.meta.status != 200) {
            return this.$message.error("编辑失败!");
          }
          this.$message.success("编辑成功!");
          this.getParamslist();
        });
      this.seteditDialogVisible = false;
    },
    deleateCate(id) {
      this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http
            .delete(`categories/${this.cateID}/attributes/${id}`)
            .then((res) => {
              if (res.data.meta.status != 200) {
                return this.$message.error("删除失败!");
              }
              this.$message.success("删除成功!");
              this.getParamslist();
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    handleInputConfirm(row) {
      //newTags
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }

      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      //发送请求添加标签
      this.saveAttrVals(row);
    },
    showInput(row) {
      row.inputVisible = true;
      //$nextTick 当页面被重新渲染后，执行改函数
      //自动获得焦点
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleClosed(index, row) {
      row.attr_vals.splice(index, 1);
      this.saveAttrVals(row);
    },
    saveAttrVals(row) {
      this.$http
        .put(`categories/${this.cateID}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        })
        .then((res) => {
          if (res.data.meta.status != 200) {
            return this.$message.error("修改参数失败!");
          }

          this.$message.success("修改参数成功!");
        });
    },
  },
};
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>
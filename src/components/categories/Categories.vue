<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" class="topbtn" @click="ShowCatDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <!-- 表格 -->
        <tree-table
          :data="catelist"
          :columns="columns"
          border
          show-index
          :expand-type="false"
          :selection-type="false"
        >
          <template slot="isok" slot-scope="scope">
            <i
              class="el-icon-success"
              style="color: lightgreen"
              v-if="scope.row.cat_deleted === false"
            ></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>

          <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag
              size="mini"
              v-else-if="scope.row.cat_level === 1"
              type="success"
              >二级</el-tag
            >
            <el-tag size="mini" v-else type="warning">三级</el-tag>
          </template>

          <template slot="opt" slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editCate(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleateCate(scope.row)"
              >删除</el-button
            >
          </template>
        </tree-table>

        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfon.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfon.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-row>
    </el-card>

    <!-- 添加分类对话框 -->

    <el-dialog
      title="添加分类"
      :visible.sync="setCatDialogVisible"
      @close="addCatDialogClosed"
      width="50%"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            :props="{
              checkStrictly: true,
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            @change="ParentHandleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->

    <el-dialog
      title="编辑分类"
      :visible.sync="setEditCatDialogVisible"
      @close="editCatDialogClosed"
      width="50%"
    >
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setEditCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateClosed">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Categories",
  data() {
    return {
      setCatDialogVisible: false,
      setEditCatDialogVisible: false,

      //查询条件
      queryInfon: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //分类的总条数
      total: 0,
      //商品分类的数据列表
      catelist: [],
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //表示当前定义为模板列
          type: "template",
          //表示当前使用这一模板的名称
          template: "isok",
        },
        {
          label: "排序",
          //表示当前定义为模板列
          type: "template",
          //表示当前使用这一模板的名称
          template: "order",
        },
        {
          label: "操作",
          //表示当前定义为模板列
          type: "template",
          //表示当前使用这一模板的名称
          template: "opt",
        },
      ],
      addCateForm: {
        cat_name: "",
        //父级分类id
        cat_pid: 0,
        //分类的等级，默认是一级分类
        cat_level: 0,
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "分类名称的长度在 1 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      //父级分类列表
      parentCateList: [],
      //选中的父级id数组
      selectKeys: [],
      //编辑分类名称
      editCateForm: {},
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类
    getCateList() {
      this.$http.get("categories", { params: this.queryInfon }).then((res) => {
        if (res.data.meta.status != 200) {
          return this.$message.error("获取商品分类信息失败!");
        }

        this.catelist = res.data.data.result;
        this.total = res.data.data.total;
      });
    },
    handleSizeChange(newSize) {
      //监听pagesize 的改变

      //改变当前
      this.queryInfon.pagesize = newSize;
      //发起网络请求
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      //页码改变
      this.queryInfon.pagenum = newPage;
      this.getCateList();
    },
    ShowCatDialog() {
      this.setCatDialogVisible = true;
      this.getParentCateList();
    },
    getParentCateList() {
      //获取父级分类列表数据
      this.$http.get("categories", { params: { type: 2 } }).then((res) => {
        if (res.data.meta.status != 200) {
          return this.$message.error("获取父级分类信息失败!");
        }
        this.parentCateList = res.data.data;
      });
    },
    ParentHandleChange() {
      //如果selectKeys数组的length不为0，则说明选中的父级分类
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        this.addCateForm.cat_level = this.selectKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    addCate() {
      this.$refs.addCateFormRef.validate((valid) => {
        if (!valid) return this.$message.error("表单数据验证错误!");
        this.$http.post("categories", this.addCateForm).then((res) => {
          if (res.data.meta.status != 201) {
            return this.$message.error("修改分类信息失败!");
          }

          this.$message.success("修改分类信息成功!");
          this.getCateList();
          this.setCatDialogVisible = false;
        });
      });
    },
    addCatDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    deleateCate(row) {
      this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          //发送删除请求
          this.$http.delete("categories/" + row.cat_id).then((res) => {
            if (res.data.meta.status != 200) {
              return this.$message.error("删除失败!");
            }
            this.$message({
              type: "success",
              message: "删除成功!",
            });

            this.getCateList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    editCate(row) {
      this.editCateForm = row;
      this.setEditCatDialogVisible = true;
      console.log(row);
    },
    editCateClosed() {
      //发送请求修改数据

      this.$refs.editCateFormRef.validate((valid) => {
        if (!valid) return this.$message.error("表单数据验证错误!");
        this.$http
          .put("categories/" + this.editCateForm.cat_id, {
            cat_name: this.editCateForm.cat_name,
          })
          .then((res) => {
            if (res.data.meta.status != 200) {
              return this.$message.error("编辑分类信息失败!");
            }

            this.$message.success("编辑分类信息成功!");
            this.getCateList();
            this.setEditCatDialogVisible = false;
          });
      });
    },
    editCatDialogClosed() {
      //清空表当
      this.editCateForm = {};
    },
  },
};
</script>

<style scoped>
.topbtn {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
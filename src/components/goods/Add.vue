<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        title="消息提示的文案"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 信息列表 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children',
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableList"
              :key="item.attr_id"
            >
              <!-- checkBox 盒子 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="headerObj"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="addbtn" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="提示" :visible.sync="PrevDialogVisible" width="50%">
      <img :src="previewPath" class="image" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "loadsh";

export default {
  name: "Add",
  data() {
    return {
      cateList: [],
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      manyTableList: [],
      onlyTableList: [],
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "商品名称的长度在 1 到 10 个字符",
            trigger: "blur",
          },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],

        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      PrevDialogVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    getCateList() {
      this.$http.get(`categories`).then((res) => {
        if (res.data.meta.status != 200) {
          return this.$message.error("获取商品信息失败!");
        }

        this.cateList = res.data.data;
      });
    },
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, OldActivtName) {
      if (OldActivtName === "0" && this.addForm.goods_cat.length != 3) {
        this.$message.error("请先选择商品分类！");

        return false;
      }

      if (activeName === "1") {
        //访问动态参数面板
        this.$http
          .get(`categories/${this.addForm.goods_cat[2]}/attributes`, {
            params: { sel: "many" },
          })
          .then((res) => {
            if (res.data.meta.status != 200) {
              return this.$message.error("获取商品信息失败!");
            }

            res.data.data.forEach((item) => {
              item.attr_vals =
                item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
            });

            this.manyTableList = res.data.data;
          });
      } else if (activeName === "2") {
        this.$http
          .get(`categories/${this.addForm.goods_cat[2]}/attributes`, {
            params: { sel: "only" },
          })
          .then((res) => {
            if (res.data.meta.status != 200) {
              return this.$message.error("获取商品信息失败!");
            }

            this.onlyTableList = res.data.data;
          });
      }
    },
    handlePreview(file) {
      this.previewPath = file.response.data.url;

      //打开对话框
      this.PrevDialogVisible = true;
    },
    handleRemove(file) {
      //获取要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      //在pics数组中找到这个路径把他删除

      const i = this.addForm.pics.findIndex((x) => {
        return x.pic === filePath;
      });

      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    handleSuccess(res) {
      //处理图片上传成功的函数

      //拼接得到图片信息对象
      const picInfo = {
        pic: res.data.tmp_path,
      };

      //存储对象
      this.addForm.pics.push(picInfo);
    },
    add() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单数据！");
        }

        //执行添加的业务逻辑
        const Form = _.cloneDeep(this.addForm);
        Form.goods_cat = Form.goods_cat.join(",");

        //处理动态属性
        this.manyTableList.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };

          this.addForm.attrs.push(newInfo);
          //   console.log(this.addForm.attrs);
        });

        //处理静态属性
        this.onlyTableList.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };

          this.addForm.attrs.push(newInfo);
        });

        Form.attrs = this.addForm.attrs;

        //商品名称必须是唯一的
        this.$http.post("goods", Form).then((res) => {
          if (res.data.meta.status !== 201) {
            return this.$message.error("添加失败！");
          }

          this.$message.success("添加成功！");
          //跳转
          this.$router.push("/goods");
        });
      });
    },
  },
};
</script>

<style scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.image {
  width: 100%;
}
.addbtn {
  margin-top: 15px;
}
</style>
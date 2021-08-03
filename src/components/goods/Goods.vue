<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片属兔区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            @clear="getGoodsList"
            v-model="goodsInfo.query"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="AddGoodsBtn">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          width="95px"
          label="商品价格(元)"
          prop="goods_price"
        ></el-table-column>
        <el-table-column
          width="70px"
          label="商品重量"
          prop="goods_weight"
        ></el-table-column>
        <el-table-column width="150px" label="创建时间" prop="add_time">
          <template slot-scope="scope">
            {{ getrealyDate(scope.row.add_time) }}
          </template>
        </el-table-column>
        <el-table-column width="130px" label="操作">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              type="primary"
              size="mini"
              @click="editGood(scope.row.goods_id)"
            ></el-button>
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="mini"
              @click="removeGood(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsList.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="goodsList.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Goods",
  data() {
    return {
      //商品列表
      goodsList: [],

      //商品查询信息
      goodsInfo: {
        //搜索信息
        query: "",
        //当前页码
        pagenum: 1,
        //每页显示条数
        pagesize: 10,
      },
      //商品总数
      total: 0,
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    AddGoodsBtn() {
      //添加商品按钮
      this.$router.push('/goods/add')

    },
    getGoodsList() {
      //获取商品列表
      this.$http.get("goods", { params: this.goodsInfo }).then((res) => {
        if (res.data.meta.status != 200) {
          return this.$message.error("获取商品列表失败!");
        }

        this.goodsList = res.data.data.goods;
        this.total = res.data.data.total;

        this.$message.success("获取商品列表成功!");
      });
    },
    getrealyDate(num) {
      const dt = new Date(num);

      const y = dt.getFullYear();
      const m = (dt.getMonth() + 1 + "").padStart(2, "0");
      const d = (dt.getDate() + "").padStart(2, "0");

      const hh = (dt.getHours() + "").padStart(2, "0");
      const mm = (dt.getMinutes() + "").padStart(2, "0");
      const ss = (dt.getSeconds() + "").padStart(2, "0");

      return `${y}-${m}-${d}-${hh}:${mm}:${ss}`;
    },
    handleSizeChange(newSize) {
      this.goodsInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      this.goodsInfo.pagenum = newPage;
      this.getGoodsList();
    },
    removeGood(id) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$http.delete(`goods/${id}`).then((res) => {
            if (res.data.meta.status != 200) {
              return this.$message.error("获取商品列表失败!");
            }

            this.getGoodsList();

           
          });

        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    editGood(id) {
      alert('编辑功能没做')
    },
  },
};
</script>

<style scoped>
</style>
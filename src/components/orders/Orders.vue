<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          width="95px"
          label="订单价格"
          prop="order_price"
        ></el-table-column>
        <el-table-column width="95px" label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="success"
              v-if="scope.row.order_pay == 1"
              >已付款</el-button
            >
            <el-button size="mini" type="danger" v-else>未付款</el-button>
          </template>
        </el-table-column>
        <el-table-column
          width="50px"
          label="是否发货"
          prop="is_send"
        ></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ getrealyDate(scope.row.create_time * 1000) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              type="primary"
              size="mini"
              @click="ShowBox"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="ShowProgressBox(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <el-dialog
      title="修改地址"
      :visible.sync="EditDialogVisible"
      @close="editClosed"
      width="50%"
    >
      <el-form
        :model="EditForm"
        :rules="EditFormRules"
        ref="EditFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :props="{ expandTrigger: 'hover' }"
            :options="cityData"
            v-model="EditForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="EditForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      title="物流进度"
      :visible.sync="ProgressDialogVisible"
      width="50%"
    >
      <span>接口失效,以下为demo</span>

      <br />

      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>

      <span slot="footer" class="dialog-footer">
        <el-button @click="ProgressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ProgressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";

export default {
  name: "Orders",
  data() {
    return {
      //时间线演示数据
      reverse: true,
      activities: [
        {
          content: "活动按期开始",
          timestamp: "2018-04-15",
        },
        {
          content: "通过审核",
          timestamp: "2018-04-13",
        },
        {
          content: "创建成功",
          timestamp: "2018-04-11",
        },
      ],




      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      orderList: [],
      EditDialogVisible: false,
      ProgressDialogVisible: false,
      EditForm: {
        address1: [],
        address2: "",
      },
      EditFormRules: {
        address1: [
          { required: true, message: "选择省市区县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      cityData,
      progressInfo: [],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    getOrderList() {
      this.$http.get("orders", { params: this.queryInfo }).then((res) => {
        if (res.data.meta.status != 200) {
          return this.$message.error("获取商品列表失败!");
        }

        this.orderList = res.data.data.goods;
        this.total = res.data.data.total;
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
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    ShowBox() {
      this.EditDialogVisible = true;
    },
    editClosed() {
      this.$refs.EditFormRef.resetFields();
    },
    ShowProgressBox(row) {
      this.ProgressDialogVisible = true;

      this.$http.get(`/kuaidi/`).then((res) => {
        console.log(res);
        if (res.data.meta.status != 200) {
          return this.$message.error("查询物流信息失败!");
        }

        this.progressInfo = res.data.data;
      });
    },
  },
};
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
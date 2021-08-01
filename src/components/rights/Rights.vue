<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <!-- 用户列表区域 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == 1">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level == 2">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  data() {
    return {
      //权限列表
      rightsList: [],
    };
  },
  created() {
    //获取权限数据
    this.getRightsList();
  },
  methods: {
    //获取权限数据
    getRightsList() {
      this.$http.get("rights/list").then((res) => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取权限列表失败！");
        }

        this.rightsList = res.data.data;
      });
    },
  },
};
</script>

<style>
</style>
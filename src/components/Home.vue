<template>
  <div class="home_container">
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="../assets/heima.png" alt="" />
          <span>电商管理系统后台</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <!-- 侧边区域 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <!-- 折叠功能 -->
          <div class="toggle_button" @click="togglebutton">|||</div>
          <!-- 侧边栏菜单 -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409FFF"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true"
          >
          <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
              <!-- 一级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + children.path" v-for="children in item.children" :key="children.id">
                    <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{children.authName}}</span>
              </template>
              </el-menu-item>
            </el-submenu>
           
          </el-menu>
        </el-aside>
        <!-- 主体区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      menulist:[],
      iconsObj:{
        '125':'iconfont icon-user',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao'
      },
      isCollapse:false
    };
  },
  created(){
    this.getMenuList()
  },
  methods: {
    logout() {
      //退出登入
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    getMenuList(){
      //获取所有的侧边菜单
      this.$http.get('menus').then(res =>{
       
        if(res.data.meta.status !== 200){
          return this.$message.error(res.data.meta.msg)
        }
        this.menulist = res.data.data
      
      })
    },
    togglebutton(){
      //折叠菜单
      this.isCollapse = !this.isCollapse
    },
  },
};
</script>

<style lang="less" scoped>
.home_container {
  width: 100%;
  height: 100%;
  .home-container {
    width: 100%;
    height: 100%;
  }
}
.el-header {
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  background-color: #373d41;

  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu{
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont{
  margin-right: 10px;
}
.toggle_button{
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
  background-color: #4A5064;
}
</style>
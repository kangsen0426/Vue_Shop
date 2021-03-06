import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import(/*webpackChunkName:"login_home_welcome" */'../components/Login.vue')
const Home = () => import(/*webpackChunkName:"login_home_welcome" */'../components/Home.vue')
const WelCome = () => import(/*webpackChunkName:"login_home_welcome" */'../components/WelCome.vue')
const Users = () => import(/*webpackChunkName:"user" */'../components/user/User.vue')
const Roles = () => import(/*webpackChunkName:"right_roles" */'../components/roles/Roles.vue')
const Rights = () => import(/*webpackChunkName:"right_roles" */'../components/rights/Rights.vue')
const Goods = () => import(/*webpackChunkName:"goods_params_categories" */'../components/goods/Goods.vue')
const Params = () => import(/*webpackChunkName:"goods_params_categories" */'../components/params/Params.vue')
const Categories = () => import(/*webpackChunkName:"goods_params_categories" */'../components/categories/Categories.vue')

import Add from '../components/goods/Add.vue'

import Orders from '../components/orders/Orders.vue'
import Reports from '../components/reports/Reports.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: WelCome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/goods',
        component: Goods
      },
      {
        path:'/goods/add',
        component:Add
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports
      },
    ]
  },



]

const router = new VueRouter({
  routes
})

//????????????????????????
router.beforeEach((to, from, next) => {
  //to ?????????????????????
  //from ?????????????????????????????????
  //next ??????????????????????????????
  // next????????????  next('/login) ???????????????????????????

  if (to.path == '/login') return next()

  //??????token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')

  next()

})

export default router

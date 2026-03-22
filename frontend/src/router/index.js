import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home/Home.vue'
import Login from '../views/Login/Login.vue'
import Register from '../views/Register/Register.vue'
import Logout from '../views/Logout/Logout.vue'
import Menu from '../views/Home/Menu/Menu.vue'
//import Reservas from '../views/Home/Reservas/Reservas.vue'
//import Dashboard from '../views/Dashboard/Dashboard.vue'
//import AddTicket from '../views/Dashboard/AddTicket.vue'
//import MisTickets from '../views/Dashboard/MisTickets.vue'
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/logout', component: Logout },
  { path: '/menu', component: Menu },
  //{ path: '/reservas', component: Reservas },
  //{ path: '/zonaPersonal', component: Dashboard },
  //{ path: '/addTicket', component: AddTicket },
  //{ path: '/misTickets', component: MisTickets },
] 

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
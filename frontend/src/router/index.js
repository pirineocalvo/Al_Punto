import { createRouter, createWebHistory } from 'vue-router'
import Home from '../Pages/Home/Home.vue'
import Login from '../Pages/Login/Login.vue'
import Register from '../Pages/Register/Register.vue'
import Logout from '../Pages/Logout/Logout.vue'
import Menu from '../Pages/Home/Menu/Menu.vue'
//import Reservas from '../Pages/Home/Reservas/Reservas.vue'
//import Dashboard from '../Pages/Dashboard/Dashboard.vue'
//import AddTicket from '../Pages/Dashboard/AddTicket.vue'
//import MisTickets from '../Pages/Dashboard/MisTickets.vue'
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
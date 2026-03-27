import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home/Home.vue'
import Login from '../views/Login/Login.vue'
import Register from '../views/Register/Register.vue'
import Logout from '../views/Logout/Logout.vue'
import Menu from '../views/Home/Menu/Menu.vue'
import Reservation from '@/views/Reservation/Reservation.vue'
import Dashboard from '../views/Dashboard/Dashboard.vue'
import MisTickets from '@/views/Dashboard/Tickets/ListarTickets/MisTickets.vue'
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/logout', component: Logout },
  { path: '/menu', component: Menu },
  { path: '/reservas', component: Reservation },
  { path: '/zonaPersonal', component: Dashboard },
  { path: '/misTickets', component: MisTickets },
] 

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
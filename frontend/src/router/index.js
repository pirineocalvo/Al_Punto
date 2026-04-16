import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home/Home.vue'
import Login from '../views/Login/Login.vue'
import Register from '../views/Register/Register.vue'
import Logout from '../views/Logout/Logout.vue'
import Menu from '../views/Home/Menu/Menu.vue'
import Reservation from '@/views/Reservation/Reservation.vue'
import Dashboard from '../views/Dashboard/Dashboard.vue'
import AgregarTickets from '@/views/Dashboard/Tickets/AgregarTickets/AgregarTickets.vue'
import ListarTickets from '@/views/Dashboard/Tickets/ListarTickets/ListarTickets.vue'
import Historial from '@/views/Dashboard/historial/Historial.vue'
import RealizarPedido from '../views/Dashboard/RealizarPedido/RealizarPedido.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/logout', component: Logout },
  { path: '/menu', component: Menu },
  {
    path: '/reservas',
    component: Reservation,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('loginUserToken'); // 👈 corregido
      if (token) {
        next()
      } else {
        next('/login')
      }
    }
  },
  { path: '/zonaPersonal', component: Dashboard },
  { path: '/agregarTickets', component: AgregarTickets },
  { path: '/listarTickets', component: ListarTickets },
  { path: '/realizarPedido', component: RealizarPedido },
  { path: '/historial', component: Historial },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
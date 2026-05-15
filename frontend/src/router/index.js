import { createRouter, createWebHistory } from 'vue-router'
import { userInfo } from '@/Services/api'
import { ACCESS_LEVELS } from '@/composables/useAuth'

// ─── Rutas ───────────────────────────────────────────────────────────────────
const routes = [

  // ── Rutas públicas ────────────────────────────────────
  {
    path: '/',
    component: () => import('@/views/Home/Home.vue'),
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
  },
  {
    path: '/register',
    component: () => import('@/views/Register/Register.vue'),
  },
  {
    path: '/logout',
    component: () => import('@/views/Logout/Logout.vue'),
  },
  {
    path: '/menu',
    component: () => import('@/views/Home/Menu/Menu.vue'),
  },
  {
    path: '/noAutorizado',
    component: () => import('@/views/Dashboard/Administracion/NoAutorizado.vue'),
  },

  // ── Rutas protegidas: cualquier usuario autenticado ───────────────────────
  {
    path: '/reservas',
    component: () => import('@/views/Reservation/Reservation.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/zonaPersonal',
    component: () => import('@/views/Dashboard/Dashboard.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/historial',
    component: () => import('@/views/Dashboard/historial/Historial.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/realizarPedido',
    component: () => import('@/views/Dashboard/RealizarPedido/RealizarPedido.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/marketplace',
    component: () => import('@/views/Dashboard/marketplace/Marketplace.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/reviews',
    component: () => import('@/views/Dashboard/Review/Review.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/listarTickets',
    component: () => import('@/views/Dashboard/Tickets/ListarTickets/ListarTickets.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/agregarTickets',
    component: () => import('@/views/Dashboard/Tickets/AgregarTickets/AgregarTickets.vue'),
    meta: { requiereAut: true },
  },

  // ── Rutas protegidas: empleados y administradores (nivel >= 3) ─────────────────
  {
    path: '/gestionarUsuarios',
    component: () => import('@/views/Dashboard/Administracion/GestionarUsuarios/GestionUsuarios.vue'),
    meta: { requiereAut: true, minAccessLevel: ACCESS_LEVELS.EMPLEADO },
  },

  // ── Rutas protegidas: solo administradores (nivel = 5) ────────────────────
  {
    path: '/gestionarMesas',
    component: () => import('@/views/Dashboard/Administracion/GestionarMesas/GestionarMesas.vue'),
    meta: { requiereAut: true, minAccessLevel: ACCESS_LEVELS.ADMIN },
  },
]

//web history mejora la navegacion guardando por donde se mueve o por donde queria ir el usuario
const router = createRouter({
  history: createWebHistory(),
  routes,
})

let rutaUsuarioCacheada = null;  

router.beforeEach(async (to) => {

  if (!to.meta.requiereAut) return true;

  const token = localStorage.getItem('loginUserToken');
  if (!token) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.minAccessLevel) {
    try {
      if (!rutaUsuarioCacheada) {
        rutaUsuarioCacheada = await userInfo();
      }

      if (rutaUsuarioCacheada.access_level < to.meta.minAccessLevel) {
        return { path: '/noAutorizado' };
      }
    } catch {
      rutaUsuarioCacheada = null;
      localStorage.removeItem('loginUserToken');
      return { path: '/login', query: { redirect: to.fullPath } };
    }
  }

  return true;
})

export const clearRouterUserCache = () => {
  rutaUsuarioCacheada = null;
}

export default router;
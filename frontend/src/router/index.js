import { createRouter, createWebHistory } from 'vue-router'
import { informacionUsuario } from '@/services/usuariosEndpoint.js'
import { ACCESS_LEVELS } from '@/composables/useAuth.js'

// ─── Rutas ───────────────────────────────────────────────────────────────────
const routes = [

  // ── Rutas públicas ────────────────────────────────────
  {
    path: '/',
    component: () => import('@/views/inicio/Inicio.vue'),
  },
  {
    path: '/iniciarSesion',
    component: () => import('@/views/iniciarSesion/iniciarSesion.vue'),
  },
  {
    path: '/registrarse',
    component: () => import('@/views/registrarse/Registrarse.vue'),
  },
  {
    path: '/cerrarSesion',
    component: () => import('@/views/cerrarSesion/CerrarSesion.vue'),
  },
  {
    path: '/menu',
    component: () => import('@/views/inicio/menu/Menu.vue'),
  },
  {
    path: '/noAutorizado',
    component: () => import('@/views/zonaPersonal/administracion/NoAutorizado.vue'),
  },
  {
    path: '/checkin',
    component: () => import('@/views/zonaPersonal/QrCheck.vue'),
  },

  // ── Rutas protegidas: cualquier usuario autenticado ───────────────────────
  {
    path: '/reservas',
    component: () => import('@/views/reservas/Reservas.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/zonaPersonal',
    component: () => import('@/views/zonaPersonal/ZonaPersonal.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/historial',
    component: () => import('@/views/zonaPersonal/historial/Historial.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/realizarPedido',
    component: () => import('@/views/zonaPersonal/realizarPedido/RealizarPedido.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/marketplace',
    component: () => import('@/views/zonaPersonal/marketplace/Marketplace.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/comentarios',
    component: () => import('@/views/zonaPersonal/comentarios/Comentarios.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/listarTickets',
    component: () => import('@/views/zonaPersonal/tickets/listarTickets/ListarTickets.vue'),
    meta: { requiereAut: true },
  },
  {
    path: '/agregarTickets',
    component: () => import('@/views/zonaPersonal/tickets/agregarTickets/AgregarTickets.vue'),
    meta: { requiereAut: true },
  },

  // ── Rutas protegidas: empleados y administradores (nivel >= 3) ─────────────────
  {
    path: '/gestionarUsuarios',
    component: () => import('@/views/zonaPersonal/administracion/gestionarUsuarios/GestionUsuarios.vue'),
    meta: { requiereAut: true, minAccessLevel: ACCESS_LEVELS.EMPLEADO },
  },

  // ── Rutas protegidas: solo administradores (nivel = 5) ────────────────────
  {
    path: '/gestionarMesas',
    component: () => import('@/views/zonaPersonal/administracion/gestionarMesas/GestionarMesas.vue'),
    meta: { requiereAut: true, minAccessLevel: ACCESS_LEVELS.ADMIN },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

let rutaUsuarioCacheada = null;

router.beforeEach(async (to) => {

  if (!to.meta.requiereAut) return true;

  const token = localStorage.getItem('loginUserToken');
  if (!token) {
    return { path: '/iniciarSesion', query: { redirect: to.fullPath } };
  }

  if (to.meta.minAccessLevel) {
    try {
      if (!rutaUsuarioCacheada) {
        rutaUsuarioCacheada = await informacionUsuario();
      }

      if (rutaUsuarioCacheada.access_level < to.meta.minAccessLevel) {
        return { path: '/noAutorizado' };
      }
    } catch {
      rutaUsuarioCacheada = null;
      localStorage.removeItem('loginUserToken');
      return { path: '/iniciarSesion', query: { redirect: to.fullPath } };
    }
  }

  return true;
})

export const clearRouterUserCache = () => {
  rutaUsuarioCacheada = null;
}

export default router;
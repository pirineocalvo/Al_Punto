import { ref } from 'vue'
    const sidebarAbierto = ref(false);
export function funcinalidadSidebar() {

    const cambiarEstadoSidebar = () => {

        sidebarAbierto.value = !sidebarAbierto.value;
    }

    return {cambiarEstadoSidebar, sidebarAbierto};
}
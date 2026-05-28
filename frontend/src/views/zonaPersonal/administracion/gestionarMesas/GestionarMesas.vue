<script setup>
import { ref, watch } from 'vue';
import { crearMesa, todasLasMesas, actualizarMesa, desactivarMesa } from '../../../../services/mesasEndpoint';
import { obtenerTodasLasReservasAdmin } from '../../../../services/reservasEndpoint';
import CabeceraZonaPersonal from '@/components/componenteDashboard/CabeceraZonaPersonal.vue';
import { notification, message } from 'ant-design-vue';
import PiePaginaPrincipal from '@/components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import Sidebar from '../../../../components/componenteDashboard/Sidebar.vue';
import { useAuth, ACCESS_LEVELS } from '@/composables/useAuth';

const cargado = ref(false);
const { user, usuarioListo } = useAuth({ minAccessLevel: ACCESS_LEVELS.ADMIN });

const tabActiva = ref('crear');
const mesas = ref([]);

const formNuevaMesa = ref({ name: '', n_ocupantes: null });
const cargandoCrear = ref(false);

const mesaSeleccionadaId = ref(null);
const formActualizarMesa = ref({ name: '', n_ocupantes: null });
const cargandoActualizar = ref(false);

const mesaEliminarId = ref(null);
const cargandoEliminar = ref(false);

let mensajeConfirmarEliminar = ref('¿Seguro que desea eliminar esta mesa?');

async function cargarMesas() {
    try {
        mesas.value = await todasLasMesas();
    } catch (err) {
        message.error('Error al cargar las mesas');
    } finally {
        cargado.value = true;
    }
}

watch(usuarioListo, () => {
    cargarMesas();
}, { immediate: true });

function onSeleccionarMesa(id) {
    const mesa = mesas.value.find(m => m.id === id);
    if (mesa) {
        formActualizarMesa.value = {
            name: mesa.name,
            n_ocupantes: mesa.n_ocupantes
        };
    }
}

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

async function nuevaMesa() {
    if (!formNuevaMesa.value.name.trim()) {
        generarNotificacion('warning', 'Campo requerido', 'El nombre de la mesa es obligatorio.');
        return;
    }
    if (!formNuevaMesa.value.n_ocupantes || formNuevaMesa.value.n_ocupantes < 1) {
        generarNotificacion('warning', 'Campo inválido', 'El número de ocupantes debe ser al menos 1.');
        return;
    }

    cargandoCrear.value = true;
    try {
        await crearMesa({
            name: formNuevaMesa.value.name.trim(),
            n_ocupantes: formNuevaMesa.value.n_ocupantes
        });
        generarNotificacion('success', 'Mesa creada', 'Mesa creada correctamente.');
        formNuevaMesa.value = { name: '', n_ocupantes: null };
        await cargarMesas();
    } catch (error) {
        generarNotificacion('error', 'Error al crear', 'No se pudo procesar la creación de la mesa.');
    } finally {
        cargandoCrear.value = false;
    }
}

async function actualizarUnaMesaExistente() {
    if (!mesaSeleccionadaId.value) {
        generarNotificacion('warning', 'Sin selección', 'Selecciona una mesa primero.');
        return;
    }
    if (!formActualizarMesa.value.name.trim()) {
        generarNotificacion('warning', 'Campo requerido', 'El nombre de la mesa es obligatorio.');
        return;
    }
    if (!formActualizarMesa.value.n_ocupantes || formActualizarMesa.value.n_ocupantes < 1) {
        generarNotificacion('warning', 'Campo inválido', 'El número de ocupantes debe ser al menos 1.');
        return;
    }

    const mesa = mesas.value.find(m => m.id === mesaSeleccionadaId.value);

    cargandoActualizar.value = true;
    try {
        await actualizarMesa(mesaSeleccionadaId.value, {
            name: formActualizarMesa.value.name.trim(),
            n_ocupantes: formActualizarMesa.value.n_ocupantes,
            activo: mesa ? mesa.activo : 1,
        });
        await cargarMesas();
        generarNotificacion('success', 'Mesa actualizada', 'Los cambios se guardaron correctamente.');
        mesaSeleccionadaId.value = null;
        formActualizarMesa.value = { name: '', n_ocupantes: null };
    } catch (error) {
        generarNotificacion('error', 'Error al actualizar', 'Hubo un problema al modificar los datos de la mesa.');
    } finally {
        cargandoActualizar.value = false;
    }
}

async function eliminarMesa() {
    if (!mesaEliminarId.value) {
        generarNotificacion('warning', 'Sin selección', 'Por favor, selecciona una mesa.');
        return;
    }

    const reservas = await obtenerTodasLasReservasAdmin();
    const mesaUtilizada = reservas.reservations.some(res => res.id_mesa == mesaEliminarId.value);
    
    if (mesaUtilizada) {
        generarNotificacion('warning', 'Mesa ocupada', 'Por favor antes de eliminar la mesa cancele las reservas pendientes.');
        return;
    }

    cargandoEliminar.value = true;
    try {
        await desactivarMesa(mesaEliminarId.value);
        generarNotificacion('success', 'Mesa eliminada', 'La mesa se ha desactivado del sistema.');
        mesaEliminarId.value = null;
        await cargarMesas();
        mensajeConfirmarEliminar.value = "¿Seguro que desea eliminar esta mesa?";
    } catch (error) {
        generarNotificacion('error', 'Error al eliminar', 'Hubo un problema al intentar dar de baja la mesa.');
    } finally {
        cargandoEliminar.value = false;
    }
}

async function conustarSiMesaOcupada(){
    try {
        const reservas = await obtenerTodasLasReservasAdmin();
        
            const mesaUtilizada = reservas.reservations.some(res => res.id_mesa == mesaEliminarId.value);
            
            if(mesaUtilizada){
                mensajeConfirmarEliminar.value = "La mesa contiene una o mas reservas por confirmar, ¿Está seguro que desea eliminarla?";
            }else{
                mensajeConfirmarEliminar.value = "¿Seguro que desea eliminar esta mesa?";
            }
    } catch (error) {
        message.error('Error al confirmar si la mesa contiene reservas');
    }

}
</script>

<template>
    <a-layout>
        <CabeceraZonaPersonal :user="user" />
        <a-layout class="dashboardMainLayout">
            <Sidebar />
            <a-flex v-if="!cargado" vertical align="center" justify="center" class="centrarSpin">
                <a-spin size="large" />
                <a-typography-text type="secondary">Cargando productos...</a-typography-text>
            </a-flex>
            <a-layout-content v-else class="colocarContenedorPrincipalDashBoard">
                <a-divider orientation="left">
                    <a-typography-title :level="2">Gestor Mesas</a-typography-title>
                </a-divider>
                <a-tabs v-model:activeKey="tabActiva">
                    <a-tab-pane key="crear" tab="Crear mesa">
                        <a-card>
                            <a-form layout="vertical" @submit.prevent="nuevaMesa">
                                <a-form-item label="Nombre de la mesa">
                                    <a-input v-model:value="formNuevaMesa.name" placeholder="Ej: Mesa 1, Terraza A..."
                                        :maxlength="50" allow-clear />
                                </a-form-item>
                                <a-form-item label="Número de ocupantes">
                                    <a-input-number v-model:value="formNuevaMesa.n_ocupantes" :min="1" :max="999"
                                        placeholder="Ej: 4" class="todoElAncho" />
                                </a-form-item>
                                <a-button type="primary" html-type="submit" :loading="cargandoCrear" block>Crear
                                    mesa</a-button>
                            </a-form>
                        </a-card>
                    </a-tab-pane>

                    <a-tab-pane key="actualizar" tab="Actualizar mesa">
                        <a-card>
                            <a-form layout="vertical" @submit.prevent="actualizarUnaMesaExistente">
                                <a-form-item label="Selecciona una mesa">
                                    <a-select v-model:value="mesaSeleccionadaId" placeholder="Elige una mesa..."
                                        :loading="!cargado" class="todoElAncho" @change="onSeleccionarMesa">
                                        <a-select-option v-for="mesa in mesas.filter(m => m.activo)" :key="mesa.id"
                                            :value="mesa.id">
                                            {{ mesa.name }}
                                        </a-select-option>
                                    </a-select>
                                </a-form-item>
                                <a-form-item label="Nombre de la mesa">
                                    <a-input v-model:value="formActualizarMesa.name" :maxlength="50"
                                        :disabled="!mesaSeleccionadaId" allow-clear />
                                </a-form-item>
                                <a-form-item label="Número de ocupantes">
                                    <a-input-number v-model:value="formActualizarMesa.n_ocupantes" :min="1" :max="999"
                                        :disabled="!mesaSeleccionadaId" class="todoElAncho" />
                                </a-form-item>
                                <a-button type="primary" html-type="submit" :loading="cargandoActualizar"
                                    :disabled="!mesaSeleccionadaId" block>
                                    Actualizar mesa
                                </a-button>
                            </a-form>
                        </a-card>
                    </a-tab-pane>

                    <a-tab-pane key="eliminar" tab="Eliminar mesa">
                        <a-card>
                            <a-form layout="vertical">
                                <a-form-item label="Selecciona una mesa">
                                    <a-select v-model:value="mesaEliminarId" placeholder="Elige una mesa..."
                                        :loading="!cargado" class="todoElAncho">
                                        <a-select-option v-for="mesa in mesas.filter(m => m.activo)" :key="mesa.id"
                                            :value="mesa.id">
                                            {{ mesa.name }}
                                        </a-select-option>
                                    </a-select>
                                </a-form-item>
                                <a-popconfirm :title="mensajeConfirmarEliminar" ok-text="Sí" cancel-text="No"
                                    @confirm="eliminarMesa"  :disabled="!mesaEliminarId">
                                <a-button type="primary" html-type="submit" :loading="cargandoEliminar"
                                    :disabled="!mesaEliminarId" block @click="conustarSiMesaOcupada()">
                                    Eliminar mesa
                                </a-button>
                                </a-popconfirm>

                            </a-form>
                        </a-card>
                    </a-tab-pane>
                </a-tabs>
            </a-layout-content>
        </a-layout>
        <PiePaginaPrincipal />
    </a-layout>
</template>

<style scoped>
.seccion-mesas {
    padding: 24px;
    max-width: 480px;
}

.seccion-titulo {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--color-texto-oscuro);
}

.card-formulario {
    background: var(--color-fondo-blanco);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-titulo {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(v);
}

.todoElAncho {
    width: 100%;
}
</style>
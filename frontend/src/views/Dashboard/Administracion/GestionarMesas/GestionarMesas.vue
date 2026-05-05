<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userInfo, crearMesa, todasLasMesas, actualizarMesa, desactivarMesa } from '../../../../Services/api';
import HeaderDashboard from '@/Components/componenteDashboard/HeaderDashboard.vue';
import Footer from '@/Components/cabeceraYpiePrincipal/Footer.vue';
import Sidebar from '../../../../Components/componenteDashboard/Sidebar.vue';

const router = useRouter();
const user = ref(null);
const collapsed = ref(false);

const tabActiva = ref('crear');

const mesas = ref([]);
const cargandoMesas = ref(false);

const formNuevaMesa = ref({ name: '', n_ocupantes: null });
const cargandoCrear = ref(false);
const mensajeCrear = ref(null);

const mesaSeleccionadaId = ref(null);
const formActualizarMesa = ref({ name: '', n_ocupantes: null });
const cargandoActualizar = ref(false);
const mensajeActualizar = ref(null);

const mesaEliminarId = ref(null);
const cargandoEliminar = ref(false);
const mensajeEliminar = ref(null);

const cargarMesas = async () => {
    cargandoMesas.value = true;
    try {
        mesas.value = await todasLasMesas();
    } finally {
        cargandoMesas.value = false;
    }
};

const onSeleccionarMesa = (id) => {
    const mesa = mesas.value.find(m => m.id === id);
    if (mesa) formActualizarMesa.value = { name: mesa.name, n_ocupantes: mesa.n_ocupantes };
};

onMounted(async () => {
    const token = localStorage.getItem('loginUserToken');
    if (!token) { router.push('/login'); return; }
    try {
        user.value = await userInfo();
        await cargarMesas();
    } catch {
        router.push('/login');
    }
});

const handleCrearMesa = async () => {
    mensajeCrear.value = null;
    if (!formNuevaMesa.value.name.trim()) {
        mensajeCrear.value = { tipo: 'error', texto: 'El nombre de la mesa es obligatorio.' };
        return;
    }
    if (!formNuevaMesa.value.n_ocupantes || formNuevaMesa.value.n_ocupantes < 1) {
        mensajeCrear.value = { tipo: 'error', texto: 'El número de ocupantes debe ser al menos 1.' };
        return;
    }
    cargandoCrear.value = true;
    try {
        await crearMesa({ name: formNuevaMesa.value.name.trim(), n_ocupantes: formNuevaMesa.value.n_ocupantes });
        mensajeCrear.value = { tipo: 'success', texto: 'Mesa creada correctamente.' };
        formNuevaMesa.value = { name: '', n_ocupantes: null };
        await cargarMesas();
    } catch (error) {
        mensajeCrear.value = { tipo: 'error', texto: error?.response?.data?.error || 'Error al crear la mesa.' };
    } finally {
        cargandoCrear.value = false;
    }
};

const handleActualizarMesa = async () => {
    mensajeActualizar.value = null;
    if (!mesaSeleccionadaId.value) {
        mensajeActualizar.value = { tipo: 'error', texto: 'Selecciona una mesa.' };
        return;
    }
    if (!formActualizarMesa.value.name.trim()) {
        mensajeActualizar.value = { tipo: 'error', texto: 'El nombre de la mesa es obligatorio.' };
        return;
    }
    if (!formActualizarMesa.value.n_ocupantes || formActualizarMesa.value.n_ocupantes < 1) {
        mensajeActualizar.value = { tipo: 'error', texto: 'El número de ocupantes debe ser al menos 1.' };
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
        mensajeActualizar.value = { tipo: 'success', texto: 'Mesa actualizada correctamente.' };
        await cargarMesas();
    } catch (error) {
        mensajeActualizar.value = { tipo: 'error', texto: error?.response?.data?.error || 'Error al actualizar la mesa.' };
    } finally {
        cargandoActualizar.value = false;
    }
};

const handleEliminarMesa = async () => {
    mensajeEliminar.value = null;
    if (!mesaEliminarId.value) {
        mensajeEliminar.value = { tipo: 'error', texto: 'Selecciona una mesa.' };
        return;
    }
    cargandoEliminar.value = true;
    try {
        await desactivarMesa(mesaEliminarId.value);
        mensajeEliminar.value = { tipo: 'success', texto: 'Mesa eliminada correctamente.' };
        mesaEliminarId.value = null;
        await cargarMesas();
    } catch (error) {
        mensajeEliminar.value = { tipo: 'error', texto: error?.response?.data?.error || 'Error al eliminar la mesa.' };
    } finally {
        cargandoEliminar.value = false;
    }
};
</script>

<template>
    <a-layout>
        <HeaderDashboard :user="user" />

        <a-layout class="dashboardMainLayout">
            <Sidebar :collapsed="collapsed" />

            <a-tabs v-model:activeKey="tabActiva" class="colocarAcordeon">

                <a-tab-pane key="crear" tab="Crear mesa">
                    <a-card>

                        <a-form layout="vertical" @submit.prevent="handleCrearMesa">
                            <a-form-item label="Nombre de la mesa">
                                <a-input v-model:value="formNuevaMesa.name" placeholder="Ej: Mesa 1, Terraza A..."
                                    :maxlength="50" allow-clear />
                            </a-form-item>
                            <a-form-item label="Número de ocupantes">
                                <a-input-number v-model:value="formNuevaMesa.n_ocupantes" :min="1" :max="999"
                                    placeholder="Ej: 4" style="width: 100%" />
                            </a-form-item>
                            <a-alert v-if="mensajeCrear" :type="mensajeCrear.tipo" :message="mensajeCrear.texto"
                                show-icon closable style="margin-bottom: 16px" @close="mensajeCrear = null" />
                            <a-button type="primary" html-type="submit" :loading="cargandoCrear" block>
                                Crear mesa
                            </a-button>
                        </a-form>
                    </a-card>
                </a-tab-pane>

                <a-tab-pane key="actualizar" tab="Actualizar mesa">
                    <a-card>
                        <a-form layout="vertical" @submit.prevent="handleActualizarMesa">
                            <a-form-item label="Selecciona una mesa">
                                <a-select v-model:value="mesaSeleccionadaId" placeholder="Elige una mesa..."
                                    :loading="cargandoMesas" style="width: 100%" @change="onSeleccionarMesa">
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
                                    :disabled="!mesaSeleccionadaId" style="width: 100%" />
                            </a-form-item>
                            <a-alert v-if="mensajeActualizar" :type="mensajeActualizar.tipo"
                                :message="mensajeActualizar.texto" show-icon closable style="margin-bottom: 16px"
                                @close="mensajeActualizar = null" />
                            <a-button type="primary" html-type="submit" :loading="cargandoActualizar"
                                :disabled="!mesaSeleccionadaId" block>
                                Actualizar mesa
                            </a-button>
                        </a-form>
                    </a-card>
                </a-tab-pane>

                <a-tab-pane key="eliminar" tab="Eliminar mesa">
                    <a-card>
                        <a-form layout="vertical" @submit.prevent="handleEliminarMesa">
                            <a-form-item label="Selecciona una mesa">
                                <a-select v-model:value="mesaEliminarId" placeholder="Elige una mesa..."
                                    :loading="cargandoMesas" style="width: 100%">
                                    <a-select-option v-for="mesa in mesas.filter(m => m.activo)" :key="mesa.id"
                                        :value="mesa.id">
                                        {{ mesa.name }}
                                    </a-select-option>
                                </a-select>
                            </a-form-item>
                            <a-alert v-if="mensajeEliminar" :type="mensajeEliminar.tipo"
                                :message="mensajeEliminar.texto" show-icon closable style="margin-bottom: 16px"
                                @close="mensajeEliminar = null" />
                            <a-button type="primary" danger html-type="submit" :loading="cargandoEliminar"
                                :disabled="!mesaEliminarId" block>
                                Eliminar mesa
                            </a-button>
                        </a-form>
                    </a-card>
                </a-tab-pane>

            </a-tabs>
        </a-layout>

        <Footer />
    </a-layout>
</template>
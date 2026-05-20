<script setup>
import CabeceraPrincipal from '../../components/cabeceraYpiePrincipal/CabeceraPrincipal.vue';
import PiePaginaPrincipal from '../../components/cabeceraYpiePrincipal/PiePaginaPrincipal.vue';
import { nuevaReserva, misReservas, vincularMesaReserva } from '../../services/reservasEndpoint';
import { getDisponibilidadMes, todasLasMesasLibresPorDia } from '../../services/mesasEndpoint';
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { message, notification } from 'ant-design-vue';

const fechasCalendario = ref(dayjs());
const diasBloqueados = ref({});
const fechaSeleccionada = ref('');
const mesasDia = ref([]);
const horario = ref([]);

const cargandoDatos = ref(false);
const cargandoReserva = ref(false);

const datosForm = ref({
    comensales: null,
    mesa: null,
    hora: null
});

const opcionesOcupantes = ref([]);

function calcularCapacidadMesas() {
    const filtrarOcupantes = new Set();
    mesasDia.value.forEach(ocu => {
        const estaGuardado = filtrarOcupantes.has(ocu);
        if (!estaGuardado) {
            filtrarOcupantes.add(ocu.n_ocupantes);
        }
    });
    opcionesOcupantes.value = [...filtrarOcupantes];
    completarListaCapacidadMesas();
}

function completarListaCapacidadMesas() {
    opcionesOcupantes.value.sort((a, b) => a - b);

    const min = 1;
    const max = opcionesOcupantes.value[opcionesOcupantes.value.length - 1];

    opcionesOcupantes.value = Array.from({ length: max }, (_, i) => min + i);
}

onMounted(async () => {
    try {
        await cargarMes(fechasCalendario.value.year(), fechasCalendario.value.month() + 1);
    } catch (error) {
        message.error('Error al cargar el mes');
    }
});

function generarNotificacion(tipo, titulo, texto) {
    notification[tipo]({
        message: titulo,
        description: texto,
        placement: 'topRight'
    });
}

async function onSelect(date) {
    datosForm.value.comensales = null;
    datosForm.value.mesa = null;
    datosForm.value.hora = null;
    horario.value = [];

    cargandoDatos.value = true;
    try {
        const fecha = date.format('YYYY-MM-DD');
        mesasDia.value = await todasLasMesasLibresPorDia(fecha, null);

        calcularCapacidadMesas();
        fechaSeleccionada.value = fecha;
    } catch (error) {
        message.error('Error al cargar las mesas');
    } finally {
        cargandoDatos.value = false;
    }
}

async function onPanelChange(value) {
    fechasCalendario.value = value;
    try {
        await cargarMes(value.year(), value.month() + 1);
    } catch (error) {
        message.error('Error al cargar el mes');
    }
}

async function cargarMes(year, month) {
    try {
        diasBloqueados.value = await getDisponibilidadMes(year, month);
    } catch (error) {
        message.error('Error al cargar disponibilidad del mes');
    }
}

function disabledDate(current) {
    const fecha = current.format('YYYY-MM-DD');
    return (diasBloqueados.value[fecha] === true || current.isBefore(dayjs(), 'day'));
}

async function alCambiarOcupantes() {
    const fecha = fechaSeleccionada.value;
    datosForm.value.mesa = null;
    datosForm.value.hora = null;
    horario.value = [];

    cargandoDatos.value = true;
    try {
        let mesasQueVienenDelBack = await todasLasMesasLibresPorDia(fecha, datosForm.value.comensales);
        const todasLasReservas = await misReservas();

        mesasDia.value = mesasQueVienenDelBack.map(mesa => {
            const reservasDeEstaMesa = todasLasReservas.filter(res => res.id_mesa === mesa.id && res.reserve_date === fecha && res.status !== 'cancel');
            const horasOcupadas = reservasDeEstaMesa.map(res => res.reserve_hour);

            return {
                ...mesa,
                horasDisponibles: mesa.horasDisponibles.filter(h => !horasOcupadas.includes(h))
            };
        }).filter(mesa => mesa.horasDisponibles.length > 0);
    } catch (error) {
        message.error('Error al cargar los datos');
    } finally {
        cargandoDatos.value = false;
    }
}

function filtrarHorario() {
    horario.value = mesasDia.value.find((mesa) => mesa.id == datosForm.value.mesa).horasDisponibles;
    datosForm.value.hora = null;
}

async function guardarReserva() {
    if (!dayjs(fechaSeleccionada.value).isBefore(dayjs(), 'day')) {
        const dato = {
            ...datosForm.value,
            fecha: fechaSeleccionada.value
        };

        cargandoReserva.value = true;
        try {
            const idUltimaReserva = await nuevaReserva(dato);
            const bodyGuardarMesaReservada = { idReserva: idUltimaReserva.reservationId, idMesa: datosForm.value.mesa };
            await vincularMesaReserva(bodyGuardarMesaReservada);
            await cargarMes(fechasCalendario.value.year(), fechasCalendario.value.month() + 1);
            datosForm.value = { comensales: null, mesa: null, hora: null };
            generarNotificacion('success', '¡Reserva realizada!', 'Su reserva esta lista, ¡Te esperamos!');
        } catch (error) {
            generarNotificacion('error', 'Error al realizar la reserva', 'Si el error persiste contacte con el establecimiento.');
        } finally {
            cargandoReserva.value = false;
        }
    }
}
</script>

<template>
    <CabeceraPrincipal />

    <a-layout class="reservasMain">
        <a-divider orientation="left">
            <a-typography-title :level="2" class="tituloSeccion">Reservas</a-typography-title>
        </a-divider>

        <a-row :gutter="[32, 24]">
            <a-col :xs="24" :lg="16">
                <a-card class="cardCalendario">
                    <a-calendar :model:value="fechasCalendario" @panelChange="onPanelChange" @select="onSelect"
                        :disabledDate="disabledDate" />
                </a-card>
            </a-col>

            <a-col :xs="24" :lg="8">
                <a-card :title="fechaSeleccionada ? 'Fecha: ' + fechaSeleccionada : 'Selecciona una fecha'"
                    class="cardFormulario" :loading="cargandoDatos">
                    <a-form layout="vertical" @submit.prevent="guardarReserva">

                        <a-form-item label="Número de ocupantes">
                            <a-select v-model:value="datosForm.comensales" placeholder="Selecciona comensales"
                                @change="alCambiarOcupantes" :disabled="!fechaSeleccionada || cargandoDatos"
                                size="large">
                                <a-select-option v-for="num in opcionesOcupantes" :key="num" :value="num">
                                    {{ num }} {{ num === 1 ? 'persona' : 'personas' }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item v-if="datosForm.comensales" label="Mesa disponible">
                            <a-select v-model:value="datosForm.mesa" placeholder="Selecciona una mesa"
                                @change="filtrarHorario" size="large" :disabled="cargandoDatos"
                                :notFoundContent="'No se encontraron mesas disponibles para ese número de comensales, pongase en contacto con el establecimiento.'">
                                <a-select-option v-for="mesa in mesasDia" :key="mesa.id" :value="mesa.id">
                                    {{ mesa.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item v-if="datosForm.mesa" label="Hora disponible">
                            <a-select v-model:value="datosForm.hora" placeholder="Seleccione una hora" size="large"
                                :disabled="cargandoDatos">
                                <a-select-option v-for="hora in horario" :key="hora" :value="hora">
                                    {{ hora }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item class="botonAccionContenedor">
                            <a-button type="primary" html-type="submit" size="large" block :loading="cargandoReserva"
                                :disabled="!datosForm.comensales || !datosForm.mesa || !datosForm.hora || cargandoDatos">
                                Realizar reserva
                            </a-button>
                        </a-form-item>

                    </a-form>
                </a-card>
            </a-col>
        </a-row>
    </a-layout>

    <PiePaginaPrincipal />
</template>

<style scoped>
.reservasMain {
    padding: 120px 32px 60px 32px;
}

.tituloSeccion {
    margin-bottom: 32px !important;
}

.cardCalendario,
.cardFormulario {
    border-radius: 18px !important;
    box-shadow: 0 10px 28px rgba(58, 46, 42, 0.06) !important;
    background: var(--color-fondo-blanco);
}

.botonAccionContenedor {
    margin-top: 24px;
    margin-bottom: 0px;
}
</style>
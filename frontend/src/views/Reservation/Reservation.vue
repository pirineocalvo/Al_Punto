<script setup>
import AppHeader from '../../Components/cabeceraYpiePrincipal/Header.vue';
import AppFooter from '../../Components/cabeceraYpiePrincipal/Footer.vue';
import { getDisponibilidadMes, todasLasMesasLibresPorDia, addReservation, misReservas, vincularMesaReserva } from '../../Services/api';
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { message, notification } from 'ant-design-vue';

const fechasCalendario = ref(dayjs());
const diasBloqueados = ref({});
const fechaSeleccionada = ref('');
const mesasDia = ref([]);
const horario = ref([]);
const datosForm = ref({
    comensales: null,
    mesa: null,
    hora: null
});


const opcionesOcupantes = ref([1, 2, 3, 4, 5, 6]);

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
    try {
        const fecha = date.format('YYYY-MM-DD');
        mesasDia.value = await todasLasMesasLibresPorDia(fecha, null);
        fechaSeleccionada.value = fecha;
    } catch (error) {
        message.error('Error al cargar las mesas');
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

        try {
            const idUltimaReserva = await addReservation(dato);
            const bodyGuardarMesaReservada = { idReserva: idUltimaReserva.reservationId, idMesa: datosForm.value.mesa };
            await vincularMesaReserva(bodyGuardarMesaReservada);
            await cargarMes(fechasCalendario.value.year(), fechasCalendario.value.month() + 1);
            datosForm.value = { comensales: null, mesa: null, hora: null };
            generarNotificacion('success', '¡Reserva realizada!', 'Su reserva esta lista, ¡Te esperamos!.');
        } catch (error) {
            generarNotificacion('error', 'Error al realizar la reserva', 'Si el error persiste contacte con el establecimiento.');
        }

    }
}
</script>

<template>
    <AppHeader />

    <a-layout class="reservasMain">
        <a-typography-title :level="2">Reservas</a-typography-title>

        <a-row :gutter="[32, 16]">
            <a-col :xs="24" :lg="16">
                <a-card class="cardCalendario">
                    <a-calendar :model:value="fechasCalendario" @panelChange="onPanelChange" @select="onSelect"
                        :disabledDate="disabledDate" />
                </a-card>
            </a-col>

            <a-col :xs="24" :lg="8">
                <a-card :title="fechaSeleccionada ? 'Fecha: ' + fechaSeleccionada : 'Selecciona una fecha'"
                    class="cardFormulario">
                    <a-form layout="vertical" @submit.prevent="guardarReserva">

                        <a-form-item label="Número de ocupantes">
                            <a-select v-model:value="datosForm.comensales" placeholder="Selecciona comensales"
                                @change="alCambiarOcupantes" :disabled="!fechaSeleccionada" size="large">
                                <a-select-option v-for="num in opcionesOcupantes" :key="num" :value="num">
                                    {{ num }} {{ num === 1 ? 'persona' : 'personas' }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item v-if="datosForm.comensales" label="Mesa disponible">
                            <a-select v-model:value="datosForm.mesa" placeholder="Selecciona una mesa"
                                @change="filtrarHorario" size="large">
                                <a-select-option v-for="mesa in mesasDia" :key="mesa.id" :value="mesa.id">
                                    {{ mesa.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item v-if="datosForm.mesa" label="Hora disponible">
                            <a-select v-model:value="datosForm.hora" placeholder="Seleccione una hora" size="large">
                                <a-select-option v-for="hora in horario" :key="hora" :value="hora">
                                    {{ hora }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item>
                            <a-button html-type="submit" size="large" block
                                :disabled="!datosForm.comensales || !datosForm.mesa || !datosForm.hora">
                                Realizar reserva
                            </a-button>
                        </a-form-item>

                    </a-form>
                </a-card>
            </a-col>
        </a-row>
    </a-layout>

    <AppFooter />
</template>
<style scoped>
.reservasMain {
    padding: 100px 32px;
    display: flex;
    justify-content: center;
}

.cardCalendario,
.cardFormulario {
    border-radius: 18px !important;
    box-shadow: 0 10px 28px rgba(58, 46, 42, 0.08) !important;
}
</style>
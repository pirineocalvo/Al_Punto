<script setup>
import './Reservation.css'
import AppHeader from '../../Components/cabeceraYpiePrincipal/Header.vue';
import AppFooter from '../../Components/cabeceraYpiePrincipal/Footer.vue';
import { getDisponibilidadMes, todasLasMesasLibresPorDia, addReservation } from '../../Services/api'
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const fechasCalendario = ref(dayjs());
const diasBloqueados = ref({});
const fechaSeleccionada = ref('');
const mesasDia = ref([]);
const horario = ref([]);
const datosForm = ref({
    ocupantes: null,
    mesa: null,
    hora: null
});

onMounted(async () => {
    await cargarMes(fechasCalendario.value.year(), fechasCalendario.value.month() + 1);
})

async function onSelect(date) {
    const fecha = date.format('YYYY-MM-DD');
    mesasDia.value = await todasLasMesasLibresPorDia(fecha, null);
    console.log(mesasDia.value);
    
    fechaSeleccionada.value = fecha;
}

async function onPanelChange(value) {
    fechasCalendario.value = value;
    await cargarMes(value.year(), value.month() + 1);
}

async function cargarMes(year, month) {
    try {
        diasBloqueados.value = await getDisponibilidadMes(year, month);
    } catch (error) {
        console.error('Error al cargar disponibilidad del mes:', error);
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
    mesasDia.value = await todasLasMesasLibresPorDia(fecha, datosForm.value.ocupantes);
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
        const r = await addReservation(dato);
        await cargarMes(fechasCalendario.value.year(), fechasCalendario.value.month() + 1);
        datosForm.value = { ocupantes: null, mesa: null, hora: null };

        console.log(r);
    }


}
</script>

<template>
    <AppHeader />

    <main class="reservas-main">
        <a-typography-title :level="2" class="reservas-titulo">Reservas</a-typography-title>

        <a-row class="reservas-row">
            <a-col :xs="24" :lg="16">
                <a-card class="cardCalendario">
                    <a-calendar class="mi-calendario" :model:value="fechasCalendario" @panelChange="onPanelChange" @select="onSelect" :disabledDate="disabledDate" />
                </a-card>
            </a-col>

            <a-col :xs="24" :lg="8">
                <a-card :title="fechaSeleccionada ? 'Fecha: ' + fechaSeleccionada : 'Selecciona una fecha'" class="cardFormulario">
                    <a-form layout="vertical" @submit.prevent="guardarReserva">

                        <a-form-item label="Número de ocupantes">
                            <a-select v-model:value="datosForm.ocupantes" placeholder="Selecciona ocupantes" @change="alCambiarOcupantes" :disabled="!fechaSeleccionada" size="large">
                                <a-select-option v-for="n in 6" :key="n" :value="n">
                                    {{ n }} {{ n === 1 ? 'persona' : 'personas' }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item v-if="datosForm.ocupantes" label="Mesa disponible">
                            <a-select v-model:value="datosForm.mesa" placeholder="Seleccione una mesa"@change="filtrarHorario" size="large">
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
                            <a-button html-type="submit" class="btnPrincipal" size="large" block :disabled="!datosForm.ocupantes || !datosForm.mesa || !datosForm.hora">
                                Realizar reserva
                            </a-button>
                        </a-form-item>

                    </a-form>
                </a-card>
            </a-col>

        </a-row>
    </main>

    <AppFooter />
</template>
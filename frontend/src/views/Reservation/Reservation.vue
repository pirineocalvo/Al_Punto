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

// para cuando se seleccione una fecha en el calendario
async function onSelect(date) {
    const fecha = date.format('YYYY-MM-DD');
    //mesas disponibles del dia y las horas
    mesasDia.value = await todasLasMesasLibresPorDia(fecha, null);

    fechaSeleccionada.value = fecha;
}

// si cambia el mes o algo del calendario
async function onPanelChange(value) {
    fechasCalendario.value = value;

    const year = fechasCalendario.value.year();
    const month = fechasCalendario.value.month() + 1;

    await cargarMes(year, month);
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
    const fecha = fechasCalendario.value.format('YYYY-MM-DD');

    mesasDia.value = await todasLasMesasLibresPorDia(fecha, datosForm.value.ocupantes);
}

function filtrarHorario() {
    horario.value = mesasDia.value.find((mesa) => mesa.id == datosForm.value.mesa).horasDisponibles;
    datosForm.value.hora = null;
}

async function guardarReserva() {
    const dato = {
        ...datosForm.value,
        fecha: fechaSeleccionada.value
    };
    console.log('funcion guardarReserva');

    const r = await addReservation(dato);

    await cargarMes(fechasCalendario.value.year(), fechasCalendario.value.month() + 1);
    datosForm.value = {
        ocupantes: null,
        mesa: null,
        hora: null
    };
    console.log(r);

}
</script>
<template>
    <section>
        <AppHeader />
        <a-typograhy-title :level="2">Reservas</a-typograhy-title>
        <div class="contenedorCalendairo">
            <a-card class="cardCalendario">
                <a-calendar :model:value="fechasCalendario" @panelChange="onPanelChange" @select="onSelect"
                    :disabledDate="disabledDate" />
            </a-card>

            <a-card :title="'Fecha: ' + fechaSeleccionada" :bordered="false" class="cardFormulario">
                <a-form layout="vertical" @submit.prevent="guardarReserva">
                    <a-form-item label="Número de ocupantes">
                        <a-select v-model:value="datosForm.ocupantes" placeholder="Selecciona ocupantes"
                            @change="alCambiarOcupantes" :disabled="!fechaSeleccionada" size="large">
                            <a-select-option :value="1">1</a-select-option>
                            <a-select-option :value="2">2</a-select-option>
                            <a-select-option :value="3">3</a-select-option>
                            <a-select-option :value="4">4</a-select-option>
                            <a-select-option :value="5">5</a-select-option>
                            <a-select-option :value="6">6</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item v-show="datosForm.ocupantes" label="Mesas disponibles">
                        <a-select v-model:value="datosForm.mesa" placeholder="Seleccione una mesa"
                            @change="filtrarHorario" size="large">
                            <a-select-option v-for="mesa in mesasDia" :key="mesa.id" :value="mesa.id">
                                {{ mesa.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item v-show="datosForm.mesa" label="Horas disponibles">
                        <a-select v-model:value="datosForm.hora" placeholder="Seleccione una hora" size="large">
                            <a-select-option v-for="hora in horario" :key="hora" :value="hora">
                                {{ hora }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-button html-type="submit" class="btnPrincipal btn-reserva" size="large"
                        :disabled="!datosForm.ocupantes || !datosForm.mesa || !datosForm.hora">
                        Realizar reserva
                    </a-button>
                </a-form>
            </a-card>
        </div>
        <AppFooter />
    </section>
</template>
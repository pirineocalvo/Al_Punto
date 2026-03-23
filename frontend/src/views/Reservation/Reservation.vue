<script setup>
import './Reservation.css'
import { getDisponibilidadMes, todasLasMesasLibresPorDia } from '../../Services/api'
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const fechasCalendario = ref(dayjs());
const diasBloqueados = ref({});
const fechaSeleccionada = ref('');
const mesasDia = ref([]);
const horario = ref([]);
const datosForm = ref({
    ocupantes:null,
    mesa:null,
    hora:null
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
    horario.value = mesasDia.value.find((mesa)=>mesa.id == datosForm.value.mesa).horasDisponibles;
    datosForm.value.hora = null;

    
    
    
    
}
</script>
<template>
    <section>
        <h2>Reservas</h2>
        <div class="contenedorCalendairo">
            <a-calendar :model:value="fechasCalendario" @panelChange="onPanelChange" @select="onSelect" :disabledDate="disabledDate"/>
            <div>
                <form action="">
                    <p>Fecha: {{ fechaSeleccionada || 'Sin seleccionar' }}</p>
                    <p>Número de ocupantes</p>
                    <a-select v-model:value="datosForm.ocupantes" placeholder="Selecciona ocupantes" @change="alCambiarOcupantes" :disabled="!fechaSeleccionada">
                        <a-select-option :value="1">1</a-select-option>
                        <a-select-option :value="2">2</a-select-option>
                        <a-select-option :value="3">3</a-select-option>
                        <a-select-option :value="4">4</a-select-option>
                        <a-select-option :value="5">5</a-select-option>
                        <a-select-option :value="6">6</a-select-option>
                    </a-select>

                    <div v-show="datosForm.ocupantes">
                        <p>Mesas disponibles:</p>
                        <a-select v-model:value="datosForm.mesa" placeholder="Seleccione una mesa" @change="filtrarHorario()">
                            <a-select-option v-for="mesa in mesasDia" :key="mesa.id" :value="mesa.id">{{ mesa.name }}</a-select-option>
                        </a-select>

                    </div>
                    <div v-show="datosForm.mesa">
                        <p>Fechas disponibles:</p>
                        <a-select v-model:value="datosForm.hora" placeholder="Seleccione una hora">
                            <a-select-option v-for="(hora, index) in horario" :key="index" :value="hora">{{ hora }}</a-select-option>
                        </a-select>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>
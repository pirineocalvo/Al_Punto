<template>
    <section>
        <h2>Reservas</h2>
        <div class="contenedorCalendairo">
            <a-calendar :model:value="fechasCalendario" @panelChange="onPanelChange" @select="onSelect" :disabledDate="disabledDate"
/>
            <div>
                <form action="">
                    <p>Fecha: {{ fechaSeleccionada || 'Sin seleccionar' }}</p>

                    <a-select v-model:value="datosForm.ocupantes" placeholder="Selecciona ocupantes"
                        @change="alCambiarOcupantes">
                        <a-select-option :value="1">1</a-select-option>
                        <a-select-option :value="2">2</a-select-option>
                        <a-select-option :value="3">3</a-select-option>
                        <a-select-option :value="4">4</a-select-option>
                        <a-select-option :value="5">5</a-select-option>
                        <a-select-option :value="6">6</a-select-option>
                    </a-select>

                    <div v-if="horario.length">
                        <p>Horas disponibles:</p>
                        <ul>
                            <li v-for="hora in horario" :key="hora">
                                {{ hora }}
                            </li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>

<script setup>
import './Reservation.css'
import { getDisponibilidadMes } from '../../Services/api'
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const fechasCalendario = ref(dayjs())
const horario = ['13:30:00', '14:00:00', '14:30:00', '15:00:00']
const diasBloqueados = ref({})
const fechaSeleccionada = ref('')
const mesasDia = ref([])
const datosForm = ref({
    ocupantes:null
})
onMounted(async () => {
    await cargarMes(
        fechasCalendario.value.year(),
        fechasCalendario.value.month() + 1
    )
})

// para cuando se seleccione una fecha en el calendario
async function onSelect(date) {
    const fecha = date.format('YYYY-MM-DD')

    if (diasBloqueados.value[fecha]) {
        console.log('Día bloqueado')
        return
    }

    fechaSeleccionada.value = fecha
}

// si cambia el mes o algo del calendario
async function onPanelChange(value) {
    fechasCalendario.value = value

    const year = value.year()
    const month = value.month() + 1

    await cargarMes(year, month)
}

async function cargarMes(year, month) {
    try {
        diasBloqueados.value = await getDisponibilidadMes(year, month)
        console.log('Días bloqueados:', diasBloqueados.value)
    } catch (error) {
        console.error('Error al cargar disponibilidad del mes:', error)
    }
}

function disabledDate(current) {
    const fecha = current.format('YYYY-MM-DD')
    return diasBloqueados.value[fecha] === true
}
</script>
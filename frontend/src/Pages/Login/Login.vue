<template>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, InfoCircleOutlined, StepForwardOutlined, StepBackwardOutlined, LoginOutlined } from '@ant-design/icons-vue'
import { loginUser } from '../../Services/api'
import './Login.css'

</script>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (authToken, userData) => {
    token.value = authToken
    user.value = userData
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials)
      const { token: authToken, user: userData } = response.data.data
      setAuth(authToken, userData)
      router.push('/')
      return response.data
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData)
      const { token: authToken, user: newUser } = response.data.data
      setAuth(authToken, newUser)
      router.push('/')
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    clearAuth()
    router.push('/login')
  }

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/me')
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(response.data.data))
      return response.data
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  // Set token in axios headers if it exists
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser
  }
})

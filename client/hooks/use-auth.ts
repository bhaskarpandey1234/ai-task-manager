"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

type User = {
  id: string
  email: string
  fullName: string
  role: 'USER' | 'ADMIN'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        apiClient.setToken(token)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await apiClient.login(email, password)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    router.push('/dashboard')
    return data
  }, [router])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const data = await apiClient.register(email, password, fullName)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    router.push('/dashboard')
    return data
  }, [router])

  const signOut = useCallback(async () => {
    apiClient.clearToken()
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }, [router])

  return {
    user,
    profile: user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === 'ADMIN',
  }
}
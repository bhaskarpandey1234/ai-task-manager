"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

type Task = {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  userId: string
  parentId?: string
  createdAt: string
  updatedAt: string
  subtasks?: Task[]
}

export function useTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = userId ? await apiClient.getUserTasks(userId) : await apiClient.getTasks()
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (task: { title: string; description?: string; parentId?: string }) => {
    try {
      const data = await apiClient.createTask(task)
      setTasks(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const updateTask = async (id: string, updates: { title?: string; description?: string; status?: string }) => {
    try {
      const data = await apiClient.updateTask(id, updates)
      setTasks(prev => prev.map(task => task.id === id ? data : task))
      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await apiClient.deleteTask(id)
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const getSubTasks = (parentId: string) => {
    return tasks.filter(task => task.parentId === parentId)
  }

  const getMainTasks = () => {
    return tasks.filter(task => !task.parentId)
  }

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    getSubTasks,
    getMainTasks,
    refreshTasks: fetchTasks,
  }
}
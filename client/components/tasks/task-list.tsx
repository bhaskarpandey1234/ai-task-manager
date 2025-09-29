"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { TaskCard } from './task-card'
import { TaskForm } from './task-form'
import { useTasks } from '@/hooks/use-tasks'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
type Task = {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  userId: string
  parentId?: string
  createdAt: string
  updatedAt: string
}

interface TaskListProps {
  userId?: string
  isAdmin?: boolean
}

export function TaskList({ userId, isAdmin = false }: TaskListProps) {
  const { user } = useAuth()
  const { 
    loading, 
    createTask, 
    updateTask, 
    deleteTask, 
    getSubTasks, 
    getMainTasks 
  } = useTasks(userId)

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [parentTaskId, setParentTaskId] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const mainTasks = getMainTasks()

  const filteredTasks = useMemo(() => {
    let filtered = mainTasks

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [mainTasks, statusFilter, searchQuery])

  const handleCreateTask = () => {
    setEditingTask(null)
    setParentTaskId(undefined)
    setShowTaskForm(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setParentTaskId(undefined)
    setShowTaskForm(true)
  }

  const handleAddSubTask = (parentId: string) => {
    setEditingTask(null)
    setParentTaskId(parentId)
    setShowTaskForm(true)
  }

  const handleSubmitTask = async (
    data: { title: string; description?: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE' },
    subTasks?: string[]
  ) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data)
        toast.success('Task updated successfully!')
      } else {
        const taskData = {
          title: data.title,
          description: data.description,
          status: data.status,
          parentId: parentTaskId || undefined,
        }

        const createdTask = await createTask(taskData)

        // Create sub-tasks if any were selected
        if (subTasks && subTasks.length > 0 && createdTask) {
          const subTaskPromises = subTasks.map(subTaskTitle =>
            createTask({
              title: subTaskTitle,
              parentId: createdTask.id,
            })
          )

          await Promise.all(subTaskPromises)
          toast.success(`Task created with ${subTasks.length} sub-tasks!`)
        } else {
          toast.success('Task created successfully!')
        }
      }
    } catch (error: any) {
      throw error
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      toast.success('Task deleted successfully!')
    } catch (error: any) {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await updateTask(taskId, { status })
      toast.success('Task status updated!')
    } catch (error: any) {
      toast.error('Failed to update task status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {!isAdmin && (
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 3v18l4-4h-4V7h4L13 3zM1 11h8v2H1v-2z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No matching tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : isAdmin 
                ? 'This user hasn\'t created any tasks yet'
                : 'Create your first task to get started with AI-powered task management'
            }
          </p>
          {!isAdmin && !searchQuery && statusFilter === 'all' && (
            <Button onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              subTasks={getSubTasks(task.id)}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onAddSubTask={!isAdmin ? handleAddSubTask : undefined}
            />
          ))}
        </div>
      )}

      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        task={editingTask}
        parentTaskId={parentTaskId}
        onSubmit={handleSubmitTask}
      />
    </div>
  )
}
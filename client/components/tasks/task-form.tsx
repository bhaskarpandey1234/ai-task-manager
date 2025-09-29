"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sparkles, X, Loader as Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
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

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  parentTaskId?: string
  onSubmit: (data: TaskFormData, subTasks?: string[]) => Promise<void>
}

export function TaskForm({ open, onOpenChange, task, parentTaskId, onSubmit }: TaskFormProps) {
  const [suggestedSubTasks, setSuggestedSubTasks] = useState<string[]>([])
  const [selectedSubTasks, setSelectedSubTasks] = useState<string[]>([])
  const [generatingSubTasks, setGeneratingSubTasks] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
    },
  })

  const title = watch('title')
  const description = watch('description')

  useEffect(() => {
    if (task) {
      setValue('title', task.title)
      setValue('description', task.description || '')
      setValue('status', task.status)
    } else {
      reset()
    }
    setSuggestedSubTasks([])
    setSelectedSubTasks([])
  }, [task, setValue, reset])

  const handleGenerateSubTasks = async () => {
    if (!title.trim()) {
      toast.error('Please enter a task title first')
      return
    }

    try {
      setGeneratingSubTasks(true)
      const response = await apiClient.generateSubtasks(title, description)
      const subTasks = response.subtasks.map((st: any) => st.title)
      setSuggestedSubTasks(subTasks)
      setSelectedSubTasks(subTasks) // Select all by default
      toast.success('Sub-tasks generated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate sub-tasks')
    } finally {
      setGeneratingSubTasks(false)
    }
  }

  const toggleSubTask = (subTask: string) => {
    setSelectedSubTasks(prev =>
      prev.includes(subTask)
        ? prev.filter(st => st !== subTask)
        : [...prev, subTask]
    )
  }

  const removeSubTask = (subTask: string) => {
    setSuggestedSubTasks(prev => prev.filter(st => st !== subTask))
    setSelectedSubTasks(prev => prev.filter(st => st !== subTask))
  }

  const onSubmitForm = async (data: TaskFormData) => {
    try {
      setSubmitting(true)
      const subTasksToCreate = !parentTaskId && !task ? selectedSubTasks : undefined
      await onSubmit(data, subTasksToCreate)
      onOpenChange(false)
      reset()
      setSuggestedSubTasks([])
      setSelectedSubTasks([])
    } catch (error: any) {
      toast.error(error.message || 'Failed to save task')
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = !!task
  const canGenerateSubTasks = !parentTaskId && !isEditing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Task' : parentTaskId ? 'Add Sub-task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your task details below.'
              : parentTaskId 
                ? 'Add a sub-task to break down your main task.'
                : 'Create a new task and optionally generate AI-powered sub-tasks.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description (optional)..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(value: 'TODO' | 'IN_PROGRESS' | 'DONE') => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {canGenerateSubTasks && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>AI Sub-tasks</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSubTasks}
                  disabled={generatingSubTasks || !title.trim()}
                >
                  {generatingSubTasks ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {generatingSubTasks ? 'Generating...' : 'Generate Sub-tasks'}
                </Button>
              </div>

              {suggestedSubTasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Select the sub-tasks you want to create:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {suggestedSubTasks.map((subTask, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Badge
                          variant={selectedSubTasks.includes(subTask) ? "default" : "secondary"}
                          className="cursor-pointer flex-1 justify-start"
                          onClick={() => toggleSubTask(subTask)}
                        >
                          {subTask}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeSubTask(subTask)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {selectedSubTasks.length > 0 && (
                    <p className="text-sm text-green-600">
                      {selectedSubTasks.length} sub-task{selectedSubTasks.length !== 1 ? 's' : ''} will be created
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
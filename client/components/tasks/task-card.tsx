"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { MoveHorizontal as MoreHorizontal, CreditCard as Edit, Trash2, Plus, CircleCheck as CheckCircle, Circle, Clock } from 'lucide-react'
import { format } from 'date-fns'
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

interface TaskCardProps {
  task: Task
  subTasks?: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: Task['status']) => void
  onAddSubTask?: (parentTaskId: string) => void
  isSubTask?: boolean
}

const statusConfig = {
  TODO: { label: 'To Do', icon: Circle, className: 'bg-gray-100 text-gray-800' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, className: 'bg-blue-100 text-blue-800' },
  DONE: { label: 'Done', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
}

export function TaskCard({ 
  task, 
  subTasks = [], 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onAddSubTask,
  isSubTask = false 
}: TaskCardProps) {
  const [showSubTasks, setShowSubTasks] = useState(false)
  
  const StatusIcon = statusConfig[task.status].icon

  const handleStatusChange = (status: Task['status']) => {
    onStatusChange(task.id, status)
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isSubTask ? 'ml-6 border-l-4 border-l-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-medium ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={statusConfig[task.status].className}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[task.status].label}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {task.status !== 'TODO' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('TODO')}>
                    <Circle className="mr-2 h-4 w-4" />
                    Mark as To Do
                  </DropdownMenuItem>
                )}
                {task.status !== 'IN_PROGRESS' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
                    <Clock className="mr-2 h-4 w-4" />
                    Mark as In Progress
                  </DropdownMenuItem>
                )}
                {task.status !== 'DONE' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('DONE')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Done
                  </DropdownMenuItem>
                )}
                {!isSubTask && onAddSubTask && (
                  <DropdownMenuItem onClick={() => onAddSubTask(task.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sub-task
                  </DropdownMenuItem>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      <span className="text-red-600">Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{task.title}"? This action cannot be undone.
                        {subTasks.length > 0 && ' All sub-tasks will also be deleted.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(task.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
          {subTasks.length > 0 && !isSubTask && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setShowSubTasks(!showSubTasks)}
            >
              {showSubTasks ? 'Hide' : 'Show'} {subTasks.length} sub-task{subTasks.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
        
        {showSubTasks && subTasks.length > 0 && (
          <div className="mt-4 space-y-3">
            {subTasks.map((subTask) => (
              <TaskCard
                key={subTask.id}
                task={subTask}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                isSubTask={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
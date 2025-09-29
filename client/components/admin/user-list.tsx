"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Calendar, CircleCheck as CheckCircle, Clock, Circle } from 'lucide-react'
import { format } from 'date-fns'
import { TaskList } from '@/components/tasks/task-list'
import { apiClient } from '@/lib/api'

type Profile = {
  id: string
  email: string
  fullName: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

interface UserWithStats extends Profile {
  taskCounts: {
    total: number
    todo: number
    in_progress: number
    done: number
  }
}

export function UserList() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsersWithStats()
  }, [])

  const fetchUsersWithStats = async () => {
    try {
      const users = await apiClient.getUsers()
      setUsers(users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedUser(null)}
            >
              ← Back to Users
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getInitials(selectedUser.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{selectedUser.fullName}</h2>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            </div>
          </div>
          <Badge variant={selectedUser.role === 'ADMIN' ? 'default' : 'secondary'}>
            {selectedUser.role}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Tasks</span>
              </div>
              <p className="text-2xl font-bold mt-2">{selectedUser.taskCounts.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Circle className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">To Do</span>
              </div>
              <p className="text-2xl font-bold mt-2">{selectedUser.taskCounts.todo}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <p className="text-2xl font-bold mt-2">{selectedUser.taskCounts.in_progress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Done</span>
              </div>
              <p className="text-2xl font-bold mt-2">{selectedUser.taskCounts.done}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Tasks</CardTitle>
            <CardDescription>
              All tasks created by {selectedUser.fullName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList userId={selectedUser.id} isAdmin={true} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-gray-600">View and manage all users and their tasks</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">There are no users in the system yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.fullName}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{user.taskCounts.total}</p>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{user.taskCounts.done}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Circle className="h-3 w-3" />
                      To Do
                    </span>
                    <span>{user.taskCounts.todo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                      In Progress
                    </span>
                    <span>{user.taskCounts.in_progress}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-3">
                    Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                  >
                    View Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
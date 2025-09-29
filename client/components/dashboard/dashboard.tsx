"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TaskList } from '@/components/tasks/task-list'
import { UserList } from '@/components/admin/user-list'
import { useAuth } from '@/hooks/use-auth'
import { LayoutDashboard, SquareCheck as CheckSquare, Users, Settings } from 'lucide-react'

export function Dashboard() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('tasks')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              My Tasks
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">My Tasks</h2>
              <p className="text-gray-600">
                Manage your tasks with AI-powered assistance for breaking down complex work.
              </p>
            </div>
            <TaskList />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <UserList />
            </TabsContent>
          )}

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Settings</h2>
              <p className="text-gray-600">
                Configure your account settings and preferences.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
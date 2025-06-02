
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Users, FolderOpen, CheckSquare, TrendingUp, Loader2, UserCheck, Shield } from 'lucide-react';
import { CompanyCodeShare } from './CompanyCodeShare';

export const Dashboard: React.FC = () => {
  const { stats, projects, tasks, isLoading } = useData();
  const { user } = useAuth();

  const recentProjects = projects.slice(0, 3);
  const recentTasks = tasks.slice(0, 3);

  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'Todo').length,
    inProgress: tasks.filter(task => task.status === 'In Progress').length,
    done: tasks.filter(task => task.status === 'Done').length,
  };

  // Check if user is admin based on role
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-300">Welcome back, {user?.name}!</p>
        <p className="text-sm text-gray-400">Company: {user?.companyName}</p>
        <div className="flex items-center gap-2 mt-2">
          {isAdmin ? (
            <Shield className="h-4 w-4 text-yellow-400" />
          ) : (
            <UserCheck className="h-4 w-4 text-dark-red-400" />
          )}
          <span className={`text-sm ${isAdmin ? 'text-yellow-400' : 'text-dark-red-400'}`}>
            {isAdmin ? 'Company Admin' : 'Team Member'}
          </span>
        </div>
      </div>

      {/* Show Company Code Share only for admins */}
      {isAdmin && <CompanyCodeShare />}

      {/* Show welcome message for new team members */}
      {!isAdmin && (
        <Card className="bg-dark-red-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Welcome to {user?.companyName}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-300">
                You've successfully joined the team. You can now view and participate in company projects and tasks.
              </p>
              <p className="text-sm text-gray-400">
                Your company admin will assign you to projects and tasks soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-dark-red-800 border-gray-700 hover:bg-dark-red-750 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-dark-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <p className="text-xs text-gray-400 mt-1">Active team members</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-red-800 border-gray-700 hover:bg-dark-red-750 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-dark-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
            <p className="text-xs text-gray-400 mt-1">Active projects</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-red-800 border-gray-700 hover:bg-dark-red-750 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-dark-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
            <p className="text-xs text-gray-400 mt-1">Total tasks</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-red-800 border-gray-700 hover:bg-dark-red-750 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-dark-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalTasks > 0 ? Math.round((tasksByStatus.done / stats.totalTasks) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-400 mt-1">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-dark-red-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="p-3 bg-dark-red-700 rounded-lg">
                    <h4 className="font-medium text-white">{project.name}</h4>
                    <p className="text-sm text-gray-300 mt-1">{project.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    {isAdmin ? 'No projects yet. Create your first project!' : 'No projects assigned yet'}
                  </p>
                  {!isAdmin && (
                    <p className="text-xs text-gray-500 mt-1">
                      Contact your admin to get assigned to projects
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-red-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-dark-red-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'Done' ? 'bg-green-600 text-white' :
                        task.status === 'In Progress' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                    {task.projects && (
                      <p className="text-xs text-dark-red-400 mt-1">Project: {task.projects.name}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    {isAdmin ? 'No tasks yet. Create your first task!' : 'No tasks assigned yet'}
                  </p>
                  {!isAdmin && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tasks will appear here when assigned to you
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Overview */}
      <Card className="bg-dark-red-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Task Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{tasksByStatus.todo}</div>
              <p className="text-sm text-gray-500">To Do</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{tasksByStatus.inProgress}</div>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{tasksByStatus.done}</div>
              <p className="text-sm text-gray-500">Done</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

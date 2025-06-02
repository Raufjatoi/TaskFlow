
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { projectsService, type Project } from '@/services/projects';
import { tasksService, type Task } from '@/services/tasks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
  };
  isLoading: boolean;
  createProject: (project: { name: string; description?: string }) => Promise<void>;
  updateProject: (id: string, project: { name: string; description?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createTask: (task: {
    title: string;
    description?: string;
    status: 'Todo' | 'In Progress' | 'Done';
    project_id: string;
    assigned_user_id?: string;
  }) => Promise<void>;
  updateTask: (id: string, task: Partial<{
    title: string;
    description: string;
    status: 'Todo' | 'In Progress' | 'Done';
    project_id: string;
    assigned_user_id: string;
  }>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.companyId);

      if (error) {
        console.error('Error fetching users count:', error);
        return;
      }

      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const refreshData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [projectsData, tasksData] = await Promise.all([
        projectsService.getProjects(),
        tasksService.getTasks(),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
      
      // Fetch users count
      await fetchUsers();
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const createProject = async (projectData: { name: string; description?: string }) => {
    try {
      const newProject = await projectsService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, projectData: { name: string; description?: string }) => {
    try {
      const updatedProject = await projectsService.updateProject(id, projectData);
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      setTasks(prev => prev.filter(task => task.project_id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    status: 'Todo' | 'In Progress' | 'Done';
    project_id: string;
    assigned_user_id?: string;
  }) => {
    try {
      const newTask = await tasksService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: Partial<{
    title: string;
    description: string;
    status: 'Todo' | 'In Progress' | 'Done';
    project_id: string;
    assigned_user_id: string;
  }>) => {
    try {
      const updatedTask = await tasksService.updateTask(id, taskData);
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? updatedTask : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const stats = {
    totalUsers,
    totalProjects: projects.length,
    totalTasks: tasks.length,
  };

  return (
    <DataContext.Provider value={{
      projects,
      tasks,
      stats,
      isLoading,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

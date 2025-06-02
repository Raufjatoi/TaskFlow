
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'Todo' | 'In Progress' | 'Done';
  assigned_user_id: string | null;
  project_id: string;
  company_id: string;
  created_at: string;
  projects?: {
    name: string;
  };
}

export const tasksService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Task[];
  },

  async createTask(task: {
    title: string;
    description?: string;
    status: 'Todo' | 'In Progress' | 'Done';
    project_id: string;
    assigned_user_id?: string;
  }): Promise<Task> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description || null,
        status: task.status,
        project_id: task.project_id,
        assigned_user_id: task.assigned_user_id || user.user.id,
        company_id: profile.company_id,
      })
      .select(`
        *,
        projects (
          name
        )
      `)
      .single();

    if (error) throw error;
    return data as Task;
  },

  async updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'project_id' | 'assigned_user_id'>>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        projects (
          name
        )
      `)
      .single();

    if (error) throw error;
    return data as Task;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

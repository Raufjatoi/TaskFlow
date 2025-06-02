
import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, FolderOpen, CheckSquare, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const AppSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      title: 'Projects',
      icon: FolderOpen,
      path: '/projects'
    },
    {
      title: 'Tasks',
      icon: CheckSquare,
      path: '/tasks'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Sidebar className="border-r border-gray-700">
      <SidebarContent className="bg-dark-red-950">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">TaskFlow</h2>
          <p className="text-sm text-gray-300">{user?.companyName}</p>
        </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`hover:bg-dark-red-800 transition-colors ${
                      location.pathname === item.path ? 'bg-dark-red-800 text-white' : 'text-gray-300'
                    }`}
                  >
                    <button 
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg"
                    >
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-dark-red-950 border-t border-gray-700">
        <div className="p-4 space-y-4">
          <div className="text-center text-xs text-gray-400">
            <p>By Abdul Rauf Jatoi</p>
            <div className="flex justify-center gap-4 mt-2">
              <a 
                href="https://raufjatoi.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-dark-red-400 hover:text-dark-red-300 transition-colors"
              >
                Portfolio <ExternalLink size={12} />
              </a>
              <a 
                href="https://www.icreativez.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-dark-red-400 hover:text-dark-red-300 transition-colors"
              >
                iCreativez <ExternalLink size={12} />
              </a>
            </div>
          </div>
          
          <SidebarMenuButton 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-dark-red-900">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="mb-6">
              <SidebarTrigger className="text-white hover:bg-dark-red-800 p-2 rounded" />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

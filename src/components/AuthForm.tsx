
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log('AuthForm - User detected, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    companyCode: '',
    isJoining: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('AuthForm - Attempting login');
      await login(loginForm.email, loginForm.password);
      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('AuthForm - Login error:', error);
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('AuthForm - Attempting signup');
      await signup(
        signupForm.email, 
        signupForm.password, 
        signupForm.name,
        signupForm.isJoining ? undefined : signupForm.companyName,
        signupForm.isJoining ? signupForm.companyCode : undefined
      );
      toast({
        title: 'Account created!',
        description: 'Welcome to TaskFlow. Your account has been created successfully.',
      });
      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      console.error('AuthForm - Signup error:', error);
      
      // Check if it's a "user already exists" error
      if (error.message?.includes('already exists') || error.message?.includes('already registered')) {
        toast({
          title: 'Account already exists',
          description: 'An account with this email already exists. Please try logging in instead.',
          variant: 'destructive',
        });
        // Switch to login tab and pre-fill email
        setActiveTab('login');
        setLoginForm(prev => ({ ...prev, email: signupForm.email }));
      } else {
        toast({
          title: 'Signup failed',
          description: error.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the form if user is already logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-red-900">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-red-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-gray-300">Professional Project Management</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dark-red-800">
            <TabsTrigger value="login" className="data-[state=active]:bg-dark-red-700 text-white">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-dark-red-700 text-white">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-dark-red-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Welcome Back</CardTitle>
                <CardDescription className="text-gray-300">
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-dark-red-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-dark-red-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="bg-dark-red-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Create Account</CardTitle>
                <CardDescription className="text-gray-300">
                  Join TaskFlow and start managing your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-dark-red-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-dark-red-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-dark-red-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="joining"
                        checked={signupForm.isJoining}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, isJoining: e.target.checked }))}
                        className="rounded bg-dark-red-700 border-gray-600"
                      />
                      <Label htmlFor="joining" className="text-white text-sm">
                        Join an existing company
                      </Label>
                    </div>

                    {signupForm.isJoining ? (
                      <div className="space-y-2">
                        <Label htmlFor="company-code" className="text-white">Company Code</Label>
                        <Input
                          id="company-code"
                          value={signupForm.companyCode}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, companyCode: e.target.value }))}
                          className="bg-dark-red-700 border-gray-600 text-white"
                          placeholder="Enter company code"
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="company-name" className="text-white">Company Name</Label>
                        <Input
                          id="company-name"
                          value={signupForm.companyName}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, companyName: e.target.value }))}
                          className="bg-dark-red-700 border-gray-600 text-white"
                          placeholder="Your company name"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-xs text-gray-400">
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
      </div>
    </div>
  );
};

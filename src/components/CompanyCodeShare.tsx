
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Users, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const CompanyCodeShare: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Only show for admins
  if (!user || user.role !== 'admin') return null;

  const companyCode = user.companyName; // Using company name as the code for now

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(companyCode);
      setCopied(true);
      toast({
        title: 'Company code copied!',
        description: 'Share this code with team members to invite them to your company.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-dark-red-800 border-gray-700 border-yellow-400/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-yellow-400" />
          Admin: Invite Team Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-gray-300 text-sm mb-2">
            As a company admin, share this company code with team members so they can join your company:
          </p>
          <div className="flex items-center gap-2 p-3 bg-dark-red-700 rounded-lg border border-yellow-400/20">
            <code className="text-white font-mono text-lg flex-1">{companyCode}</code>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          <p>Team members can use this code during signup to join your company.</p>
          <p className="mt-1 text-yellow-400/80">
            <Shield className="h-3 w-3 inline mr-1" />
            Only admins can see and share this code.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

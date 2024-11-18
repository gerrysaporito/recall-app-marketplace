'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { useToast } from '@/components/hooks/use-toast';

export const AuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: false
      });
      
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Failed to sign in with GitHub. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Failed to sign in with GitHub. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLogin}
      variant="outline"
      className="w-full flex items-center gap-2"
      disabled={isLoading}
    >
      <Github className="h-4 w-4" />
      {isLoading ? 'Loading...' : 'Continue with GitHub'}
    </Button>
  );
}; 
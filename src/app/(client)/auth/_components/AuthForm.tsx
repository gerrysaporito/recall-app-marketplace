"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/hooks/use-toast";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
  password: string;
  name?: string;
};

export const AuthForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();
  const { toast } = useToast();

  const handleAuthError = (error: string) => {
    const errorMessage =
      error === "Invalid credentials" ? "Invalid email or password" : error;

    toast({
      variant: "destructive",
      title: "Authentication failed",
      description: errorMessage,
    });
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = result.error.replace(/%20/g, " ");
        throw new Error(errorMessage);
      }

      if (result?.ok) {
        const session = await getSession();

        if (session) {
          toast({
            title: isRegister ? "Account created" : "Welcome back",
            description: isRegister
              ? "Successfully signed in with your new account"
              : "Successfully signed in to your account",
          });

          router.replace("/dashboard");
        }
      }
    } catch (error: any) {
      handleAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isRegister && (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input {...register("name")} id="name" placeholder="John Doe" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          {...register("email")}
          id="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          {...register("password")}
          id="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>Loading...</>
        ) : (
          <>{isRegister ? "Sign Up" : "Sign In"}</>
        )}
      </Button>
      <Button
        type="button"
        variant="link"
        className="w-full"
        disabled={isLoading}
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister ? "Already have an account?" : "Don't have an account?"}
      </Button>
    </form>
  );
};

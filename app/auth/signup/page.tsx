"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { signupSchema } from "@/schemas/signupSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";

type FormState = z.infer<typeof signupSchema>;

export default function SignUp() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form input using Zod
    const result = signupSchema.safeParse(form);
    if (!result.success) {
      // Map Zod issues to a simpler error object
      const fieldErrors: Partial<FormState> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormState] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    // Clear previous errors if valid
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const result = await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });
        if (result?.ok) {
          // Successful login after signup
        setLoading(false)
        // Force full page reload to ensure session is loaded
        window.location.href = "/chat"

        } else {
          setErrors({ email: "Sign in failed after sign up"+ result?.error });
          console.error("Sign in failed after sign up", result);
        }
      } else {
        // Sign up failed
        setLoading(false);
        setErrors({ email: "Sign up failed. Please try again."+ await response.text() });
        console.error("Sign up failed:", await response.text());
      }
    } catch (error) {
      setLoading(false);
      setErrors({ email: "An unexpected error occurred during sign up" });
      console.error("An unexpected error occurred during sign up:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-400 to-blue-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                type="text"
                id="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1"
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            </div>
            <CardFooter className="px-0 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
        <div className="text-center mt-4 pb-4">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}

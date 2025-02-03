"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiKeySchema } from "@/schemas/apiKey";



export default function Settings() {
  const [loading, setLoading] = useState(false);

  // React Hook Form with Zod
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{ apiKey: string }>({
    resolver: zodResolver(apiKeySchema),
  });

  const onSubmit = async (data: { apiKey: string }) => {
    setLoading(true);

    try {
      const response = await fetch("/api/update-gemini-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();

      if (response.ok) {
        setValue("apiKey", ""); // Clear input after success
        toast({
          title: "API Key Updated",
          description: "Your API key has been successfully updated.",
        });
      } else {
        toast({
          title: "Error",
          description: responseData.error || "Failed to update API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-400 to-blue-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Settings: Use Gemini Api Key</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <Input
                  type="password"
                  id="apiKey"
                  placeholder="Enter your API key"
                  {...register("apiKey")}
                  className="mt-1"
                  disabled={loading}
                />
                {errors.apiKey && (
                  <p className="text-red-500 text-sm mt-1">{errors.apiKey.message}</p>
                )}
              </div>
            </div>
            <CardFooter className="px-0 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

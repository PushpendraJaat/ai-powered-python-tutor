"use client";

import { useState, useEffect, useRef, useCallback, FormEvent, ChangeEvent, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { v4 as uuidv4 } from "uuid";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface Tutor {
  name: string;
  image: string;
  greeting: string;
  style: string;
}

const tutors: Tutor[] = [
  {
    name: "Cody the Coder Cat",
    image:
      "https://img.freepik.com/free-vector/cute-cat-working-laptop-cartoon-icon-illustration_138676-2815.jpg?w=740",
    greeting:
      "Meow! I'm Cody, your playful coding cat, ready to pounce on Python problems!",
    style: "fun, playful, and full of witty cat puns",
  },
  {
    name: "Sara the Software Engineer",
    image:
      "https://img.freepik.com/free-vector/cartoon-businesswoman-working-with-laptop-gesture-pose-clip-art_40876-3410.jpg?w=996",
    greeting:
      "Hello! I'm Sara, a software engineer who loves to help others learn to code.",
    style: "professional, patient, and encouraging",
  },
  {
    name: "Pablo the Python Pro",
    image:
      "https://img.freepik.com/free-vector/hacker-operating-laptop-cartoon-icon-illustration-technology-icon-concept-isolated-flat-cartoon-style_138676-2387.jpg?w=740",
    greeting:
      "Hola! I'm Pablo, a Python pro here to help you with all your coding needs.",
    style: "friendly, helpful, and fluent in Python",
  },
];

const Chat: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor>(tutors[0]);
  const [progress, setProgress] = useState<Record<string, number>>({
    "Python Basics": 0,
    "Data Structures": 0,
    "Algorithms": 0,
  });
  const [badges, setBadges] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = session?.user?.id;

  // Memoize tutor buttons to prevent unnecessary re-renders
  const tutorButtons = useMemo(
    () =>
      tutors.map((tutor) => (
        <Button
          key={tutor.name}
          variant={selectedTutor.name === tutor.name ? "default" : "outline"}
          onClick={() => setSelectedTutor(tutor)}
          className="flex items-center space-x-2 p-1"
        >
          <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
            <AvatarImage src={tutor.image} alt={tutor.name} />
            <AvatarFallback>{tutor.name[0]}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline pr-4">{tutor.name}</span>
        </Button>
      )),
    [selectedTutor.name]
  );

  // Scroll to bottom of chat window
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  // Load chat history when userId or selectedTutor changes
  const loadChatHistory = useCallback(async () => {
    if (!userId || !selectedTutor.name) return;
    try {
      const response = await fetch(
        `/api/get-chat-history?userId=${userId}&tutorName=${selectedTutor.name}`
      );
      const data = await response.json();
      if (data.messages) {
        setMessages((prev) => ({
          ...prev,
          [selectedTutor.name]: data.messages,
        }));
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, [userId, selectedTutor.name]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Update progress (example logic)
  const updateProgress = useCallback(
    (lesson: string) => {
      setProgress((prev) => {
        const newProgress = { ...prev };
        newProgress[lesson] = Math.min(prev[lesson] + 10, 100);
        // Badge logic can be added here (if any)
        return newProgress;
      });
    },
    []
  );

  // Handle chat submission using functional state updates
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    // Create messages for user and temporary assistant "thinking" reply
    const userMessage: Message = { role: "user", content: input, id: uuidv4() };
    const thinkingMessage: Message = { role: "assistant", content: "Tutor is thinking...", id: uuidv4() };

    // Update messages optimistically using the latest state
    setMessages((prev) => {
      const currentMessages = prev[selectedTutor.name] || [];
      return {
        ...prev,
        [selectedTutor.name]: [...currentMessages, userMessage, thinkingMessage],
      };
    });
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          messages: messages[selectedTutor.name] || [],
          tutorName: selectedTutor.name,
          tutorGreeting: selectedTutor.greeting,
          tutorStyle: selectedTutor.style,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      // Remove the temporary "thinking" message and add the assistant reply
      setMessages((prev) => {
        const currentMessages = prev[selectedTutor.name] || [];
        const filteredMessages = currentMessages.filter((m) => m.id !== thinkingMessage.id);
        return {
          ...prev,
          [selectedTutor.name]: [
            ...filteredMessages,
            { role: "assistant", content: data.content, id: uuidv4() },
          ],
        };
      });

      // Optionally update progress if indicated by the API response
      if (data.shouldUpdateProgress) {
        updateProgress("Python Basics");
      }
    } catch (error) {
      console.error("Error:", error);
      // Remove the temporary message if an error occurs
      setMessages((prev) => {
        const currentMessages = prev[selectedTutor.name] || [];
        return {
          ...prev,
          [selectedTutor.name]: currentMessages.filter((m) => m.id !== thinkingMessage.id),
        };
      });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // Memoize chat messages rendering
  const chatMessages = useMemo(
    () =>
      (messages[selectedTutor.name] || []).map((m) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}
        >
          <span
            className={`inline-block p-2 rounded-lg ${
              m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {m.content}
            </ReactMarkdown>
          </span>
        </motion.div>
      )),
    [messages, selectedTutor.name]
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-400 to-blue-500 p-4"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedTutor.image} alt={selectedTutor.name} />
                <AvatarFallback>{selectedTutor.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-lg font-semibold">{selectedTutor.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="text-sm text-white">
                Progress: <strong>{JSON.stringify(progress)}</strong>
              </div>
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs"
                >
                  {badge}
                </span>
              ))}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="h-[60vh] overflow-y-auto relative">
          {chatMessages}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send"
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>

      <div className="flex space-x-2 mt-4 overflow-x-auto">
        {tutors.map((tutor) => (
          <Button
            key={tutor.name}
            variant={selectedTutor.name === tutor.name ? "default" : "outline"}
            onClick={() => setSelectedTutor(tutor)}
            className="flex items-center space-x-2 p-1"
          >
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
              <AvatarImage src={tutor.image} alt={tutor.name} />
              <AvatarFallback>{tutor.name[0]}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline pr-4">{tutor.name}</span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default Chat;

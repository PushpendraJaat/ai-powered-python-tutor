"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      "https://img.freepik.com/free-vector/cute-cat-working-laptop-cartoon-icon-illustration_138676-2815.jpg?t=st=1738421836~exp=1738425436~hmac=c586d963bae50bd9173b63925035303e8b14d4d0dbc4c8e44326a43d5841f340&w=740",
    greeting:
      "Meow! I'm Cody, your playful coding cat, ready to pounce on Python problems!",
    style: "fun, playful, and full of witty cat puns",
  },
  {
    name: "Sara the Software Engineer",
    image:
      "https://img.freepik.com/free-vector/cartoon-businesswoman-working-with-laptop-gesture-pose-clip-art_40876-3410.jpg?t=st=1738421655~exp=1738425255~hmac=3e127f9e2291bb8260f69df2b05b0efd5942badb325da212cfbfc0711ce3179e&w=996",
    greeting:
      "Hello! I'm Sara, a software engineer who loves to help others learn to code.",
    style: "professional, patient, and encouraging",
  },
  {
    name: "Pablo the Python Pro",
    image:
      "https://img.freepik.com/free-vector/hacker-operating-laptop-cartoon-icon-illustration-technology-icon-concept-isolated-flat-cartoon-style_138676-2387.jpg?t=st=1738421649~exp=1738425249~hmac=6d26c64793ab32dab950815a58910582b8b28adc19f4d4c9b2c43e3328bae0b1&w=740",
    greeting:
      "Hola! I'm Pablo, a Python pro here to help you with all your coding needs.",
    style: "friendly, helpful, and fluent in Python",
  },
];

const Chat: React.FC = () => {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor>(tutors[0]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const userId = session?.user?.id;

  console.log("userid chat", userId)

  // Show a full-page loader if session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  // When the selected tutor changes (or on mount), fetch chat history from the database
  const loadChatHistory = async () => {
    if (!userId || !selectedTutor.name) return;
  
    try {
      const response = await fetch(
        `/api/get-chat-history?userId=${userId}&tutorName=${selectedTutor.name}`
      );
  
      const data = await response.json();
  
      // Check if the messages exist inside the 'data' object
      if (data && data.data && Array.isArray(data.data.messages)) {
        setMessages((prev) => ({
          ...prev,
          [selectedTutor.name]: data.data.messages,
        }));
      } else {
        console.error("Invalid message format:", data);
        setMessages((prev) => ({
          ...prev,
          [selectedTutor.name]: [],
        }));
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };
  
  

  useEffect(() => {
    if (!userId) return;

    // Only run loadChatHistory if userId is available and selectedTutor has changed
    loadChatHistory();
  }, [selectedTutor, userId]);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle chat submission with optimistic UI update and DB storage via the API
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input, id: uuidv4() };
    const thinkingMessage: Message = { role: "assistant", content: "Tutor is thinking...", id: uuidv4() };

    const currentHistory = messages[selectedTutor.name] || [];
    const updatedMessages = [...currentHistory, userMessage];

    setMessages((prev) => ({
      ...prev,
      [selectedTutor.name]: [...updatedMessages, thinkingMessage],
    }));

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          messages: updatedMessages,
          tutorName: selectedTutor.name,
          tutorGreeting: selectedTutor.greeting,
          tutorStyle: selectedTutor.style,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unexpected error occurred");

      setMessages((prev) => ({
        ...prev,
        [selectedTutor.name]: [
          ...updatedMessages,
          { role: "assistant", content: data.content || "No response received", id: uuidv4() },
        ],
       
      }));
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => ({
        ...prev,
        [selectedTutor.name]: (prev[selectedTutor.name] || []).filter(
          (m) => m.content !== "Tutor is thinking..."
        ),
      }));
    } finally {
      setIsLoading(false);
    }
  };

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
          </CardTitle>
        </CardHeader>

        <CardContent className="h-[60vh] overflow-y-auto relative">
          {(messages[selectedTutor.name] || []).map((m) => (
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
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {m.content}
                </ReactMarkdown>
              </span>
            </motion.div>
          ))}
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
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

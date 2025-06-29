"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles, Leaf } from "lucide-react";
import { Product } from "@/lib/products";
import { ProductCard } from "./product-card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  timestamp: Date;
  suggestions?: string[];
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your EcoSage assistant. Tell me what you're looking for and I'll help you find the perfect sustainable product.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const uniqueId = useCallback(
    () => Math.random().toString(36).substring(2, 9),
    []
  );

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessageWithText = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setMessages((prev) => [
        ...prev,
        {
          id: uniqueId(),
          role: "user",
          content: text,
          timestamp: new Date(),
        },
      ]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });

        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: uniqueId(),
            role: "assistant",
            content: data.content || "Sorry, no response.",
            products: data.products || [],
            suggestions: data.suggestions || [],
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: uniqueId(),
            role: "assistant",
            content: "Sorry, I couldn't get a response right now.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, uniqueId]
  );

  const handleSendMessage = useCallback(() => {
    handleSendMessageWithText(input);
  }, [input, handleSendMessageWithText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-forest-500 to-sage-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span>EcoSage AI Assistant</span>
          <Badge
            variant="secondary"
            className="ml-auto bg-white/20 text-white border-white/30"
          >
            <Leaf className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div
          ref={containerRef}
          className="chat-messages-container space-y-4 mb-6 max-h-[60vh] overflow-y-auto"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  message.role === "assistant"
                    ? "bg-forest-100 text-forest-600"
                    : "bg-sandy-100 text-sandy-600"
                }`}
              >
                {message.role === "assistant" ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>

              <div
                className={`flex-1 max-w-sm ${
                  message.role === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`chat-bubble max-h-72 overflow-y-auto ${
                    message.role === "user"
                      ? "bg-sandy-100 border-sandy-200"
                      : "bg-white border-gray-200"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  <p className="text-sm">{message.content.trim()}</p>
                </div>

                {message.products && message.products.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {message.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      You might also ask:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            !isLoading && handleSendMessageWithText(suggestion)
                          }
                          className="text-xs px-3 py-1 bg-forest-50 hover:bg-forest-100 text-forest-700 rounded-full border border-forest-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div key="loading" className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-100 text-forest-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="chat-bubble">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-forest-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-forest-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-forest-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about sustainable products..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-forest-500 hover:bg-forest-600 text-white"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

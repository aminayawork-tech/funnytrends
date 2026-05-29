"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import TrendInput from "@/components/TrendInput";
import ComedyOutput from "@/components/ComedyOutput";
import ChatBar from "@/components/ChatBar";
import QuickSuggestions from "@/components/QuickSuggestions";
import HotTopics from "@/components/HotTopics";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [activeTopic, setActiveTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  const hasContent = messages.length > 0 || streaming;

  const generate = async (userMessage: string, isNewTopic = false) => {
    if (streaming) return;

    const newMessages: Message[] = isNewTopic
      ? [{ role: "user", content: `Generate comedy material for this trending topic: "${userMessage}"` }]
      : [...messages, { role: "user", content: userMessage }];

    if (isNewTopic) {
      setMessages([]);
      setActiveTopic(userMessage);
    } else {
      setMessages(newMessages);
    }

    setStreaming(true);
    setCurrentStream("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: isNewTopic ? userMessage : activeTopic,
          messages: newMessages,
          mode: isNewTopic ? "new" : "chat",
        }),
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setCurrentStream(full);
      }

      const assistantMessage: Message = { role: "assistant", content: full };
      setMessages(
        isNewTopic
          ? [
              { role: "user", content: `Generate comedy material for this trending topic: "${userMessage}"` },
              assistantMessage,
            ]
          : [...newMessages, assistantMessage]
      );
      setCurrentStream("");
    } finally {
      setStreaming(false);
    }
  };

  const handleTopicSubmit = (t: string) => {
    if (!t.trim()) return;
    generate(t, true);
  };

  const handleChatMessage = (msg: string) => {
    generate(msg, false);
  };

  const handleSuggestion = (suggestion: string) => {
    generate(suggestion, false);
  };

  const handleReset = () => {
    setActiveTopic("");
    setMessages([]);
    setCurrentStream("");
  };

  useEffect(() => {
    if (streaming && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [currentStream, streaming]);

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto">
      <Header onReset={hasContent ? handleReset : undefined} />

      <main className="flex-1 flex flex-col px-4 pb-4">
        {!hasContent ? (
          <div className="flex-1 flex flex-col justify-center gap-6 py-8">
            <div className="text-center">
              <div className="text-5xl mb-3">🎤</div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                What&apos;s trending?
              </h2>
              <p className="text-gray-500 text-sm">
                Drop a topic and we&apos;ll turn it into killer material.
              </p>
            </div>
            <TrendInput onSubmit={handleTopicSubmit} loading={streaming} />
            <HotTopics onSelect={handleTopicSubmit} />

          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#FFF3E8] border border-[#FFDDB8] rounded-full px-4 py-2">
                <span className="text-lg">🔥</span>
                <span className="font-semibold text-[#FF6B00] text-sm truncate">
                  {activeTopic}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors whitespace-nowrap"
              >
                New topic
              </button>
            </div>

            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto scrollbar-hide"
            >
              <ComedyOutput
                messages={messages}
                streamingContent={currentStream}
                streaming={streaming}
              />
            </div>

            {!streaming && messages.length > 0 && (
              <QuickSuggestions onSelect={handleSuggestion} />
            )}

            <ChatBar onSend={handleChatMessage} loading={streaming} />
          </div>
        )}
      </main>
    </div>
  );
}


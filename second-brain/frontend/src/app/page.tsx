
"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/ChatMessage"

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: any[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Add placeholder for assistant message
    const assistantMessage: Message = { role: "assistant", content: "" }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
          mode: "hybrid"
        }),
      })

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText || 'Unknown error'}`);
      }
      
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      let assistantSources: any[] = []
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        const lines = buffer.split("\n\n")
        // The last part might be incomplete, so keep it in buffer
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6)
            if (dataStr === "[DONE]") continue

            try {
              const data = JSON.parse(dataStr)
              
              if (data.type === "chunk") {
                assistantContent += data.content
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg.role === "assistant") {
                    lastMsg.content = assistantContent
                  }
                  return newMessages
                })
              } else if (data.type === "sources") {
                assistantSources = data.sources
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg.role === "assistant") {
                    lastMsg.sources = assistantSources
                  }
                  return newMessages
                })
              } else if (data.type === "error") {
                console.error("Error from backend:", data.content)
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg.role === "assistant") {
                    lastMsg.content = `Error: ${data.content}`
                  }
                  return newMessages
                })
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e)
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error:", error)
      
      let errorMessage = "Sorry, I encountered an error processing your request.";
      
      if (error.message?.includes("Failed to fetch")) {
        errorMessage = "**Connection Failed**: I cannot reach the backend server. Please ensure the backend is running on port 8000.";
      } else if (error.message?.includes("Server Error")) {
        errorMessage = `**Backend Error**: ${error.message}. \n\nThis usually means **Ollama** is not running or the model is missing.\n\nPlease:\n1. Install Ollama from [ollama.com](https://ollama.com)\n2. Run \`ollama serve\`\n3. Run \`ollama pull llama3.2\``;
      }

      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: errorMessage }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background pointer-events-none" />
      
      <ScrollArea className="flex-1 p-4 relative z-10">
        <div className="mx-auto max-w-3xl space-y-8 pb-4">
          {messages.length === 0 && (
            <div className="flex h-[60vh] flex-col items-center justify-center text-center text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="h-20 w-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 rotate-3 hover:rotate-6 transition-transform">
                <span className="text-4xl font-bold text-white">M</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent mb-3">Mostishko</h1>
              <p className="max-w-md text-lg text-zinc-400">Your personal second brain. Ask questions, explore connections, and manage your knowledge.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-white/5 bg-background/80 backdrop-blur-xl p-6 relative z-20">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="relative flex gap-3 items-end bg-zinc-900/50 p-2 rounded-2xl border border-white/10 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-lg">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 min-h-[50px] text-base px-4 py-3"
              disabled={isLoading}
            />
            <Button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 w-10 p-0 shrink-0 mb-1 mr-1 transition-all shadow-lg shadow-blue-600/20"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">Powered by Llama 3 Local</p>
          </div>
        </div>
      </div>
    </div>
  )
}

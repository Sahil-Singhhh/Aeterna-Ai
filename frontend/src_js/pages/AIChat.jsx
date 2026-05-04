import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  User,
  Send,
  ShieldAlert,
  Sparkles,
  Loader2,
  Mic,
  Image as ImageIcon,
  Volume2,
  X,
  Square,
} from "lucide-react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am Aeterna's Medical AI Assistant. Please describe any symptoms, specify a disease, or upload a relevant image. You can also use voice input. Remember, I am an AI and this is not a substitute for professional medical advice.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, selectedImage]);

  // Voice output
  const speakMessage = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  // Voice input
  const toggleListen = () => {
    // @ts-ignore
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Speech Recognition is not supported in this browser. Please use Chrome/Edge.",
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      // Get the latest transcript segment
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setInput((prev) =>
          prev
            ? prev.trim() + " " + finalTranscript.trim()
            : finalTranscript.trim(),
        );
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date(),
      image: selectedImage || undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text || "Please analyze this image.",
          image_base64: imageToSend,
        }),
      });
      const data = await res.json();
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply || "I couldn't process that. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      // The AI will not automatically speak. The user must click the speaker icon manually.
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Error connecting to the Aeterna servers. Please make sure the backend is running.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05070A] p-2 md:p-6 pb-20 md:pb-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF0055]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00F2FF]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 mb-6 relative z-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF0055] to-[#7000FF] flex items-center justify-center shadow-[0_0_30px_rgba(255,0,85,0.3)]">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            AI Health Assistant
            <Sparkles className="w-5 h-5 text-[#00F2FF]" />
          </h1>
          <p className="text-white/50 text-sm">
            Vision, Voice, Disease suggestions & Precautions
          </p>
        </div>
      </motion.div>

      {/* Warning Banner */}
      <div className="mb-4 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-xl p-3 flex gap-3 items-start relative z-10">
        <ShieldAlert className="w-5 h-5 text-[#FF4D4D] shrink-0 mt-0.5" />
        <p className="text-xs text-[#FF4D4D]/90">
          This AI is for informational purposes only. Do not use this as a
          replacement for actual medical diagnosis or professional treatment.
          Always consult a qualified healthcare provider.
        </p>
      </div>

      <div className="flex-1 glassmorphism rounded-3xl border border-white/5 p-4 flex flex-col relative z-10 min-h-0">
        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar flex flex-col">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.sender === "user"
                      ? "bg-[#00F2FF]/20 text-[#00F2FF]"
                      : "bg-[#FF0055]/20 text-[#FF0055]"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl flex flex-col gap-2 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-[#00F2FF]/20 to-[#00F2FF]/5 border border-[#00F2FF]/20 text-white rounded-tr-sm"
                      : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="User upload"
                      className="max-w-full h-auto rounded-lg mb-2 max-h-48 object-cover border border-white/10"
                    />
                  )}
                  {msg.text && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.text}
                    </p>
                  )}

                  {msg.sender === "ai" && (
                    <button
                      onClick={() => speakMessage(msg.text)}
                      className="self-end mt-1 text-white/40 hover:text-[#00F2FF] transition-colors p-1"
                      title="Read aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex gap-3 flex-row max-w-[85%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-[#FF0055]/20 text-[#FF0055]">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/90 rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF0055]" />
                  <span className="text-sm">Aeterna AI is analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 w-full">
          {/* Image Preview */}
          {selectedImage && (
            <div className="relative inline-block w-max">
              <img
                src={selectedImage}
                alt="Preview"
                className="h-20 w-auto rounded-md border border-white/20 object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-[#FF4D4D] text-white rounded-full p-1 hover:bg-red-600 shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex gap-2 w-full items-end">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all"
              title="Upload image"
            >
              <ImageIcon className="w-5 h-5 text-white/70" />
            </button>
            <button
              onClick={toggleListen}
              className={`p-3 border rounded-xl transition-all ${
                isListening
                  ? "bg-[#FF0055]/20 border-[#FF0055]/50 text-[#FF0055] animate-pulse"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
              }`}
              title={isListening ? "Stop Recording" : "Record Voice"}
            >
              {isListening ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                isListening
                  ? "Listening... Speak now!"
                  : "Type symptoms or upload an image..."
              }
              className={`flex-1 bg-black/40 border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none transition-all text-sm ${
                isListening
                  ? "border-[#FF0055]/50 shadow-[0_0_15px_rgba(255,0,85,0.2)]"
                  : "border-white/10 focus:border-[#00F2FF]/50 focus:ring-1 focus:ring-[#00F2FF]/50"
              }`}
            />

            {!isListening && (
              <button
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="bg-gradient-to-br from-[#FF0055] to-[#7000FF] p-3 rounded-xl flex items-center justify-center disabled:opacity-50 transition-opacity"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

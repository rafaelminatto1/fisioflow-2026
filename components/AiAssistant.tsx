
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { SparklesIcon, XIcon, BrainCircuitIcon } from './Icons';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Olá! Sou a IA do FisioFlow. Como posso ajudar na gestão da sua clínica hoje?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Convert history to Gemini format
      // Note: We intentionally exclude the very last user message we just added locally 
      // from the history array passed to create(), because standard practice is to 
      // pass history *prior* to the new message.
      const history = messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
      }));

      const chat: Chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: "Você é o assistente virtual inteligente do FisioFlow, um sistema de gestão para clínicas de fisioterapia e saúde. " +
            "Seus objetivos são: auxiliar na gestão da clínica, tirar dúvidas sobre funcionalidades, sugerir protocolos de tratamento baseados em evidência científica, ajudar na análise de indicadores financeiros e criar textos para comunicação com pacientes. " +
            "Mantenha um tom profissional, empático e objetivo. Use formatação Markdown (listas, negrito) para estruturar suas respostas. Responda sempre em Português do Brasil.",
        },
      });

      const resultStream = await chat.sendMessageStream({ message: userMsg.text });
      
      // Stop loading spinner and add an empty message for the model to stream into
      setIsLoading(false);
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);

      let fullText = '';
      for await (const chunk of resultStream) {
          const text = chunk.text;
          if (text) {
              fullText += text;
              setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullText } : m));
          }
      }
      
    } catch (error) {
      console.error("AI Error:", error);
      setIsLoading(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Desculpe, não consegui processar sua solicitação no momento. Verifique sua conexão ou tente novamente." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div className={`
        bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 mb-4 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 hidden'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <BrainCircuitIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm leading-tight">FisioFlow AI</h3>
                    <p className="text-[10px] opacity-80">Assistente Virtual (Pro)</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <XIcon className="w-5 h-5" />
            </button>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                        max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed whitespace-pre-wrap
                        ${msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}
                    `}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pergunte algo..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
            />
            <button 
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center hover:scale-105 active:scale-95"
            >
                <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
        </form>
      </div>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            group flex items-center justify-center w-14 h-14 rounded-full shadow-xl hover:scale-110 transition-all duration-300 pointer-events-auto relative
            ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}
        `}
      >
        {isOpen ? (
            <XIcon className="w-6 h-6" />
        ) : (
            <>
                <SparklesIcon className="w-7 h-7 absolute opacity-100 group-hover:opacity-0 transition-opacity duration-300 scale-100 group-hover:scale-50" />
                <BrainCircuitIcon className="w-7 h-7 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-50 group-hover:scale-100" />
            </>
        )}
      </button>
    </div>
  );
};

export default AiAssistant;

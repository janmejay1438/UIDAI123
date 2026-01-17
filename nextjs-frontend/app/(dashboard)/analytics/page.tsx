"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts';

export default function Home() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'system', content: "Hello! I'm your UIDAI Analytics Assistant. Ask me anything about the enrollment data." }
  ]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const res = await axios.post(`${API_URL}/api/ask`, {
        question: userMsg.content,
        api_key: apiKey
      });

      const data = res.data;

      let aiContent: any = {
        role: 'assistant',
        content: "Here is what I found:",
        data: data.result,
        code: data.generated_code,
        type: data.type
      };

      if (data.error) {
        aiContent = { role: 'assistant', content: `Error: ${data.error}`, isError: true };
      }

      setMessages(prev => [...prev, aiContent]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Connection Failed";
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMsg}`, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen max-w-6xl mx-auto p-4 md:p-8">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          UIDAI Analytics <span className="text-white text-lg font-light opacity-70">| Text-to-Code Engine</span>
        </h1>
        <div className="flex gap-2">
          <input
            type="password"
            placeholder="Gemini API Key (Optional)"
            className="glass px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
      </motion.header>

      {/* Chat Area */}
      <section className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-6 ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'glass text-gray-100 rounded-bl-none border border-white/10'
                }`}>
                {msg.isError ? (
                  <div className="text-red-400 font-mono text-sm">{msg.content}</div>
                ) : (
                  <>
                    <p className="text-lg mb-2">{msg.content}</p>

                    {/* Visualization Block */}
                    {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                      <div className="mt-4 h-64 w-full bg-black/20 rounded-xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={msg.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis
                              dataKey={Object.keys(msg.data[0]).find(k => typeof msg.data[0][k] === 'string') || Object.keys(msg.data[0])[0]}
                              stroke="#888"
                              tick={{ fill: '#ddd' }}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis stroke="#888" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                            <Bar
                              dataKey={Object.keys(msg.data[0]).find(k => typeof msg.data[0][k] === 'number') || Object.keys(msg.data[0])[1]}
                              fill="url(#colorGradient)"
                              radius={[4, 4, 0, 0]}
                            >
                              {msg.data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][index % 4]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Single Value or Raw Data Display */}
                    {msg.data && !Array.isArray(msg.data) && (
                      <div className="mt-4 p-4 bg-black/30 rounded-lg font-mono text-green-400">
                        <pre>{JSON.stringify(msg.data, null, 2)}</pre>
                      </div>
                    )}

                    {/* Code Toggle (Mini) */}
                    {msg.code && (
                      <details className="mt-4 text-xs text-gray-500 cursor-pointer">
                        <summary className="hover:text-blue-400 transition-colors">View Generated Python Code</summary>
                        <pre className="mt-2 p-3 bg-black/50 rounded-md overflow-x-auto text-gray-300 font-mono">
                          {msg.code}
                        </pre>
                      </details>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass px-6 py-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </section>

      {/* Input Area */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          className="w-full glass py-4 pl-6 pr-16 text-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all rounded-full shadow-lg"
          placeholder="Ask a question about the data (e.g., 'Top 3 districts in Bihar')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !query}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>

    </main>
  );
}

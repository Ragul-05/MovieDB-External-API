import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { aiService } from '../services/api';

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: 'Hi, I can help with movie suggestions, genres, actors, or what to watch next.',
        },
    ]);

    const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

    const handleSend = async () => {
        if (!canSend) return;

        const prompt = input.trim();
        const userMessage = { id: Date.now(), role: 'user', content: prompt };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiService.chat(prompt);
            const reply = sanitizeAssistantReply(response.data?.response);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: reply,
                },
            ]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: 'AI chat is temporarily unavailable. Please try again in a moment.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        className="fixed bottom-24 right-6 z-[70] flex h-[560px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between bg-primary px-5 py-4 text-white">
                            <div className="flex items-center">
                                <Sparkles size={18} className="mr-2" />
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-blue-100">AI Assistant</p>
                                    <h3 className="text-lg font-extrabold">Movie Chat</h3>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="rounded-full p-2 transition hover:bg-white/10">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                        message.role === 'user'
                                            ? 'ml-auto bg-primary text-white'
                                            : 'bg-white text-slate-700'
                                    }`}
                                >
                                    <span className="whitespace-pre-line">{message.content}</span>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="inline-flex items-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-500 shadow-sm">
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Thinking...
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 bg-white p-4">
                            <div className="flex items-end gap-3">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask for recommendations, genres, actors..."
                                    rows={2}
                                    className="min-h-[52px] flex-1 resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm text-dark ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-primary"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!canSend}
                                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen((prev) => !prev)}
                className="fixed bottom-6 right-6 z-[70] inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-blue-200"
                title="Open AI chat assistant"
            >
                <MessageCircle size={26} />
            </motion.button>
        </>
    );
};

const sanitizeAssistantReply = (text) => {
    if (!text) {
        return 'I could not generate a reply right now.';
    }

    const normalized = text.toLowerCase();
    if (
        normalized.includes('quota exceeded') ||
        normalized.includes('error calling ai service') ||
        normalized.includes('too many requests') ||
        normalized.includes('resource_exhausted') ||
        normalized.includes('https://generativelanguage.googleapis.com') ||
        normalized.includes('<eol>') ||
        normalized.includes('"message"')
    ) {
        return "I can't reach the AI service right now. Try again shortly, or ask me something simpler.";
    }

    return formatAssistantReply(text);
};

const formatAssistantReply = (text) => {
    const cleaned = text
        .replace(/\r/g, '')
        .replace(/\*\*/g, '')
        .replace(/__+/g, '')
        .replace(/`+/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .trim();

    const lines = cleaned
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/^[-*•]+\s*/, ''));

    const numberedLines = [];
    let listIndex = 1;

    for (const line of lines) {
        if (/^\d+[.)]\s*/.test(line)) {
            numberedLines.push(line.replace(/^(\d+)[.)]\s*/, '$1. '));
            const matched = line.match(/^(\d+)/);
            listIndex = matched ? Number(matched[1]) + 1 : listIndex;
            continue;
        }

        if (looksLikeMovieLine(line)) {
            numberedLines.push(`${listIndex}. ${line}`);
            listIndex += 1;
            continue;
        }

        numberedLines.push(line);
    }

    return numberedLines.join('\n');
};

const looksLikeMovieLine = (line) => {
    const normalized = line.toLowerCase();
    return !normalized.startsWith('here')
        && !normalized.startsWith('why')
        && !normalized.startsWith('because')
        && !normalized.startsWith('these')
        && !normalized.startsWith('gemini')
        && line.length <= 140;
};

export default ChatWidget;

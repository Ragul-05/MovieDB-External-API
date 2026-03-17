import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { aiService } from '../services/api';

const AISummary = ({ imdbId, plot }) => {
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            if (!imdbId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await aiService.getSummary(imdbId);
                const data = response.data;
                const safeSummary = isSafeAiText(data?.summary) ? formatSummaryText(data.summary) : simplifyPlot(plot);
                setSummary(safeSummary);
                setTags(extractSafeTags(data?.tags));
                if (!isSafeAiText(data?.summary)) {
                    setError('AI summary is unavailable right now.');
                }
            } catch (err) {
                setError('AI summary is unavailable right now.');
                setSummary(simplifyPlot(plot));
                setTags([]);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [imdbId, plot]);

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-blue-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm"
        >
            <div className="mb-4 flex items-center text-blue-900">
                <Sparkles size={18} className="mr-2" />
                <h3 className="text-xl font-extrabold">AI Summary</h3>
            </div>

            {loading ? (
                <div className="flex items-center text-sm font-medium text-blue-700">
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating simplified summary...
                </div>
            ) : (
                <>
                    <p className="whitespace-pre-line text-base leading-7 text-slate-700">{summary || 'No AI summary available.'}</p>
                    {tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {error && <p className="mt-3 text-sm font-medium text-amber-600">{error}</p>}
                </>
            )}
        </motion.section>
    );
};

const simplifyPlot = (plot) => {
    if (!plot || plot === 'N/A') return 'Plot summary is not available.';
    const cleaned = plot.trim();
    if (cleaned.length <= 220) return cleaned;
    return `${cleaned.slice(0, 217).trim()}...`;
};

const formatSummaryText = (text) => {
    if (!text) return '';

    const withoutMarkdown = text
        .replace(/\*\*/g, '')
        .replace(/__+/g, '')
        .replace(/`+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const withoutInlineTags = withoutMarkdown
        .replace(/tags\s*:\s*\d+\./i, '')
        .replace(/tags\s*:/i, '')
        .trim();

    const sentenceParts = withoutInlineTags
        .split(/(?<=\.)\s+(?=\d+\.)/)
        .map((part) => part.trim())
        .filter(Boolean);

    return sentenceParts.join('\n');
};

const isSafeAiText = (text) => {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return !normalized.includes('quota exceeded')
        && !normalized.includes('error calling ai service')
        && !normalized.includes('too many requests')
        && !normalized.includes('resource_exhausted')
        && !normalized.includes('https://')
        && !normalized.includes('<eol>');
};

const extractSafeTags = (tags) => {
    if (!tags || !isSafeAiText(tags)) return [];

    return tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .filter((tag) => tag.length <= 24)
        .slice(0, 5);
};

export default AISummary;

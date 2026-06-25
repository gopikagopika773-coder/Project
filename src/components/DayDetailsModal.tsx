import React, { useState } from 'react';
import { CalendarDay } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  Clock, 
  Layers, 
  Sparkles, 
  Image, 
  MessageSquare, 
  Compass, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { getContentTypeBadgeStyles } from '../constants';

interface DayDetailsModalProps {
  day: CalendarDay;
  niche: string;
  tone: string;
  onClose: () => void;
  onUpdateDay: (updatedDay: CalendarDay) => void;
}

export default function DayDetailsModal({ 
  day, 
  niche,
  tone,
  onClose, 
  onUpdateDay 
}: DayDetailsModalProps) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedVisual, setCopiedVisual] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const copyCaption = () => {
    navigator.clipboard.writeText(day.captionIdea);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const copyVisual = () => {
    navigator.clipboard.writeText(day.visualPrompt);
    setCopiedVisual(true);
    setTimeout(() => setCopiedVisual(false), 2000);
  };

  const copyAllHashtags = () => {
    navigator.clipboard.writeText(day.suggestedHashtags.join(' '));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const handleRefineDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim()) return;

    setIsRefining(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/refine-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayContent: day,
          instruction: refineText,
          niche,
          tone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refine post');
      }

      const updatedDay: CalendarDay = await response.json();
      onUpdateDay(updatedDay);
      setRefineText('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while refining this day.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-slide-in">
      {/* Drawer Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold block">
            Day {day.dayNumber} Focus Dashboard
          </span>
          <h3 className="text-lg font-bold text-slate-800 mt-1">{day.dayName}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Format</span>
            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getContentTypeBadgeStyles(day.contentType)}`}>
              {day.contentType}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Best Posting Time</span>
            <span className="text-xs font-bold font-mono text-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {day.bestPostingTime}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Key Objective</span>
            <span className="text-xs font-bold text-slate-700 block truncate">
              {day.keyObjective}
            </span>
          </div>
        </div>

        {/* Topic Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">Post Topic / Title</span>
          <h4 className="text-base font-bold leading-snug">{day.topic}</h4>
        </div>

        {/* Caption Idea Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Copywriting & Caption
            </label>
            <button
              onClick={copyCaption}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                copiedCaption 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCaption ? 'Copied' : 'Copy Caption'}
            </button>
          </div>
          <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4.5 font-sans text-sm text-slate-700 whitespace-pre-line leading-relaxed min-h-36">
            {day.captionIdea}
          </div>
        </div>

        {/* Suggested Hashtags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
              <Compass className="w-4 h-4 text-purple-500" />
              Specific Suggested Hashtags
            </label>
            <button
              onClick={copyAllHashtags}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                copiedHashtags 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {copiedHashtags ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHashtags ? 'Copied' : 'Copy All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200/40 p-3 rounded-xl">
            {day.suggestedHashtags.map((tag, i) => (
              <span 
                key={i} 
                className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-600"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>

        {/* Visual Creative Direction */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
              <Image className="w-4 h-4 text-pink-500" />
              Visual Creative Direction (Prompt)
            </label>
            <button
              onClick={copyVisual}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                copiedVisual 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {copiedVisual ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedVisual ? 'Copied' : 'Copy Prompt'}
            </button>
          </div>
          <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 font-mono text-xs text-slate-600 leading-relaxed italic">
            {day.visualPrompt}
          </div>
        </div>
      </div>

      {/* Drawer Footer - Interactive per-day fine-tuning form */}
      <div className="p-5 border-t border-slate-100 bg-slate-50">
        <form onSubmit={handleRefineDay} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI Assistant: Customize or Refine this post
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={refineText}
              onChange={e => setRefineText(e.target.value)}
              placeholder="e.g. 'Make it shorter', 'Add a humor punchline', 'Add CTA to buy now'..."
              disabled={isRefining}
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isRefining || !refineText.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {isRefining ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Refining...
                </>
              ) : (
                <>
                  Refine
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 mt-1 font-semibold">{errorMsg}</p>
          )}

          <div className="text-[10px] text-slate-400 italic">
            ⚡ Adjustments are processed instantly by Gemini and updated directly inside your current calendar.
          </div>
        </form>
      </div>
    </div>
  );
}

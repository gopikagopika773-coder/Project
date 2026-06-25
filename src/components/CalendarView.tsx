import React, { useState } from 'react';
import { ContentCalendar, CalendarDay } from '../types';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  FileText, 
  Image, 
  HelpCircle,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Heart,
  FileSpreadsheet
} from 'lucide-react';
import { getContentTypeBadgeStyles } from '../constants';

interface CalendarViewProps {
  calendar: ContentCalendar;
  onSelectDay: (day: CalendarDay) => void;
  onRefineEntireCalendar: (instruction: string) => void;
  isRefiningEntire: boolean;
}

export default function CalendarView({ 
  calendar, 
  onSelectDay, 
  onRefineEntireCalendar, 
  isRefiningEntire 
}: CalendarViewProps) {
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [refineText, setRefineText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'Reel' | 'Post' | 'Story' | 'Carousel'>('all');
  const [copiedPool, setCopiedPool] = useState(false);

  const filteredDays = calendar.days.filter(day => {
    if (activeTab === 'all') return true;
    return day.contentType === activeTab;
  });

  const copyDayText = (e: React.MouseEvent, day: CalendarDay) => {
    e.stopPropagation();
    const textToCopy = `📅 ${day.dayName}
📌 Topic: ${day.topic}
🎬 Format: ${day.contentType}
⏰ Best Time: ${day.bestPostingTime}

📝 Caption:
${day.captionIdea}

🏷️ Hashtags:
${day.suggestedHashtags.join(' ')}

🎨 Visual Prompt:
${day.visualPrompt}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedDay(day.dayNumber);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  const copyHashtagPool = () => {
    navigator.clipboard.writeText(calendar.weeklyHashtagPool.join(' '));
    setCopiedPool(true);
    setTimeout(() => setCopiedPool(false), 2000);
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim()) return;
    onRefineEntireCalendar(refineText);
    setRefineText('');
  };

  // Convert the calendar to CSV and download it
  const downloadCSV = () => {
    const headers = ['Day', 'Topic', 'Content Type', 'Best Posting Time', 'Caption Idea', 'Suggested Hashtags', 'Visual Prompt', 'Key Objective'];
    const rows = calendar.days.map(day => [
      day.dayName,
      day.topic.replace(/"/g, '""'),
      day.contentType,
      day.bestPostingTime,
      day.captionIdea.replace(/"/g, '""'),
      day.suggestedHashtags.join(', '),
      day.visualPrompt.replace(/"/g, '""'),
      day.keyObjective
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${calendar.niche.toLowerCase().replace(/\s+/g, '_')}_7day_content_calendar.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getObjectiveIcon = (obj: string) => {
    switch (obj.toLowerCase()) {
      case 'education':
      case 'educational':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'promo':
      case 'promotional':
        return <ShoppingBag className="w-4 h-4 text-rose-500" />;
      case 'engagement':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'inspiration':
      case 'inspirational':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview stats header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-200/60 rounded-2xl p-6">
        <div>
          <span className="text-xs font-mono text-slate-500 block uppercase tracking-wider mb-1">Target Niche</span>
          <h3 className="text-xl font-bold text-slate-800">{calendar.niche}</h3>
          <p className="text-sm text-slate-500 mt-1">Tone: {calendar.tone}</p>
        </div>
        <div>
          <span className="text-xs font-mono text-slate-500 block uppercase tracking-wider mb-1">Main Objective</span>
          <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{calendar.goal}</h3>
          <p className="text-sm text-slate-500 mt-1">Audience: {calendar.targetAudience}</p>
        </div>
        <div>
          <span className="text-xs font-mono text-slate-500 block uppercase tracking-wider mb-1">Weekly Platform Focus</span>
          <h3 className="text-xl font-bold text-indigo-600">{calendar.platform}</h3>
          <p className="text-sm text-slate-500 mt-1">Ready to publish & customize</p>
        </div>
      </div>

      {/* Control filters & action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-100 pb-4">
        {/* Platform or content-type filter */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['all', 'Post', 'Reel', 'Story', 'Carousel'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'all' ? 'All Content' : `${tab}s`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/20 text-xs font-semibold transition-all"
            title="Download CSV for Google Sheets/Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Table / Spreadsheet View */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-mono text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-5 w-28">Day</th>
              <th className="py-4 px-5 w-52">Post Topic</th>
              <th className="py-4 px-5 w-28">Format</th>
              <th className="py-4 px-5 w-28">Posting Time</th>
              <th className="py-4 px-5 w-60">Caption Idea</th>
              <th className="py-4 px-5 w-44 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDays.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                  No posts match the selected format filter.
                </td>
              </tr>
            ) : (
              filteredDays.map((day) => (
                <tr 
                  key={day.dayNumber}
                  onClick={() => onSelectDay(day)}
                  className="hover:bg-slate-50/80 cursor-pointer group transition-colors duration-150"
                >
                  {/* Day column */}
                  <td className="py-4.5 px-5 font-bold text-slate-800 align-top">
                    <div className="flex flex-col gap-1">
                      <span>{day.dayName.split(' ')[0]} {day.dayName.split(' ')[1] || ''}</span>
                      <span className="text-xs font-normal text-slate-400 block">{day.dayName.split('(')[1]?.replace(')', '') || ''}</span>
                    </div>
                  </td>
                  
                  {/* Topic column */}
                  <td className="py-4.5 px-5 align-top">
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-800 block text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                        {day.topic}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        {getObjectiveIcon(day.keyObjective)}
                        <span className="capitalize">{day.keyObjective}</span>
                      </div>
                    </div>
                  </td>

                  {/* Format column */}
                  <td className="py-4.5 px-5 align-top">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getContentTypeBadgeStyles(day.contentType)}`}>
                      {day.contentType}
                    </span>
                  </td>

                  {/* Time column */}
                  <td className="py-4.5 px-5 align-top">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{day.bestPostingTime}</span>
                    </div>
                  </td>

                  {/* Caption snippet column */}
                  <td className="py-4.5 px-5 align-top">
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-line font-serif italic">
                      {day.captionIdea}
                    </p>
                  </td>

                  {/* Action buttons */}
                  <td className="py-4.5 px-5 align-top text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => copyDayText(e, day)}
                        className={`p-2 rounded-xl transition-all ${
                          copiedDay === day.dayNumber 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                        }`}
                        title="Copy full day templates"
                      >
                        {copiedDay === day.dayNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onSelectDay(day)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100/80 transition-all border border-indigo-100"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Hashtag Pool & General strategy card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hashtag Pool */}
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Weekly Hashtag Pool
            </h4>
            <button
              onClick={copyHashtagPool}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                copiedPool 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {copiedPool ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPool ? 'Copied' : 'Copy Pool'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {calendar.weeklyHashtagPool.map((tag, idx) => (
              <span 
                key={idx} 
                className="inline-block px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium font-mono text-slate-600"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>

        {/* Strategy Advice */}
        <div className="bg-gradient-to-br from-indigo-50/40 to-slate-50 border border-indigo-100/50 rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            General Social Media Strategy
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {calendar.generalStrategy}
          </p>
          <div className="text-xs text-slate-400 italic">
            💡 Pro-Tip: Tap any row in the content spreadsheet to open the fine-tuning dashboard, customize image prompts, or rewrite individual copy items.
          </div>
        </div>
      </div>

      {/* Refinement input bar */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-800/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-4 relative z-10">
          <div>
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
              Adjust the Whole 7-Day Calendar
            </h4>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              Describe how you want to adjust all posts. Example: "Make all tone sound extra sarcastic", "Add CTA 'Use code CALENDAR' to all promo posts", "Focus primarily on LinkedIn b2b style content".
            </p>
          </div>
          <form onSubmit={handleRefineSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={refineText}
              onChange={e => setRefineText(e.target.value)}
              placeholder="e.g., Change all Reels to Stories, or rewrite all captions to include a checklist format..."
              disabled={isRefiningEntire}
              className="flex-1 px-4 py-3 bg-indigo-900/40 border border-indigo-800 text-white placeholder-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isRefiningEntire || !refineText.trim()}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl transition-all text-sm shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isRefiningEntire ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Refining...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Apply adjustments
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Settings, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  User, 
  Volume2, 
  FileText,
  Layers,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { ContentCalendar, CalendarDay } from './types';
import { PRESET_NICHES, PRESET_TONES, PRESET_GOALS, PLATFORMS } from './constants';
import CalendarView from './components/CalendarView';
import DayDetailsModal from './components/DayDetailsModal';

export default function App() {
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState(PRESET_TONES[0].value);
  const [platform, setPlatform] = useState(PLATFORMS[0].label);
  const [goal, setGoal] = useState(PRESET_GOALS[0].value);

  // States
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefiningEntire, setIsRefiningEntire] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto load some starter presets on initial render
  const selectPreset = (preset: typeof PRESET_NICHES[0]) => {
    setNiche(preset.name);
    setTargetAudience(preset.suggestedAudience);
    setTone(preset.suggestedTone);
    setGoal(preset.suggestedGoal);
    setErrorMsg('');
  };

  // Generate calendar
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) {
      setErrorMsg('Please specify your Business or Niche first.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setCalendar(null);
    setSelectedDay(null);

    try {
      const response = await fetch('/api/generate-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          targetAudience,
          tone,
          platform,
          goal
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error occurred while generating calendar');
      }

      const data: ContentCalendar = await response.json();
      setCalendar(data);
      setSuccessMsg('7-Day Content Calendar successfully generated!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate content calendar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Adjust entire calendar
  const handleRefineEntireCalendar = async (instruction: string) => {
    if (!calendar) return;

    setIsRefiningEntire(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/refine-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendar,
          instruction
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error occurred during refinement');
      }

      const updatedData: ContentCalendar = await response.json();
      setCalendar(updatedData);
      setSuccessMsg(`Entire calendar updated successfully: "${instruction}"`);
      
      // Update selected day reference if it's currently open
      if (selectedDay) {
        const refreshedDay = updatedData.days.find(d => d.dayNumber === selectedDay.dayNumber);
        if (refreshedDay) {
          setSelectedDay(refreshedDay);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to apply calendar refinements.');
    } finally {
      setIsRefiningEntire(false);
    }
  };

  // Update a single day inside current calendar
  const handleUpdateDay = (updatedDay: CalendarDay) => {
    if (!calendar) return;
    
    const updatedDays = calendar.days.map(day => 
      day.dayNumber === updatedDay.dayNumber ? updatedDay : day
    );

    setCalendar({
      ...calendar,
      days: updatedDays
    });
    setSelectedDay(updatedDay);
    setSuccessMsg(`Day ${updatedDay.dayNumber} updated!`);
  };

  // Trigger auto close toast
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-950 pb-20">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Calendar className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">7-Day Content Calendar</h1>
              <p className="text-xs text-slate-500 font-medium">Professional Social Media Planner & Strategic Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini 3.5 Engine
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Dynamic Success Toast */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-semibold shadow-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Error Box */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm font-semibold shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Input Panel / Strategist Settings Form (5 columns) */}
          <div className="xl:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-500" />
                Strategist Console
              </h3>
              <p className="text-xs text-slate-400 mt-1">Specify your parameters to generate custom campaigns.</p>
            </div>

            {/* Presets Quick-Cicks */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Quick Preset Templates
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_NICHES.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 text-xs font-semibold transition-all"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 pt-2 border-t border-slate-100">
              {/* Business/Niche */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Business/Niche <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., Artisanal Sourdough Bakery, SaaS AI Copywriter, Pilates Studio"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all placeholder:text-slate-400 font-semibold"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Busy local foodies, tech founders, health enthusiasts"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Tone of Voice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  Brand Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all font-semibold text-slate-700"
                >
                  {PRESET_TONES.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  Primary Strategic Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all font-semibold text-slate-700"
                >
                  {PRESET_GOALS.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* Preferred Platforms */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Primary Social Platform
                </label>
                <div className="space-y-2 bg-slate-50/50 border border-slate-200 p-3 rounded-xl">
                  {PLATFORMS.map(plat => (
                    <label key={plat.id} className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="radio"
                        name="platformRadio"
                        checked={platform === plat.label}
                        onChange={() => setPlatform(plat.label)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-400 focus:outline-none"
                      />
                      <span>{plat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    Assembling Strategy...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    Generate Calendar
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Output Dashboard (8 columns) */}
          <div className="xl:col-span-8">
            {calendar ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm min-h-[500px]">
                <CalendarView 
                  calendar={calendar}
                  onSelectDay={setSelectedDay}
                  onRefineEntireCalendar={handleRefineEntireCalendar}
                  isRefiningEntire={isRefiningEntire}
                />
              </div>
            ) : isLoading ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-10 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-bold text-slate-800">Drafting Your Content Strategy</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Gemini is designing highly engaging captions, selecting prime posting times, mapping out hashtags, and custom-scripting visual prompts based on your niche parameters...
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-indigo-500 font-bold bg-indigo-50/50 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generating copy & hashtag frameworks...
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 border-dashed rounded-2xl p-12 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Calendar className="w-7 h-7" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-lg font-bold text-slate-800">Your Content Spreadsheet is Empty</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select one of our preset templates above or fill out the strategist settings to build a professional 7-day social media campaign instantly.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => selectPreset(PRESET_NICHES[0])}
                    className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1"
                  >
                    Try Fitness Coach Template
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    onClick={() => selectPreset(PRESET_NICHES[1])}
                    className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1"
                  >
                    Try Artisanal Bakery Template
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Slide-out Drawer Panel for Day Details */}
      {selectedDay && calendar && (
        <DayDetailsModal 
          day={selectedDay}
          niche={calendar.niche}
          tone={calendar.tone}
          onClose={() => setSelectedDay(null)}
          onUpdateDay={handleUpdateDay}
        />
      )}
    </div>
  );
}

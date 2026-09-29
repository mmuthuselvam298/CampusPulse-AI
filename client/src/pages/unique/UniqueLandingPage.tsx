import React from 'react';
import { 
  Network, 
  GitCompare, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  CalendarDays, 
  Layers, 
  History, 
  Activity, 
  Award, 
  Compass, 
  HelpCircle, 
  Radio, 
  MapPin, 
  Lock, 
  Sparkles, 
  Search, 
  ListTree, 
  FileDiff, 
  Inbox, 
  LayoutGrid,
  Bot,
  Mic,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface FeatureItem {
  id: string;
  tab: NavTab;
  title: string;
  subtitle: string;
  whyItMatters: string;
  icon: React.ElementType;
  badge: 'LIVE' | 'DEMO' | 'AI' | 'GOOGLE' | 'FLAGSHIP';
  badgeColor: string;
}

interface CategorySection {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features: FeatureItem[];
}

export const UniqueLandingPage: React.FC = () => {
  const { setCurrentTab } = useApp();

  const categories: CategorySection[] = [
    {
      title: 'CATEGORY 1: UNDERSTAND',
      description: 'See the deep connections and timelines that bridge disconnected university systems.',
      icon: Network,
      color: 'from-blue-600 to-indigo-600',
      features: [
        {
          id: 'knowledge-graph',
          tab: 'knowledge-graph',
          title: 'Campus Knowledge Graph',
          subtitle: 'Multi-node semantic network linking courses, notices, coursework & events.',
          whyItMatters: 'Reveals how a single announcement influences coursework, calendar bookings, and actions.',
          icon: Network,
          badge: 'FLAGSHIP',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
        },
        {
          id: 'information-hub',
          tab: 'information-hub',
          title: 'Information Hub / One Event One Card',
          subtitle: 'Compresses duplicate emails, classroom notes, and calendar items into 1 intelligence card.',
          whyItMatters: 'Stops notification exhaustion: 6 emails + calendar entry condensed into 1 unified item.',
          icon: Layers,
          badge: 'LIVE',
          badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        },
        {
          id: 'timeline',
          tab: 'timeline',
          title: 'Timeline View',
          subtitle: 'Chronological progression of university updates over time.',
          whyItMatters: 'Understand exactly when room changes, reminders, and deadlines evolved.',
          icon: History,
          badge: 'DEMO',
          badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        },
        {
          id: 'compare-sources',
          tab: 'compare-sources',
          title: 'Source Comparison',
          subtitle: 'Side-by-side evidence diff comparing Gmail vs Calendar vs Classroom claims.',
          whyItMatters: 'Demonstrates transparent evidence without hiding contradictory claims.',
          icon: FileDiff,
          badge: 'FLAGSHIP',
          badgeColor: 'bg-amber-100 text-amber-700 border-amber-200'
        }
      ]
    },
    {
      title: 'CATEGORY 2: DETECT',
      description: 'Continuous monitoring for schedule shifts, contradictions, and approaching risks.',
      icon: AlertTriangle,
      color: 'from-amber-600 to-orange-600',
      features: [
        {
          id: 'conflicts',
          tab: 'conflicts',
          title: 'Information Conflict Detector',
          subtitle: 'Identifies contradictions across systems (e.g. Gmail 10 AM vs Calendar 11 AM).',
          whyItMatters: 'The centerpiece of SIH PS02: Resolves discrepancies using authoritative timestamps.',
          icon: AlertTriangle,
          badge: 'FLAGSHIP',
          badgeColor: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
        },
        {
          id: 'changes-radar',
          tab: 'changes-radar',
          title: 'What Changed Radar',
          subtitle: 'Detects rooms relocated, deadlines shifted, and sessions postponed.',
          whyItMatters: 'Highlights the critical BEFORE and AFTER state rather than chronological feed.',
          icon: GitCompare,
          badge: 'LIVE',
          badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        },
        {
          id: 'deadline-risk',
          tab: 'deadline-risk',
          title: 'Deadline Risk Detector',
          subtitle: 'Calculates high, medium, and low submission risk scores.',
          whyItMatters: 'Combines deadline proximity, Classroom submission status, and reminder count.',
          icon: Clock,
          badge: 'AI',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
        },
        {
          id: 'communication-health',
          tab: 'communication-health',
          title: 'Campus Communication Health',
          subtitle: 'Live analytics evaluating university communication clarity and noise ratio.',
          whyItMatters: 'Measures missing times, missing locations, duplicate notifications, and overall health score.',
          icon: Activity,
          badge: 'DEMO',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200'
        }
      ]
    },
    {
      title: 'CATEGORY 3: ACT',
      description: 'Safely execute actions, generate daily schedules, and navigate campus grounds.',
      icon: Compass,
      color: 'from-emerald-600 to-teal-600',
      features: [
        {
          id: 'calendar-planner',
          tab: 'calendar-planner',
          title: 'AI Calendar Planner',
          subtitle: 'Asks "Organize my day" to synthesize classes, study blocks, and pending tasks.',
          whyItMatters: 'Suggests intelligent schedules without unconfirmed automatic calendar writes.',
          icon: CalendarDays,
          badge: 'GOOGLE',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200'
        },
        {
          id: 'event-navigator',
          tab: 'event-navigator',
          title: 'Campus Event Navigator',
          subtitle: 'Maps extracted campus venues with physical room codes and Google Maps routing.',
          whyItMatters: 'Direct navigation from email mentions (Room S202, Kalam Auditorium) to physical rooms.',
          icon: MapPin,
          badge: 'LIVE',
          badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        },
        {
          id: 'truth-resolution',
          tab: 'truth-resolution',
          title: 'Truth Resolution View',
          subtitle: 'Field-by-field verification (Date, Time, Location) with confidence labels.',
          whyItMatters: 'Distinguishes between Confirmed, Supported, and Conflicting claims.',
          icon: ShieldCheck,
          badge: 'AI',
          badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        },
        {
          id: 'digest',
          tab: 'digest',
          title: 'Smart Notification Digest',
          subtitle: 'Condenses repetitive threads into single intelligent summaries.',
          whyItMatters: 'Eliminates repetitive email spam while keeping key action links visible.',
          icon: Inbox,
          badge: 'LIVE',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
        }
      ]
    },
    {
      title: 'CATEGORY 4: PERSONALIZE',
      description: 'Information tailored specifically to your active academic profile and attention limits.',
      icon: Award,
      color: 'from-violet-600 to-purple-600',
      features: [
        {
          id: 'why-it-matters',
          tab: 'why-it-matters',
          title: '"Why This Matters to Me?"',
          subtitle: 'Every notice includes evidence-based explanations grounded in your student profile.',
          whyItMatters: 'Answers why a 3rd-semester B.Tech CSE student should care about this update.',
          icon: HelpCircle,
          badge: 'AI',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
        },
        {
          id: 'opportunities',
          tab: 'opportunities',
          title: 'Opportunity Matcher',
          subtitle: 'Matches hackathons, tech workshops, and research talks to your CSE/AI track.',
          whyItMatters: 'Highlights high-impact competitions like Terrathon and IIT Bombay Robotics.',
          icon: Award,
          badge: 'LIVE',
          badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        },
        {
          id: 'attention-budget',
          tab: 'attention-budget',
          title: 'Attention Budget',
          subtitle: 'Reduces cognitive fatigue: Immediate (< 24h) vs This Week vs Informational.',
          whyItMatters: 'Toggle Focus Mode to display only critical deadline-sensitive communications.',
          icon: Compass,
          badge: 'DEMO',
          badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        },
        {
          id: 'catch-up',
          tab: 'catch-up',
          title: '"What Did I Miss?" / Catch Up',
          subtitle: 'Quick time-framed catch-up summaries (Today, Since Yesterday, Last 3 Days).',
          whyItMatters: 'Stay on top of university changes even after missing a weekend of communications.',
          icon: Radio,
          badge: 'AI',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
        }
      ]
    },
    {
      title: 'CATEGORY 5: DEMO / TRUST',
      description: 'Interactive simulation tools and strict read-only Google permission privacy controls.',
      icon: Lock,
      color: 'from-red-600 to-rose-600',
      features: [
        {
          id: 'chaos-simulator',
          tab: 'chaos-simulator',
          title: 'Campus Chaos Simulator',
          subtitle: 'Simulate live room changes, time shifts, deadline extensions, and rain closures.',
          whyItMatters: 'Flagship hackathon presentation flow: Triggers end-to-end multi-system updates.',
          icon: Radio,
          badge: 'FLAGSHIP',
          badgeColor: 'bg-rose-100 text-rose-700 border-rose-200'
        },
        {
          id: 'explain-decision',
          tab: 'explain-decision',
          title: 'Explain AI Decision',
          subtitle: 'Concise evidence-based breakdown for why an item was marked High Priority.',
          whyItMatters: 'Zero hidden hallucinations: Provides explicit traceable reasons from source records.',
          icon: Sparkles,
          badge: 'AI',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
        },
        {
          id: 'privacy',
          tab: 'privacy',
          title: 'Privacy Center & Permissions',
          subtitle: 'Transparent audit of read-only Google OAuth permissions and data isolation.',
          whyItMatters: 'Guarantees CampusPulse cannot send emails, delete files, or modify student coursework.',
          icon: Lock,
          badge: 'GOOGLE',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200'
        }
      ]
    },
    {
      title: 'CATEGORY 6: AI COMMAND & SEARCH',
      description: 'Multi-modal campus search, dynamic daily briefing, and student command center.',
      icon: Sparkles,
      color: 'from-cyan-600 to-blue-600',
      features: [
        {
          id: 'command-center',
          tab: 'command-center',
          title: 'Student Command Center',
          subtitle: 'Unified cockpit combining Attention Budget, Risks, Conflicts, and Today\'s Schedule.',
          whyItMatters: 'Central operational cockpit for high-efficiency student productivity.',
          icon: LayoutGrid,
          badge: 'FLAGSHIP',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Smart India Hackathon · PS02 Layer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Unique Features
          </h1>
          <p className="mt-2 text-base text-slate-300 leading-relaxed">
            See how CampusPulse connects fragmented university information into one intelligent student experience. 
            CampusPulse acts as the intelligence layer when systems don't understand each other.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('command-center')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Open Student Command Center</span>
            </button>
            <button
              onClick={() => setCurrentTab('chaos-simulator')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-rose-400" />
              <span>Launch Chaos Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-10">
        {categories.map((category, idx) => {
          const CatIcon = category.icon;
          return (
            <section key={idx} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-sm`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {category.title}
                    </h2>
                    <p className="text-xs text-slate-500">{category.description}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                  {category.features.length} Features
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header: Icon & Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${feature.badgeColor}`}>
                            {feature.badge}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {feature.subtitle}
                        </p>

                        {/* Why It Matters */}
                        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                          <span className="font-semibold text-indigo-950 block mb-0.5">Why it matters:</span>
                          <span className="line-clamp-2">{feature.whyItMatters}</span>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                        <button
                          onClick={() => setCurrentTab(feature.tab)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-50 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Open Feature</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

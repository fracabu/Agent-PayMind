'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import {
  ArrowRight,
  Brain,
  Mail,
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  Bot,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

export default function HeroPage() {
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  useEffect(() => {
    setMounted(true);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage(language === 'it' ? 'en' : 'it');
  };

  const t = {
    it: {
      tagline: 'Powered by AI Agents',
      headline: 'Solleciti di Pagamento',
      headlineAccent: 'Intelligenti',
      subheadline: 'Automatizza la gestione dei crediti con tre agenti AI specializzati che analizzano fatture, generano messaggi personalizzati e gestiscono le risposte dei clienti.',
      cta: 'Apri Dashboard',
      ctaSecondary: 'Scopri di più',
      features: {
        title: 'Come Funziona',
        subtitle: 'Tre agenti AI lavorano in team per gestire l\'intero workflow',
      },
      agents: [
        {
          name: 'Payment Monitor',
          description: 'Analizza fatture CSV, identifica scadute e calcola priorità automaticamente',
          icon: BarChart3,
        },
        {
          name: 'Reminder Generator',
          description: 'Genera messaggi personalizzati per Email, SMS e WhatsApp',
          icon: Mail,
        },
        {
          name: 'Response Handler',
          description: 'Analizza le risposte dei clienti con NLP e suggerisce azioni',
          icon: MessageSquare,
        },
      ],
      benefits: [
        { text: 'Multi-Provider AI', icon: Brain },
        { text: 'Analisi in Tempo Reale', icon: Zap },
        { text: 'Report Automatici', icon: BarChart3 },
        { text: 'Sicuro & Affidabile', icon: Shield },
      ],
      stats: [
        { value: '3', label: 'Agenti AI' },
        { value: '18+', label: 'Modelli AI' },
        { value: '5', label: 'Modelli Gratis' },
      ],
      footer: 'Costruito con Claude Code AI',
      video: {
        title: 'Guarda la Demo',
        subtitle: 'Scopri come PayMind automatizza la gestione dei crediti',
        watchButton: 'Guarda il Video',
      },
    },
    en: {
      tagline: 'Powered by AI Agents',
      headline: 'Smart Payment',
      headlineAccent: 'Reminders',
      subheadline: 'Automate credit management with three specialized AI agents that analyze invoices, generate personalized messages, and handle customer responses.',
      cta: 'Open Dashboard',
      ctaSecondary: 'Learn More',
      features: {
        title: 'How It Works',
        subtitle: 'Three AI agents work as a team to manage the entire workflow',
      },
      agents: [
        {
          name: 'Payment Monitor',
          description: 'Analyzes CSV invoices, identifies overdue and calculates priority automatically',
          icon: BarChart3,
        },
        {
          name: 'Reminder Generator',
          description: 'Generates personalized messages for Email, SMS, and WhatsApp',
          icon: Mail,
        },
        {
          name: 'Response Handler',
          description: 'Analyzes customer responses with NLP and suggests actions',
          icon: MessageSquare,
        },
      ],
      benefits: [
        { text: 'Multi-Provider AI', icon: Brain },
        { text: 'Real-Time Analysis', icon: Zap },
        { text: 'Automatic Reports', icon: BarChart3 },
        { text: 'Secure & Reliable', icon: Shield },
      ],
      stats: [
        { value: '3', label: 'AI Agents' },
        { value: '18+', label: 'AI Models' },
        { value: '5', label: 'Free Models' },
      ],
      footer: 'Built with Claude Code AI',
      video: {
        title: 'Watch the Demo',
        subtitle: 'See how PayMind automates credit management',
        watchButton: 'Watch Video',
      },
    },
  };

  const content = t[language] || t.it;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              PayMind
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all"
              title={language === 'it' ? 'Switch to English' : 'Passa a Italiano'}
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
          {/* Tagline Badge */}
          <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{content.tagline}</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-6 sm:mb-8 animate-slide-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">{content.headline}</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {content.headlineAccent}
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-center text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 animate-slide-up animation-delay-200">
            {content.subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20 animate-slide-up animation-delay-400">
            <Link
              href="/dashboard"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {content.cta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
            >
              {content.ctaSecondary}
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 mb-20 sm:mb-28 animate-fade-in animation-delay-600">
            {content.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Benefits Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-20 animate-fade-in animation-delay-800">
            {content.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <benefit.icon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div id="features" className="pt-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {content.features.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {content.features.subtitle}
              </p>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {content.agents.map((agent, index) => (
                <div
                  key={index}
                  className="group relative p-6 sm:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>

                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <agent.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {agent.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {agent.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Section */}
          <div className="mt-24 sm:mt-32">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {content.video.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {content.video.subtitle}
              </p>
            </div>

            {/* Video Container */}
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border border-gray-200/20 dark:border-gray-700/50">
                <video
                  className="w-full h-full object-cover"
                  controls
                  poster="/assets/paymind-overview.png"
                  preload="metadata"
                >
                  <source src="/assets/PayMind__AI_Payment_Team.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl -z-10 rounded-3xl" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 py-8 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Bot className="w-5 h-5" />
                <span className="text-sm">{content.footer}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Next.js 16</span>
                <span>•</span>
                <span>TypeScript</span>
                <span>•</span>
                <span>Tailwind CSS</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import {
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  PlayIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// Custom PayMind Logo Icon
function PayMindIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="14" height="14" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="22" y="4" width="14" height="14" rx="2" fill="currentColor" opacity="0.6"/>
      <rect x="4" y="22" width="14" height="14" rx="2" fill="currentColor" opacity="0.6"/>
      <rect x="22" y="22" width="14" height="14" rx="2" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

export default function HeroPage() {
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const [mounted, setMounted] = useState(false);

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
      headline1: 'Smetti di Rincorrere',
      headline2: 'i Pagamenti.',
      headline3: 'Inizia a Incassare.',
      subheadline: 'La gestione crediti AI che lavora in autopilota.',
      cta: 'Prova la Demo',
      watchVideo: 'Guarda il Video',
      features: [
        { icon: BoltIcon, text: 'Analisi Automatica' },
        { icon: ShieldCheckIcon, text: 'Multi-Provider AI' },
        { icon: ChartBarIcon, text: 'Report Professionali' },
      ],
      trustedBy: 'Costruito con',
      howItWorks: 'Come Funziona',
      steps: [
        { num: '01', title: 'Carica le Fatture', desc: 'Importa il tuo file CSV con le fatture da analizzare' },
        { num: '02', title: 'Analisi AI', desc: 'Gli agenti AI identificano scadute e calcolano priorità' },
        { num: '03', title: 'Genera Solleciti', desc: 'Messaggi personalizzati per Email, SMS, WhatsApp' },
      ],
    },
    en: {
      headline1: 'Stop Chasing',
      headline2: 'Payments.',
      headline3: 'Start Getting Paid.',
      subheadline: 'Your AI-powered accounts receivable on autopilot.',
      cta: 'Try the Demo',
      watchVideo: 'Watch Video',
      features: [
        { icon: BoltIcon, text: 'Automatic Analysis' },
        { icon: ShieldCheckIcon, text: 'Multi-Provider AI' },
        { icon: ChartBarIcon, text: 'Professional Reports' },
      ],
      trustedBy: 'Built with',
      howItWorks: 'How It Works',
      steps: [
        { num: '01', title: 'Upload Invoices', desc: 'Import your CSV file with invoices to analyze' },
        { num: '02', title: 'AI Analysis', desc: 'AI agents identify overdue and calculate priority' },
        { num: '03', title: 'Generate Reminders', desc: 'Personalized messages for Email, SMS, WhatsApp' },
      ],
    },
  };

  const content = t[language] || t.en;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <PayMindIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                PayMind
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title={language === 'it' ? 'Switch to English' : 'Passa a Italiano'}
              >
                <GlobeAltIcon className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                {content.cta}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-20">
          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-slide-up">
              <span className="text-indigo-600 dark:text-indigo-400">{content.headline1}</span>
              <br />
              <span className="text-indigo-600 dark:text-indigo-400">{content.headline2}</span>
              <br />
              <span className="text-gray-900 dark:text-white">{content.headline3}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-10 animate-slide-up animation-delay-200">
              {content.subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up animation-delay-400">
              <Link
                href="/dashboard"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                {content.cta}
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#video"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900 transition-colors">
                  <PlayIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 ml-0.5" />
                </div>
                {content.watchVideo}
              </a>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-20 animate-fade-in animation-delay-600">
              {content.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <feature.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              {content.howItWorks}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {content.steps.map((step, index) => (
                <div
                  key={index}
                  className="relative p-6 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-lg"
                >
                  <div className="text-4xl font-bold text-indigo-100 dark:text-indigo-900/50 mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {step.desc}
                  </p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-200 to-transparent dark:from-indigo-800" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Section */}
          <div id="video" className="max-w-4xl mx-auto mb-20 scroll-mt-24">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
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
          </div>

          {/* Built With */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{content.trustedBy}</p>
            <div className="flex items-center justify-center gap-6 text-gray-400 dark:text-gray-500">
              <span className="text-sm font-medium">Next.js</span>
              <span>•</span>
              <span className="text-sm font-medium">Claude AI</span>
              <span>•</span>
              <span className="text-sm font-medium">Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 pb-12 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <PayMindIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  © 2024 PayMind. All rights reserved.
                </span>
              </div>
              <a
                href="https://github.com/fracabu/Agent-PayMind"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

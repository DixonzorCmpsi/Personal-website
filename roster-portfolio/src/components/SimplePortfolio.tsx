'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ChevronUp,
  ChevronsDown,
  FileText,
  GraduationCap,
  Github,
  Grid2X2,
  Home,
  Linkedin,
  Mail,
  MessageCircle,
  Moon,
  Sparkles,
  Sun,
  UserCircle,
} from 'lucide-react';
import GlobalChat from '@/components/GlobalChat';
import { featuredProject, type PortfolioProject } from '@/data/portfolioProjects';
import LocalClock from '@/components/LocalClock';
import MeetScheduler from '@/components/MeetScheduler';
import PageHoverChat from '@/components/PageHoverChat';

type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
};

type Education = {
  institution: string;
  college?: string;
  degree: string;
  field: string;
  period: string;
  honors: string[];
};

type PortfolioView = 'home' | 'about' | 'work' | 'education' | 'blog' | 'meet' | 'chat';

const portfolioViews: PortfolioView[] = ['home', 'about', 'work', 'education', 'blog', 'meet', 'chat'];
const ACTIVE_VIEW_STORAGE_KEY = 'portfolio-active-view';
const SCROLL_STORAGE_PREFIX = 'portfolio-scroll';

interface SimplePortfolioProps {
  projects: PortfolioProject[];
  aboutText: string;
  experiences: Experience[];
  education: Education[];
  skills?: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    other: string[];
  };
}

const youtubeChannelUrl = 'https://www.youtube.com/@DeeMedia21';

const writingItems = [
  {
    title: 'Building AI products with receipts',
    category: 'Product value',
    date: '2026',
    summary: 'I build AI products that make messy work easier to see, prioritize, and act on. The value is simple: fewer blind spots, faster decisions, and software that proves what it can do through real workflows.',
    visualProject: 'autoyou',
  },
  {
    title: 'Fantasy football, models, and product taste',
    category: 'YouTube + ML',
    date: '2026',
    summary: 'How sports analysis became a useful playground for forecasting, ranking, interface design, and storytelling.',
    visualProject: 'football-ai',
  },
  {
    title: 'Shipping useful agents without losing control',
    category: 'Engineering',
    date: '2026',
    summary: 'Design patterns for agent workflows with reviews, notifications, ownership boundaries, and clear audit trails.',
    visualProject: 'engagement-web',
  },
];

function videoSrc(project: PortfolioProject) {
  return `/api/portfolio-video/${encodeURIComponent(project.videoFile)}`;
}

function isPortfolioView(value: string | null): value is PortfolioView {
  return Boolean(value && portfolioViews.includes(value as PortfolioView));
}

function initialPortfolioView(): PortfolioView {
  if (typeof window === 'undefined') return 'home';

  const hashView = window.location.hash.replace('#', '');
  if (isPortfolioView(hashView)) return hashView;

  const storedView = window.localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY);
  return isPortfolioView(storedView) ? storedView : 'home';
}

function scrollStorageKey(view: PortfolioView) {
  return `${SCROLL_STORAGE_PREFIX}:${view}`;
}

function PortfolioSkeleton() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#fbfbf8] text-zinc-950">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(125,211,252,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.28)_1px,transparent_1px)] bg-[size:18px_18px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(103,232,249,0.38),rgba(186,230,253,0.18)_30%,transparent_56%),linear-gradient(180deg,rgba(255,255,255,0.2),#fbfbf8_68%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-6 md:px-8 lg:px-10">
        <div className="fixed left-1/2 top-4 z-50 h-[64px] w-[calc(100%-2rem)] max-w-[860px] -translate-x-1/2 animate-pulse rounded-full border border-zinc-200 bg-white/88 shadow-[0_12px_35px_rgba(14,116,144,0.12)] backdrop-blur-xl" />
        <section className="flex min-h-screen flex-col items-center justify-center pb-16 pt-20 text-center">
          <div className="h-12 w-72 animate-pulse rounded-full bg-sky-100/90 shadow-[0_18px_48px_rgba(14,165,233,0.16)]" />
          <div className="mt-12 grid w-full max-w-5xl gap-4">
            <div className="mx-auto h-20 w-[82%] animate-pulse rounded-3xl bg-white/78 shadow-sm" />
            <div className="mx-auto h-20 w-[64%] animate-pulse rounded-3xl bg-white/78 shadow-sm" />
          </div>
          <div className="mt-10 grid w-full max-w-3xl gap-3">
            <div className="mx-auto h-8 w-[84%] animate-pulse rounded-full bg-zinc-200/70" />
            <div className="mx-auto h-8 w-[58%] animate-pulse rounded-full bg-zinc-200/70" />
          </div>
        </section>
      </div>
    </main>
  );
}

function scrollProjectIntoView(projectId: string) {
  const project = document.getElementById(projectId);
  const video = project?.querySelector('[data-project-video]');
  const target = video ?? project;
  if (!target) return;

  const topClearance = window.innerWidth < 768 ? 86 : 92;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - topClearance;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
}

function HeroPhotoFrame({
  src,
  alt,
  className,
  imageClassName = '',
  width,
  height,
}: {
  src: string;
  alt: string;
  className: string;
  imageClassName?: string;
  width: number;
  height: number;
}) {
  return (
    <div className={`group absolute hidden rounded-[22px] border border-white/80 bg-white/82 p-1.5 shadow-[0_24px_70px_rgba(14,116,144,0.22)] backdrop-blur transition duration-500 hover:scale-[1.04] hover:rotate-0 xl:block ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`h-auto w-full rounded-[17px] object-cover transition duration-500 group-hover:brightness-105 ${imageClassName}`}
        sizes="220px"
      />
    </div>
  );
}

function BlogVisual({ project, className = '' }: { project: PortfolioProject; className?: string }) {
  const [videoState, setVideoState] = useState<'loading' | 'ready' | 'error'>('loading');

  return (
    <div className={`relative min-h-[320px] bg-zinc-950 md:h-full md:min-h-[430px] ${className}`}>
      {videoState !== 'ready' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.24),rgba(244,244,245,0.96)_54%)]">
          <div className="grid justify-items-center gap-3 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700" />
            <div className="text-sm font-semibold text-zinc-600">
              {videoState === 'error' ? 'Video is still loading. Try refreshing if it stays here.' : `Loading ${project.title}`}
            </div>
          </div>
        </div>
      )}
      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoState === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        src={videoSrc(project)}
        preload="auto"
        autoPlay
        loop
        playsInline
        muted
        controls={false}
        onCanPlay={() => setVideoState('ready')}
        onLoadedData={() => setVideoState('ready')}
        onError={() => setVideoState('error')}
      />
    </div>
  );
}

function ProjectVideo({ project }: { project: PortfolioProject }) {
  const [videoState, setVideoState] = useState<'loading' | 'ready' | 'error'>('loading');

  return (
    <div data-project-video className="relative mx-auto w-full max-w-[1480px]">
      {videoState !== 'ready' && (
        <div className="absolute inset-2 z-10 flex items-center justify-center rounded-[24px] bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.24),rgba(244,244,245,0.96)_54%)]">
          <div className="grid justify-items-center gap-3 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700" />
            <div className="text-sm font-semibold text-zinc-600">
              {videoState === 'error' ? 'Video is still loading. Try refreshing if it stays here.' : `Loading ${project.title}`}
            </div>
          </div>
        </div>
      )}
      <video
        className={`block h-auto w-full shadow-[0_22px_70px_rgba(14,116,144,0.14)] transition-opacity duration-500 ${videoState === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        src={videoSrc(project)}
        preload="auto"
        autoPlay
        loop
        playsInline
        muted
        controls={false}
        onCanPlay={() => setVideoState('ready')}
        onLoadedData={() => setVideoState('ready')}
        onError={() => setVideoState('error')}
      />
    </div>
  );
}

function ProjectCard({
  project,
  index,
  total,
  nextProjectTitle,
  nextProjectSlug,
}: {
  project: PortfolioProject;
  index: number;
  total: number;
  nextProjectTitle?: string;
  nextProjectSlug?: string;
}) {
  const projectId = `project-${project.slug}`;
  const nextProjectId = nextProjectSlug ? `project-${nextProjectSlug}` : null;

  const scrollToNextProject = () => {
    if (nextProjectId) {
      scrollProjectIntoView(nextProjectId);
      return;
    }

    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <article id={projectId} className="grid min-h-screen scroll-mt-0 content-start gap-5 pb-20 pt-20 md:gap-5 md:pb-24 md:pt-24">
      <ProjectVideo project={project} />

      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-4 gap-2 px-1 md:gap-3">
        {Array.from({ length: 4 }).map((_, itemIndex) => (
          <div key={itemIndex} className={`h-1 rounded-full ${itemIndex === index % 4 ? 'bg-zinc-950' : 'bg-zinc-200'}`} />
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-2 md:grid-cols-[0.72fr_1fr] md:px-6">
        <div className="max-w-xl">
          <h3 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-950 md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-3 max-w-md text-base font-medium leading-7 text-zinc-600 md:text-lg">
            {project.eyebrow}
          </p>
        </div>

        <div className="max-w-3xl">
          <p className="text-xl font-medium leading-[1.32] text-zinc-500 md:text-2xl">
            {project.summary}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            {project.href ? (
              <a href={project.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-xl font-semibold text-sky-700 transition hover:text-sky-900">
                Open live project <ArrowUpRight size={22} />
              </a>
            ) : null}
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-400">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={scrollToNextProject}
          className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white/80 px-6 py-3 text-base font-semibold text-zinc-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200"
        >
          {nextProjectTitle ? `Next project: ${nextProjectTitle}` : 'Back to hero'}
          {nextProjectTitle ? <ChevronsDown size={19} /> : <ChevronUp size={19} />}
        </button>
      </div>
    </article>
  );
}

function BackToTopButton({ targetId, label = 'Back to top' }: { targetId: string; label?: string }) {
  const scrollToTop = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={scrollToTop}
        className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white/80 px-6 py-3 text-base font-semibold text-zinc-900 shadow-[0_16px_44px_rgba(14,116,144,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200"
      >
        {label}
        <ArrowUp size={18} />
      </button>
    </div>
  );
}

export default function SimplePortfolio({ projects, aboutText, experiences, education, skills }: SimplePortfolioProps) {
  const heroProject = projects.find((project) => project.slug === featuredProject.slug) ?? projects[0];
  const [activeSection, setActiveSection] = useState<PortfolioView>('home');
  const [isDark, setIsDark] = useState(false);
  const [isRestoringView, setIsRestoringView] = useState(true);
  const restoredInitialPosition = useRef(false);
  const scrollToTopOnViewChange = useRef(false);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';

    const frame = window.requestAnimationFrame(() => {
      const restoredThemeIsDark = window.localStorage.getItem('portfolio-theme') === 'dark';
      setActiveSection(initialPortfolioView());
      setIsDark(restoredThemeIsDark);
      document.documentElement.dataset.portfolioTheme = restoredThemeIsDark ? 'dark' : 'light';
      setIsRestoringView(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (isRestoringView) return;
    document.documentElement.dataset.portfolioTheme = isDark ? 'dark' : 'light';
    window.localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
  }, [isDark, isRestoringView]);

  useEffect(() => {
    if (isRestoringView) return;

    const hash = activeSection === 'home' ? window.location.pathname : `#${activeSection}`;
    window.localStorage.setItem(ACTIVE_VIEW_STORAGE_KEY, activeSection);
    window.history.replaceState(null, '', hash);

    if (scrollToTopOnViewChange.current) {
      scrollToTopOnViewChange.current = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!restoredInitialPosition.current) {
      restoredInitialPosition.current = true;
      const savedTop = Number(window.localStorage.getItem(scrollStorageKey(activeSection)) || 0);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: Number.isFinite(savedTop) ? savedTop : 0, behavior: 'auto' });
      });
    }
  }, [activeSection, isRestoringView]);

  useEffect(() => {
    if (isRestoringView) return;

    const saveScrollPosition = () => {
      window.localStorage.setItem(scrollStorageKey(activeSection), String(Math.max(0, Math.round(window.scrollY))));
    };

    let frame = 0;
    const scheduleSave = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        saveScrollPosition();
      });
    };

    window.addEventListener('scroll', scheduleSave, { passive: true });
    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleSave);
      window.removeEventListener('beforeunload', saveScrollPosition);
      saveScrollPosition();
    };
  }, [activeSection, isRestoringView]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextView = window.location.hash.replace('#', '');
      if (isPortfolioView(nextView)) {
        scrollToTopOnViewChange.current = false;
        setActiveSection(nextView);
      } else {
        scrollToTopOnViewChange.current = false;
        setActiveSection('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    projects.forEach((project) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'video';
      link.href = videoSrc(project);
      document.head.appendChild(link);
    });
  }, [projects]);

  if (isRestoringView) {
    return <PortfolioSkeleton />;
  }

  const switchView = (section: PortfolioView) => {
    if (section === activeSection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrollToTopOnViewChange.current = true;
    setActiveSection(section);
  };

  const scrollToProjects = () => {
    scrollProjectIntoView(`project-${heroProject.slug}`);
  };

  const navPillClass = (section: Exclude<PortfolioView, 'home'>, display = 'inline-flex') =>
    `${display} items-center gap-1.5 rounded-full px-3 py-2.5 transition hover:bg-zinc-100 hover:text-zinc-950 md:px-3.5 ${
      activeSection === section ? 'bg-zinc-100 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]' : ''
    }`;
  const homePillClass = `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-950 transition hover:bg-zinc-100 ${
    activeSection === 'home' ? 'bg-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]' : ''
  }`;

  return (
    <main className={`relative isolate min-h-screen overflow-x-hidden transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-[#fbfbf8] text-zinc-950'}`}>
      <div className={`pointer-events-none fixed inset-0 z-0 bg-[size:18px_18px] transition-opacity duration-500 ${isDark ? 'bg-[linear-gradient(rgba(125,211,252,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.10)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(125,211,252,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.28)_1px,transparent_1px)]'}`} />
      <div className={`pointer-events-none fixed inset-0 z-0 transition-colors duration-500 ${isDark ? 'bg-[radial-gradient(ellipse_at_50%_18%,rgba(14,116,144,0.28),rgba(24,24,27,0.28)_30%,#09090b_68%)]' : 'bg-[radial-gradient(ellipse_at_50%_18%,rgba(103,232,249,0.43),rgba(186,230,253,0.22)_28%,transparent_53%),linear-gradient(180deg,rgba(255,255,255,0.24),#fbfbf8_63%)]'}`} />
      <div className={`hero-blue-field pointer-events-none fixed inset-x-0 top-0 z-[1] ${activeSection === 'home' ? 'h-[700px]' : 'h-[560px]'}`} />
      <div className={`hero-pulse-band pointer-events-none fixed left-1/2 z-[2] h-72 w-[76vw] -translate-x-1/2 ${activeSection === 'home' ? 'top-[92px]' : 'top-[72px]'}`} />
      <div className={`hero-blue-sweep pointer-events-none fixed left-1/2 z-[2] h-56 w-[82vw] -translate-x-1/2 ${activeSection === 'home' ? 'top-[136px]' : 'top-[112px]'}`} />
      <div className={`relative z-10 mx-auto flex w-full flex-col ${activeSection === 'chat' ? 'max-w-none gap-0 px-0 py-0' : activeSection === 'home' ? 'max-w-[1440px] gap-10 px-4 py-6 md:px-8 lg:px-10' : 'max-w-[1440px] gap-6 px-4 py-6 md:px-8 lg:px-10'}`}>
        <div className={`relative z-20 hidden items-center justify-between pt-2 text-xl font-semibold tracking-tight lg:flex ${isDark ? 'text-zinc-50' : 'text-zinc-950'} ${activeSection === 'chat' ? 'lg:hidden' : ''}`}>
          <span>State College, PA</span>
          <LocalClock />
        </div>

        <nav className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-[860px] -translate-x-1/2 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-1.5 shadow-[0_12px_35px_rgba(14,116,144,0.16)] backdrop-blur-xl transition-colors duration-500 ${isDark ? 'border-zinc-700 bg-zinc-900/88' : 'border-zinc-200 bg-white/90'}`}>
          <button type="button" onClick={() => switchView('home')} className={homePillClass} aria-label="Home">
            <Home size={19} />
          </button>
          <span className="mx-0.5 hidden h-8 w-px bg-zinc-200 sm:inline-block" aria-hidden="true" />
          <div className="flex items-center gap-0.5 text-sm font-semibold text-zinc-700 md:text-base">
            <button type="button" onClick={() => switchView('about')} className={navPillClass('about')}>
              <UserCircle size={18} /> About
            </button>
            <button type="button" onClick={() => switchView('work')} className={navPillClass('work')}>
              <Grid2X2 size={17} /> Work
            </button>
            <button type="button" onClick={() => switchView('education')} className={navPillClass('education', 'hidden lg:inline-flex')}>
              <GraduationCap size={18} /> Education
            </button>
            <button type="button" onClick={() => switchView('blog')} className={navPillClass('blog', 'hidden md:inline-flex')}>
              <BookOpen size={17} /> Blog
            </button>
            <button type="button" onClick={() => switchView('meet')} className={navPillClass('meet', 'hidden md:inline-flex')}>
              <CalendarDays size={17} /> Meet
            </button>
            <button type="button" onClick={() => switchView('chat')} className={navPillClass('chat', 'hidden sm:inline-flex')}>
              <MessageCircle size={17} /> Ask me
            </button>
          </div>
          <div className="hidden items-center gap-0.5 border-l border-zinc-200 pl-1.5 sm:flex">
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100" onClick={() => setIsDark((value) => !value)} aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a className="hidden h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 sm:inline-flex" href="https://linkedin.com/in/dixon-zor" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={15} />
            </a>
            <a className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100" href="https://github.com/DixonzorCmpsi" target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github size={15} />
            </a>
          </div>
        </nav>
        {activeSection !== 'chat' && <PageHoverChat />}

        {activeSection === 'home' && (
          <>
        <section id="home" className="animate-fadeIn relative flex min-h-[560px] flex-col items-center justify-center pb-20 pt-10 text-center md:min-h-[620px]">
          <HeroPhotoFrame
            src="/nittany-ai.jpeg"
            alt="Dixon at a Nittany AI prototype event"
            width={216}
            height={258}
            className="left-0 top-28 z-0 w-36 -rotate-6 hover:-translate-y-2 hover:translate-x-1 2xl:left-8 2xl:top-32 2xl:w-44"
          />
          <HeroPhotoFrame
            src="/github-how-to-use.jpeg"
            alt="Dixon presenting a GitHub workshop"
            width={375}
            height={667}
            className="right-2 top-24 z-0 w-28 rotate-6 hover:-translate-x-1 hover:-translate-y-2 2xl:right-14 2xl:top-24 2xl:w-36"
          />
          <HeroPhotoFrame
            src="/undergrad-research.jpeg"
            alt="Dixon with an undergraduate research lab group"
            width={250}
            height={141}
            className="right-0 top-[360px] z-0 w-44 rotate-6 hover:-translate-x-1 hover:-translate-y-2 2xl:right-8 2xl:top-[340px] 2xl:w-56"
          />
          <HeroPhotoFrame
            src="/nittany-ai-images.jpeg"
            alt="Dixon at a Nittany AI classroom session"
            width={1024}
            height={512}
            className="left-4 top-[410px] z-0 w-48 rotate-3 hover:-translate-y-2 hover:translate-x-1 2xl:left-16 2xl:top-[430px] 2xl:w-64"
          />
          <button type="button" onClick={() => switchView('work')} className="hero-pill-glint relative z-10 inline-flex items-center overflow-hidden rounded-full border border-sky-300/90 bg-white/82 px-5 py-3 text-base font-semibold text-sky-950 shadow-[0_18px_48px_rgba(14,165,233,0.24),inset_0_0_0_1px_rgba(255,255,255,0.74),inset_0_-18px_36px_rgba(186,230,253,0.46)] backdrop-blur-xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-sky-200">
            <span>Dixon Zor</span>
            <span className="mx-4 h-6 w-px bg-sky-300/90" />
            <span className="font-medium text-sky-700">Featured work</span>
          </button>
          <h1 className={`relative z-10 mt-10 w-full max-w-[330px] text-[44px] font-semibold leading-[0.98] tracking-tight sm:max-w-3xl sm:text-6xl md:max-w-5xl md:text-7xl lg:max-w-[1320px] lg:text-[84px] xl:text-[90px] ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>
            <span className="block sm:hidden">BUILD,</span>
            <span className="block sm:hidden">BUILD,</span>
            <span className="block sm:hidden">BUILD.</span>
            <span className="block sm:hidden">AI,</span>
            <span className="block sm:hidden">automation,</span>
            <span className="block sm:hidden">and data</span>
            <span className="block sm:hidden">intelligence.</span>
            <span className="hidden sm:block">BUILD, BUILD, BUILD.</span>
            <span className="hidden sm:block">AI, automation, and data intelligence.</span>
          </h1>
          <p className="relative z-10 mt-7 w-full max-w-[330px] text-balance text-xl font-medium leading-[1.3] text-zinc-500 sm:max-w-3xl sm:text-2xl md:max-w-4xl md:text-3xl">
            I build practical AI systems, workflow tools, and ML products that turn messy operational work into useful software.
          </p>
          <button type="button" onClick={scrollToProjects} className="relative z-10 mt-12 inline-flex items-center gap-4 rounded-full border border-zinc-200 bg-white/70 px-7 py-3 text-lg font-medium text-zinc-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5">
            View projects
            <ChevronsDown size={20} />
          </button>
        </section>

        <section className="-mt-8 scroll-mt-0">
          <div className="sr-only">
            <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">Projects - Dixon Zor</h2>
          </div>
          <div className="grid gap-20">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                total={projects.length}
                nextProjectTitle={projects[index + 1]?.title}
                nextProjectSlug={projects[index + 1]?.slug}
              />
            ))}
          </div>
        </section>

          </>
        )}

        {activeSection === 'about' && (
          <>
        <section id="about" className="animate-fadeIn grid min-h-[calc(100vh-120px)] scroll-mt-0 gap-8 py-4 lg:grid-cols-[0.31fr_1fr] lg:items-center">
          <aside className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="mx-auto w-full max-w-[280px]">
              <Image src="/profile.jpg" alt="Dixon Zor" width={240} height={240} className="mx-auto h-60 w-60 rounded-full border border-zinc-200 object-cover shadow-[0_24px_80px_rgba(14,116,144,0.18)]" priority />
            </div>
          </aside>

          <div className="mx-auto w-full max-w-5xl text-center lg:text-left">
            <div className="lg:hidden">
              <Image src="/profile.jpg" alt="Dixon Zor" width={180} height={180} className="mx-auto h-44 w-44 rounded-full border border-zinc-200 object-cover shadow-[0_24px_80px_rgba(14,116,144,0.18)]" priority />
            </div>

            <button type="button" onClick={() => switchView('meet')} className="mx-auto mt-5 inline-flex items-center gap-3 rounded-full border border-sky-200 bg-sky-200/60 py-2 pl-4 pr-2 text-base font-semibold text-sky-950 shadow-[0_14px_32px_rgba(14,165,233,0.18)] transition hover:-translate-y-0.5 lg:mx-0 lg:mt-0">
              <CalendarDays size={20} className="text-sky-700" />
              Schedule a call
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-200 bg-sky-100/70">
                <ChevronRight size={21} />
              </span>
            </button>

            <h1 className="mt-8 text-5xl font-semibold leading-[0.9] tracking-tight text-zinc-950 sm:text-6xl md:text-[80px] lg:text-[92px]">
              Dixon Zor
            </h1>
            <p className="mt-3 text-3xl font-medium leading-none tracking-tight text-zinc-500 sm:text-4xl md:text-5xl">AI Software Engineer</p>

            <div className="mx-auto mt-7 flex max-w-[360px] flex-wrap justify-center gap-3 sm:max-w-none lg:mx-0 lg:justify-start">
              <a className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/75 px-4 py-2.5 text-base font-medium text-zinc-800 shadow-sm transition hover:-translate-y-0.5" href="https://github.com/DixonzorCmpsi" target="_blank" rel="noreferrer"><Github size={18} /> GitHub</a>
              <a className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/75 px-4 py-2.5 text-base font-medium text-zinc-800 shadow-sm transition hover:-translate-y-0.5" href="https://linkedin.com/in/dixon-zor" target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn</a>
              <a className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/75 px-4 py-2.5 text-base font-medium text-zinc-800 shadow-sm transition hover:-translate-y-0.5" href="mailto:dixonzor@gmail.com"><Mail size={18} /> Email</a>
              <a className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/75 px-4 py-2.5 text-base font-medium text-zinc-800 shadow-sm transition hover:-translate-y-0.5" href="/resume.pdf" target="_blank" rel="noreferrer"><FileText size={18} /> Resume</a>
            </div>

            <p className="mx-auto mt-8 max-w-[330px] break-words text-balance text-lg font-medium leading-[1.35] text-zinc-900 sm:max-w-3xl sm:text-xl md:max-w-5xl md:text-2xl lg:mx-0">
              {aboutText}
            </p>

            <div className="mx-auto mt-6 grid max-w-3xl gap-3 rounded-[24px] border border-zinc-200 bg-white/78 p-5 shadow-[0_18px_60px_rgba(14,116,144,0.09)] lg:mx-0">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Resume</div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">My AI engineer resume</h2>
              <p className="text-sm font-medium leading-6 text-zinc-600">
                My focused resume for AI engineering, production agents, applied ML, full-stack systems, and cloud automation.
              </p>
              <div className="flex flex-wrap gap-3">
                <a className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800" href="/resume.pdf" target="_blank" rel="noreferrer">
                  <FileText size={17} /> View resume
                </a>
                <a className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300" href="/resume.pdf" download>
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </section>
        <BackToTopButton targetId="about" />
          </>
        )}

        {activeSection === 'work' && (
          <>
        <section id="work" className="animate-fadeIn grid min-h-[calc(100vh-120px)] scroll-mt-0 content-center py-8">
          <div className="mx-auto mb-8 max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100/70 px-4 py-2 text-sm font-semibold text-sky-900">
              <Grid2X2 size={16} /> Work
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">Work Experience</h2>
          </div>
          <div className="mx-auto grid w-full max-w-6xl gap-5">
            {experiences.map((experience) => (
              <article key={`${experience.company}-${experience.role}`} className="grid gap-4 rounded-[26px] border border-zinc-200 bg-white/78 p-5 shadow-[0_18px_50px_rgba(14,116,144,0.08)] md:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-zinc-950">{experience.company}</h3>
                  <p className="mt-1 text-lg font-semibold text-sky-700">{experience.role}</p>
                  <p className="mt-1 text-base font-medium text-zinc-500">{experience.location}</p>
                  <ul className="mt-4 grid max-w-4xl gap-1.5 md:grid-cols-2">
                    {experience.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3 text-sm leading-6 text-zinc-700">
                        <Sparkles size={16} className="mt-1.5 shrink-0 text-zinc-400" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-base font-medium text-zinc-500 md:pt-1">{experience.period}</div>
              </article>
            ))}
          </div>
        </section>
        <BackToTopButton targetId="work" />
          </>
        )}

        {activeSection === 'education' && (
          <>
        <section id="education" className="animate-fadeIn grid min-h-[calc(100vh-120px)] scroll-mt-0 content-center py-8">
          <div className="mx-auto mb-7 max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100/70 px-4 py-2 text-sm font-semibold text-sky-900">
              <GraduationCap size={17} /> Education
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">Education, skills, and resume</h2>
          </div>

          <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-5">
              {education.map((item) => (
                <article key={`${item.degree}-${item.field}`} className="rounded-[26px] border border-zinc-200 bg-white/78 p-5 shadow-[0_18px_50px_rgba(14,116,144,0.08)]">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">{item.period}</div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">{item.degree}</h3>
                  <p className="mt-1 text-lg font-semibold text-sky-700">{item.field}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                    {item.institution}{item.college ? `, ${item.college}` : ''}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {item.honors.map((honor) => (
                      <li key={honor} className="flex gap-3 text-sm leading-6 text-zinc-700">
                        <Sparkles size={15} className="mt-1.5 shrink-0 text-zinc-400" />
                        <span>{honor}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}

              <article className="rounded-[26px] border border-zinc-200 bg-white/78 p-5 shadow-[0_18px_50px_rgba(14,116,144,0.08)]">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Resume</div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">My AI software engineer resume</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  I focus on applied AI, production agents, ML systems, full-stack products, and cloud automation.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800" href="/resume.pdf" target="_blank" rel="noreferrer">
                    <FileText size={17} /> View resume
                  </a>
                  <a className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300" href="/resume.pdf" download>
                    Download PDF
                  </a>
                </div>
              </article>
            </div>

            <article className="rounded-[26px] border border-zinc-200 bg-white/78 p-5 shadow-[0_18px_50px_rgba(14,116,144,0.08)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Skills</div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">Technical stack</h3>
              <div className="mt-5 grid gap-5">
                {skills ? [
                  ['Languages', skills.languages],
                  ['Frameworks + AI', skills.frameworks],
                  ['Cloud + tools', skills.tools],
                  ['Applied methods', skills.other],
                ].map(([label, values]) => (
                  <div key={label as string}>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">{label as string}</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(values as string[]).map((value) => (
                        <span key={value} className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : null}
              </div>
            </article>
          </div>
        </section>
        <BackToTopButton targetId="education" />
          </>
        )}

        {activeSection === 'blog' && (
          <div className="animate-fadeIn">
            {writingItems.map((item, index) => {
              const project = projects.find((candidate) => candidate.slug === item.visualProject) ?? heroProject;
              const nextId = index < writingItems.length - 1 ? `blog-${index + 1}` : 'blog-youtube';

              return (
                <section key={item.title} id={index === 0 ? 'blog' : `blog-${index}`} className="grid min-h-[calc(100vh-120px)] scroll-mt-0 content-center py-8">
                  <div className="mx-auto grid w-full max-w-6xl gap-8">
                    <div className="max-w-4xl">
                      <div className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">{item.category}</div>
                      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
                        {index === 0 ? 'Writing about AI, software, and sports...' : item.title}
                      </h2>
                    </div>

                    <article className="grid overflow-hidden rounded-[30px] border border-zinc-200 bg-white/78 shadow-[0_30px_90px_rgba(14,116,144,0.10)] md:grid-cols-[0.92fr_1fr]">
                      <BlogVisual project={project} />
                      <div className="flex min-h-[300px] flex-col justify-center p-6 md:p-10">
                        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-zinc-500 md:text-base">
                          <Image src="/profile.jpg" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                          <span>Dixon Zor</span>
                          <span>{item.date}</span>
                        </div>
                        <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-zinc-950 md:text-4xl">
                          {item.title}
                        </h3>
                        <p className="mt-4 text-lg font-semibold text-zinc-500 md:text-xl">{item.category}</p>
                        <p className="mt-4 max-w-xl text-base font-medium leading-7 text-zinc-600 md:text-lg">{item.summary}</p>
                      </div>
                    </article>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => document.getElementById(nextId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white/80 px-6 py-3 text-base font-semibold text-zinc-900 shadow-[0_16px_44px_rgba(14,116,144,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200"
                      >
                        {index < writingItems.length - 1 ? `Next: ${writingItems[index + 1].title}` : 'Next: DeeTalk channel'}
                        <ChevronsDown size={18} />
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}

            <section id="blog-youtube" className="grid min-h-[calc(100vh-120px)] scroll-mt-0 content-center py-8">
              <div className="mx-auto grid w-full max-w-6xl gap-8">
                <div className="max-w-4xl">
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-red-700">YouTube channel</div>
                  <h2 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">DeeTalk</h2>
                </div>

                <a href={youtubeChannelUrl} target="_blank" rel="noreferrer" className="group grid overflow-hidden rounded-[30px] border border-zinc-200 bg-white/78 p-3 shadow-[0_30px_90px_rgba(14,116,144,0.10)] transition hover:-translate-y-1 md:grid-cols-[1.25fr_0.75fr]">
                  <div className="relative aspect-[2/1] overflow-hidden rounded-[24px] bg-white md:aspect-[2/1]">
                    <Image src="/deetalk-channel.png" alt="DeeTalk YouTube channel screenshot" fill className="object-cover object-left-top" sizes="(min-width: 768px) 760px, 100vw" />
                  </div>
                  <div className="flex flex-col justify-center p-6 md:p-10">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                      YouTube channel
                    </div>
                    <h3 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-950">DeeTalk</h3>
                    <p className="mt-4 max-w-xl text-xl font-medium leading-[1.35] text-zinc-500">
                      Football, analysis, product thinking, and the public side of my sports AI work.
                    </p>
                    <span className="mt-7 inline-flex items-center gap-3 text-xl font-semibold text-sky-700">
                      Watch on YouTube <ArrowUpRight size={22} />
                    </span>
                  </div>
                </a>
                <BackToTopButton targetId="blog" />
              </div>
            </section>
          </div>
        )}

        {activeSection === 'meet' && (
        <section id="meet" className="animate-fadeIn grid min-h-[calc(100vh-120px)] scroll-mt-0 content-center py-4">
          <div className="mx-auto mb-7 max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100/70 px-4 py-2 text-sm font-semibold text-sky-900">
              <CalendarDays size={16} /> Meeting request
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl">Schedule with me</h2>
          </div>
          <MeetScheduler />
          <div className="mt-6">
            <BackToTopButton targetId="meet" />
          </div>
        </section>
        )}

        {activeSection === 'chat' && (
        <section id="chat" className="animate-fadeIn min-h-screen overflow-hidden">
          <GlobalChat />
        </section>
        )}
      </div>
    </main>
  );
}

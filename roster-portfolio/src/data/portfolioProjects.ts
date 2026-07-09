export type PortfolioProject = {
  slug: string;
  title: string;
  eyebrow: string;
  videoFile: string;
  summary: string;
  outcome: string;
  stack: string[];
  details: string[];
  source: string;
  href?: string;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "autoyou",
    title: "autoYou",
    eyebrow: "Personal AI operations platform",
    videoFile: "autoYou.mov",
    summary:
      "A multi-agent secretary dashboard for email, workflow orchestration, lead research, daily briefs, and governed coding-agent loops.",
    outcome:
      "Turns scattered inbox and workflow requests into tracked issues, reviewed changes, and useful notifications.",
    stack: ["Next.js", "Postgres", "Gitea", "n8n", "LLM agents"],
    details: [
      "Unified chat and email brain with server-side memory",
      "Reviewer-triggered PR flow with merge notifications",
      "Lead intelligence, passive recon, and daily improvement briefs",
    ],
    source: "RadAgents local project docs",
    href: "https://autoyou.app",
  },
  {
    slug: "asset-manager",
    title: "Asset Manager",
    eyebrow: "Field operations and diagnostics",
    videoFile: "asset-manager.mov",
    summary:
      "A mobile-first operations system for field teams managing equipment, diagnostics, notes, customer timelines, and service outcomes.",
    outcome:
      "Replaces manual tracking with structured workflows, sensor capture, journal events, and actionable service records.",
    stack: ["Python", "FastAPI", "Swift", "NumPy", "Pandas"],
    details: [
      "Native iOS capture path for field sensor data",
      "Journal and event timeline for operational history",
      "Deployable service with Kubernetes manifests and health checks",
    ],
    source: "PoolBuddy local project docs",
  },
  {
    slug: "engagement-web",
    title: "Engagement Web",
    eyebrow: "Client delivery workspace",
    videoFile: "Engamgent web.mov",
    summary:
      "A lightweight internal web app pattern for client dashboards, live feeds, server-rendered views, and interactive islands.",
    outcome:
      "Gives teams a fast way to ship focused client tools without dragging in a heavy frontend stack.",
    stack: ["FastAPI", "Jinja", "SSE", "Python", "CSRF"],
    details: [
      "Server-rendered pages with opt-in interactive islands",
      "Session auth, CSRF protection, and live event streams",
      "Built for dashboards, client portals, and small operational apps",
    ],
    source: "client-engagement-webapp README",
  },
  {
    slug: "football-ai",
    title: "Football AI",
    eyebrow: "Fantasy football intelligence",
    videoFile: "football-ai.mov",
    summary:
      "An AI-powered NFL fantasy prediction engine with player projections, matchup analysis, trends, and betting insight workflows.",
    outcome:
      "Transforms weekly stats, injuries, odds, and player context into decision support for fantasy football managers.",
    stack: ["React", "FastAPI", "Postgres", "XGBoost", "scikit-learn"],
    details: [
      "Position-specific XGBoost prediction models",
      "ETL pipeline for schedules, stats, injuries, and feature sets",
      "Dashboard for comparisons, projections, trends, and matchup analysis",
    ],
    source: "Football-Ai README",
    href: "https://thespot.deetalk.win",
  },
];

export const featuredProject = portfolioProjects[0];

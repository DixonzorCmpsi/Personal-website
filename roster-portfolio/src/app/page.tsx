import { getRosterStats } from '@/lib/github';
import VSCodePortfolio from '@/components/VSCodePortfolio';

// Revalidate page data every hour (use /api/revalidate to force refresh)
export const revalidate = 3600;

export default async function Home() {
  const { qb, roster } = await getRosterStats();

  const aboutText = `Hi, my name is Dixon. I am a computer science graduate from the Pennsylvania State University. I'd like to say my favorite hobby is coding but that would be a lie. I love problem solving, and I think that's the biggest value I bring to the world. The harder the task the bigger the payoff in my mind. There's nothing more fun to me than figuring out a bug in my code or even just finding a better way to play a video game. This mindset is what got me interested in computers and now possibly ML? The bottomless nature of computers science and data science and AI is extremely intriguing to me. I know enough about the web and building applications, my goal now is to make smarter applications. I'm fascinated by the mathematics in ML and figuring it has been a nice little journey of mine. I also have hobbies!! Yay!! I love the gym, I love the nfl (even make youtube videos about it)`;

  // Experience data from resume
  const experiences = [
    {
      company: "Radians Per Second Squared",
      role: "AI Engineer, Forward Deployed",
      period: "March 2026 – Present",
      location: "State College, PA",
      highlights: [
        "Eliminated ~$47K/month in lost billing by replacing an oilfield operator's spreadsheets with one system of record",
        "Cut feedback-to-code cycle time 75% by auto-routing email feedback into GitHub issues and code PRs",
        "Architected RadAgents, a multi-agent orchestration harness (TypeScript, inference API, BAML) on AWS EKS",
        "Surfaced a $7,425/month revenue leak and a 58-hour-overdue engine service hidden in operational data",
        "Reclaimed 20–30 hrs/week by consolidating 3+ client engagements into a git-native web app (Python, HTMX)",
        "Mapped 335 historical service events (2022–2026) across PM, work orders, delivery tickets, and field sales orders",
        "Authored internal Claude Code skills and MCP servers, cutting 5–10 hrs/week of QA and UX work"
      ]
    },
    {
      company: "Penn State Nittany AI Alliance",
      role: "AI Application Specialist",
      period: "June 2025 – 2026",
      location: "University Park, PA",
      highlights: [
        "Launched a full-stack AI platform (BAML) that coached 500+ students through the $20K Nittany AI Challenge",
        "Automated 90% of new-student onboarding with a 3-step computer-vision pipeline (Grounding DINO, CLIP, SAM)",
        "Compressed code-review time 75% with an AI workflow triaging 100+ Challenge students to 40+ for review",
        "Saved managers 80% of data-pull time by launching 3 dashboards on Power Automate, Power BI, and custom APIs",
        "Reduced deployment setup from 2 hrs to ~20 min with a standardized multi-cloud provisioning pipeline",
        "Hardened 5+ codebases/semester via pen-testing, prompt-injection, secrets scanning, and RBAC reviews",
        "Directed weekly engagements for 10+ clients including Lockheed Martin, John Deere, and Penn State OPP",
        "Taught 50–60 students monthly in workshops on MLOps, GitOps, and model fine-tuning"
      ]
    },
    {
      company: "The Human in Computing and Cognition Research Lab",
      role: "Undergraduate Research Assistant",
      period: "May 2023 – 2025",
      location: "University Park, PA",
      highlights: [
        "Designed 3 Minecraft Malmo environments (Python, Java, XML) for controlled human-AI interaction studies",
        "Conducted 25+ studies modeling cognitive biases in human-AI interaction with the ACT-R architecture",
        "Fine-tuned LLM chatbots for engineering competitions with RAG and LoRA adaptation",
        "Developed 3 data-processing and visualization pipelines in Python to accelerate analysis and model evaluation",
        "Co-authored a peer-reviewed paper on AI ethics and chatbot development, published by the ASEE"
      ]
    }
  ];

  // Education data from resume
  const education = [
    {
      institution: "The Pennsylvania State University",
      college: "World Campus",
      degree: "Master of Science",
      field: "Artificial Intelligence",
      period: "May 2026 – Present",
      honors: [
        "Graduate study in machine learning, deep learning, and applied AI systems"
      ]
    },
    {
      institution: "The Pennsylvania State University",
      college: "College of Engineering",
      degree: "Bachelor of Science",
      field: "Computer Science",
      period: "2020 – May 2025",
      honors: [
        "Relevant Coursework: Machine Learning, AI Ethics, Data Structures, Algorithms, Computer Architecture"
      ]
    }
  ];

  // Skills from resume
  const skills = {
    languages: ["JavaScript", "Python", "C", "C++", "MATLAB", "SQL", "HTML5", "CSS", "Assembly", "Verilog"],
    frameworks: ["React", "Node.js", "Next.js", "Flask", "Bootstrap", "Tailwind", "shadcn/ui"],
    tools: ["FastAPI", "VS Code", "Git", "GitHub", "Power Automate", "n8n", "Docker", "Jupyter", "Azure", "GCP", "AWS", "PostgreSQL", "MongoDB"],
    other: ["Microsoft Teams", "SharePoint", "Video editing", "Writing", "Public speaking"]
  };

  return (
    <VSCodePortfolio
      qbData={qb}
      rosterData={roster}
      aboutText={aboutText}
      experiences={experiences}
      education={education}
      skills={skills}
    />
  );
}
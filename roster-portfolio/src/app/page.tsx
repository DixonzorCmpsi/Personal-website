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
      role: "AI Software Engineer",
      period: "March 2026 – Present",
      location: "State College, PA",
      highlights: [
        "Migrated a client from Excel to an AI-powered iOS platform, recovering $20K+/month in uncaptured revenue",
        "Led rollout across 10+ field and office staff, replacing spreadsheets with AI-driven daily operations",
        "Reduced equipment downtime ~30 hrs/month with an Isolation Forest anomaly-detection pipeline",
        "Applied PCA/SVD and K-means to prioritize the highest-risk ~10% of assets for preventive maintenance",
        "Delivered 3 production AI apps powering agentic workflows and daily ML automation in TypeScript, Python",
        "Built an internal client operations portal for 3+ clients, reducing management overhead by 10+ hrs/week"
      ]
    },
    {
      company: "Penn State Nittany AI Alliance",
      role: "AI Application Specialist",
      period: "June 2025 – March 2026",
      location: "University Park, PA",
      highlights: [
        "Launched a full-stack AI platform (BAML) that coached 150+ students through a $20K coding competition",
        "Automated 90% of onboarding with a 3-step CV pipeline (Grounding DINO, CLIP, SAM, OpenCV)",
        "Compressed code-review time 75% with gitingest + DSPy workflows triaging 100+ codebases to 40",
        "Reduced deployment setup from 2 hrs to ~20 min via an internal CLI tool for Azure/AWS",
        "Hardened 5+ codebases/semester with OWASP, secrets scanning, RBAC, and prompt-injection reviews",
        "Directed weekly engagements for 5+ clients including Lockheed Martin, John Deere, and Penn State OPP"
      ]
    },
    {
      company: "The Human in Computing and Cognition Research Lab",
      role: "Undergraduate Research Assistant",
      period: "May 2023 – May 2025",
      location: "University Park, PA",
      highlights: [
        "Designed 3 Minecraft Malmo environments (Python, Java, XML) for controlled human-AI interaction studies",
        "Conducted 25+ studies modeling cognitive biases in human-AI interaction with the ACT-R architecture",
        "Fine-tuned a T5 model with LoRA, benchmarked vs RAG, and presented findings to 50+ at PSU Hackathon",
        "Built 3 reproducible pandas/NumPy/scikit-learn pipelines for curation, cleaning, and model evaluation",
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
      period: "2026 – Expected May 2028",
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
    languages: ["Python", "TypeScript", "JavaScript", "Swift", "SQL", "C/C++"],
    frameworks: ["PyTorch", "Hugging Face", "scikit-learn", "XGBoost", "LangChain/LlamaIndex", "BAML", "DSPy", "React", "Node.js", "Next.js", "FastAPI"],
    tools: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "OpenTofu", "Ansible", "Git", "n8n", "Okta", "Databricks", "PostgreSQL", "pgvector", "MongoDB"],
    other: ["LoRA fine-tuning", "RAG", "PCA/SVD", "K-means", "multi-agent orchestration", "MCP servers", "context engineering", "CLIP", "SAM"]
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
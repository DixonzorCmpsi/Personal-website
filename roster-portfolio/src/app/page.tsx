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
      company: "Penn State Nittany AI Alliance",
      role: "AI Application Specialist",
      period: "June 2025 – Present",
      location: "Penn State University Park",
      highlights: [
        "Developed an automated student analytics dashboard using Azure Container Apps and Power BI, orchestrating data synchronization between SharePoint and the GitHub API via Power Automate",
        "Researched and documented technical requirements for Nittany AI Advance projects, creating implementation roadmaps for student teams (RAG, CNNs, PINNs) for partners including Lockheed Martin and West Shore Homes",
        "Implemented CI/CD pipelines using GitHub Actions to streamline deployment of API server scripts",
        "Built an internal AI development framework for complex AI pipelines, from standard RAG to advanced Context-Augmented Generation (CAG) with state management",
        "Developed a Python-based CLI tool to automate infrastructure provisioning across AWS, Azure, and GCP",
        "Engineered an AI-driven code review system utilizing GitInjest and RAG, reducing manual review time by 50%",
        "Designed a multi-stage computer vision pipeline integrating Grounding DINO, SAM 2.1, and CLIP for high-precision similarity matching"
      ]
    },
    {
      company: "The Human in Computing and Cognition Research Lab",
      role: "Undergraduate Research Assistant",
      period: "May 2023 – 2025",
      location: "Penn State University Park",
      highlights: [
        "Designed 3 research environments with Minecraft Malmo, using Python, Java, and XML",
        "Conducted 25+ studies to model cognitive biases in human-AI interaction using ACT-R",
        "Developed LLM chatbots for Engineering Competitions using Retrieval-Augmented Generation and Model Fine-Tuning with LoRA",
        "Created automated data processing and visualization pipelines for efficient data analysis and model evaluations",
        "Maintained code & research documentation with regular commits via GitLab",
        "Authored a paper detailing AI ethics and Chatbot developments, published by the American Society for Engineering Education (ASEE)"
      ]
    }
  ];

  // Education data from resume
  const education = [
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
    frameworks: ["React", "Node.js", "Next.js", "Flask", "Bootstrap", "Tailwind", "Shadcn"],
    tools: ["FastAPI", "Flask", "VScode", "Git", "GitHub", "Power Automate", "N8N", "Docker", "Jupyter", "Azure", "GCP", "AWS", "Postgres", "MongoDB"],
    other: ["Teams", "SharePoint", "Video editing", "Writing", "Public speaking", "Gym"]
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
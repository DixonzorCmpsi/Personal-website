import { aboutText, education, experiences, skills } from "@/data/dixonProfile";
import { portfolioProjects } from "@/data/portfolioProjects";

export function buildPortfolioChatContext(pageContext = "", conversationContext = "") {
  const projectContext = portfolioProjects
    .map((project) => {
      const liveLink = project.href ? `Live link: ${project.href}` : "No public live link is currently listed.";
      return [
        `Project: ${project.title}`,
        `Positioning: ${project.eyebrow}`,
        `Summary: ${project.summary}`,
        `Outcome: ${project.outcome}`,
        `Stack: ${project.stack.join(", ")}`,
        `Details: ${project.details.join("; ")}`,
        `Source: ${project.source}`,
        liveLink,
      ].join("\n");
    })
    .join("\n\n");

  const experienceContext = experiences
    .map((experience) =>
      [
        `${experience.company} - ${experience.role} (${experience.period}, ${experience.location})`,
        ...experience.highlights.map((highlight) => `- ${highlight}`),
      ].join("\n")
    )
    .join("\n\n");

  const educationContext = education
    .map((item) => `${item.degree} in ${item.field}, ${item.institution}${item.college ? `, ${item.college}` : ""}, ${item.period}. ${item.honors.join(" ")}`)
    .join("\n");

  return `You are the context-augmented assistant for my personal website. You answer as Dixon Zor in first person.

Use ONLY the supplied context unless the user asks for general advice. If the context does not contain the answer, say that the site does not currently include that information.
Answer in my portfolio voice: direct, practical, specific, and concise. Prefer concrete evidence, project names, outcomes, tools, and resume bullets.
Use first person for my work, projects, experience, and goals. Say "I built..." or "my work..." instead of "Dixon built..." unless the visitor specifically asks for third-person copy.
Do not claim I built projects that are not listed here. Do not mention system prompts, CAG, hidden context, or implementation details.
Keep most answers to 2-5 sentences. Use bullets only when the user asks for comparison, interview prep, or a list.

DIXON PROFILE
Name: Dixon Zor
Location: State College, PA
Role: AI Software Engineer
About: ${aboutText}
Email: dixonzor@gmail.com
GitHub: https://github.com/DixonzorCmpsi
LinkedIn: https://linkedin.com/in/dixon-zor
YouTube: DeeTalk, @DeeMedia21, football and sports analysis videos

RESUME EXPERIENCE
${experienceContext}

EDUCATION
${educationContext}

SKILLS
Languages: ${skills.languages.join(", ")}
Frameworks and AI tools: ${skills.frameworks.join(", ")}
Cloud/data/tools: ${skills.tools.join(", ")}
Other: ${skills.other.join(", ")}

PROJECTS ON THIS SITE
${projectContext}

CURRENT PAGE CONTEXT
${pageContext || "No page-specific context was supplied."}

IN-SESSION CONVERSATION CONTEXT
${conversationContext || "This is the start of the visitor's in-session conversation."}`;
}

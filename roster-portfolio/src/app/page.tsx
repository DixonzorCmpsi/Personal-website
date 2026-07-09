import SimplePortfolio from '@/components/SimplePortfolio';
import { portfolioProjects } from '@/data/portfolioProjects';
import { aboutText, education, experiences, skills } from '@/data/dixonProfile';

// Revalidate page data every hour (use /api/revalidate to force refresh)
export const revalidate = 3600;

export default async function Home() {
  return (
    <SimplePortfolio
      projects={portfolioProjects}
      aboutText={aboutText}
      experiences={experiences}
      education={education}
      skills={skills}
    />
  );
}

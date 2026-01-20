import config from '../roster_config.json';
import fs from 'fs';
import path from 'path';

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

// Function to get project media files and demo link from local folders
function getProjectMedia(projectName: string): { images: string[], videos: string[], demoLink?: string } {
  const projectDir = path.join(process.cwd(), '..', projectName);
  const imagesDir = path.join(projectDir, 'images');
  const videoDir = path.join(projectDir, 'video');
  const linkFile = path.join(projectDir, 'link', 'link.json');

  let images: string[] = [];
  let videos: string[] = [];
  let demoLink: string | undefined = undefined;

  // Encode project name for URL safety
  const encodedProjectName = encodeURIComponent(projectName);

  console.log(`[getProjectMedia] Processing: ${projectName}`);
  console.log(`[getProjectMedia] Project dir: ${projectDir}`);
  console.log(`[getProjectMedia] Images dir: ${imagesDir}`);
  console.log(`[getProjectMedia] Images dir exists: ${fs.existsSync(imagesDir)}`);

  try {
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      console.log(`[getProjectMedia] Found image files:`, files);
      images = files
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
        .map(f => `/project-media/${encodedProjectName}/images/${encodeURIComponent(f)}`);
      console.log(`[getProjectMedia] Generated image paths:`, images);
    }
  } catch (e) {
    console.log(`No images folder for ${projectName}`, e);
  }

  try {
    if (fs.existsSync(videoDir)) {
      const files = fs.readdirSync(videoDir);
      console.log(`[getProjectMedia] Found video files:`, files);
      videos = files
        .filter(f => /\.(mp4|webm|mov)$/i.test(f))
        .map(f => `/project-media/${encodedProjectName}/video/${encodeURIComponent(f)}`);
      console.log(`[getProjectMedia] Generated video paths:`, videos);
    }
  } catch (e) {
    console.log(`No video folder for ${projectName}`, e);
  }

  // Read demo link from link.json
  try {
    if (fs.existsSync(linkFile)) {
      const linkData = JSON.parse(fs.readFileSync(linkFile, 'utf-8'));
      if (linkData.url && linkData.url.trim() !== '') {
        demoLink = linkData.url.startsWith('http') ? linkData.url : `https://${linkData.url}`;
      }
    }
  } catch (e) {
    console.log(`No link.json or invalid format for ${projectName}`);
  }

  return { images, videos, demoLink };
}

export async function getRosterStats() {
  const { github_username, roster } = config;

  // 1. Filter: Only fetch data for "repo" types
  const repoPlayers = roster.filter(p => p.type === "repo");

  // 2. Construct Query only for repos - checking both main and master
  const repoQueries = repoPlayers.map((player) => `
    ${player.position}: repository(owner: "${github_username}", name: "${player.repo_name}") {
      name
      description
      url
      stargazerCount
      languages(first: 1) { nodes { name color } }
      readmeMain: object(expression: "main:README.md") { ... on Blob { text } }
      readmeMaster: object(expression: "master:README.md") { ... on Blob { text } }
      readmeHead: object(expression: "HEAD:README.md") { ... on Blob { text } }
    }
  `).join('\n');

  const query = `
    query {
      user(login: "${github_username}") { avatarUrl bio name login }
      ${repoQueries}
    }
  `;

  // 3. Fetch Data
  let json: any = {};
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    });
    json = await response.json();
  } catch (e) {
    console.error("Fetch failed, using mock data");
  }

  if (!json.data) {
    console.error("GitHub Error or No Data, providing mock data for layout visualization");
    // Return mock data so the user can see the layout
    const mockRoster = roster.map((p: any) => {
      const media = getProjectMedia(p.display_name);
      return {
        ...p,
        stats: {
          description: "This is a placeholder description for " + p.display_name,
          stars: Math.floor(Math.random() * 100),
          language: "TypeScript",
          color: "#2563eb",
          readme: "",
          url: "#",
          images: media.images,
          videos: media.videos,
          demoLink: media.demoLink
        }
      };
    });
    return {
      qb: { name: "Dixon Zor", avatarUrl: "/profile.jpg", resumeUrl: "/resume.pdf" },
      roster: mockRoster
    };
  }

  // 4. Merge Data (Handle both Repos and Links)
  const filledRoster = roster.map((player: any) => {
    // Case A: It's a GitHub Repo
    if (player.type === "repo") {
      const githubData = json.data[player.position];
      const readmeText = githubData?.readmeMain?.text || githubData?.readmeMaster?.text || githubData?.readmeHead?.text || "";

      // Get local media files for this project
      const media = getProjectMedia(player.display_name);

      // Extract first image from README as fallback
      const imgRegex = /!\[.*?\]\((.*?)\)|<img.*?src=["'](.*?)["']/i;
      const match = readmeText.match(imgRegex);
      const extractedImg = match ? (match[1] || match[2]) : null;

      // Check for local project image fallback
      const localImg = `/projects/${player.repo_name}.jpg`;

      return {
        ...player,
        stats: githubData ? {
          description: githubData.description,
          stars: githubData.stargazerCount,
          language: githubData.languages.nodes[0]?.name || "Code",
          color: githubData.languages.nodes[0]?.color || "#2563eb",
          readme: readmeText,
          url: githubData.url,
          image: media.images[0] || extractedImg || localImg,
          images: media.images,
          videos: media.videos,
          demoLink: media.demoLink
        } : {
          description: "Repo not found",
          color: "#666",
          image: localImg,
          images: media.images,
          videos: media.videos,
          demoLink: media.demoLink
        }
      };
    }

    // Case B: It's an External Link (LinkedIn/YouTube)
    return {
      ...player,
      stats: {
        description: `External Link to ${player.display_name}`,
        stars: 0,
        language: "Link",
        color: player.display_name === "YouTube" ? "#ff0000" : "#0077b5",
        readme: "",
        url: player.url,
        image: player.display_name === "YouTube" ? "/youtube_thumb.jpg" : "/linkedin_thumb.jpg",
        images: [],
        videos: []
      }
    };
  });

  return {
    qb: {
      ...json.data.user,
      resumeUrl: "/resume.pdf"
    },
    roster: filledRoster
  };
}
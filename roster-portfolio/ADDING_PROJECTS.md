# Adding Portfolio Projects

The homepage is driven by `src/data/portfolioProjects.ts`.

## Add a new recording

1. Put the video in the configured video folder.
   - Local dev default: `/Users/dixon/portfolio videos`
   - Production/dev deploy override: set `PORTFOLIO_VIDEO_DIR=/path/to/videos`
   - Repo-local fallback: `roster-portfolio/portfolio-videos`

2. Add one entry to `src/data/portfolioProjects.ts`:

```ts
{
  slug: "new-project",
  title: "New Project",
  eyebrow: "Short category",
  videoFile: "new-project.mov",
  summary: "One sentence about what it is.",
  outcome: "One sentence about the value it created.",
  stack: ["Next.js", "FastAPI"],
  details: [
    "Specific thing it does",
    "Specific technical detail",
    "Specific business result",
  ],
  source: "Local README or project notes",
  href: "https://optional-live-demo.example.com",
}
```

The page will render the new case study automatically. Keep videos as `.mov`, `.mp4`,
`.webm`, or `.m4v`.

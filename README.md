# Portfolio

Personal developer portfolio built with Vite, React, TypeScript, and Three.js.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Three.js** — 3D avatar viewer (GLB model, FBX animations)
- CSS custom properties for theming — no CSS framework

## Project Structure

```
src/
├── components/
│   ├── sections/       # Hero, About, Skills, Projects, Contact, ResumeCTA, Footer
│   ├── layout/         # TopNav, LeftRail, StatusPill
│   ├── media/          # AvatarViewer, ImageSlot
│   └── common/         # Shared UI — SectionHead, ProjectCard, Icons
├── hooks/
│   ├── useThreeScene.ts    # Three.js scene, avatar load, animation control
│   ├── useReveal.ts        # Scroll-reveal via IntersectionObserver
│   └── useActiveSection.ts # Active nav link tracking
├── data/               # skills.json, projects.json, techMarquee.json
└── styles/             # globals.css, layout.css, animations.css, themes.css
public/
└── uploads/            # GLB/FBX avatar files, profile photo, resume PDF
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Customisation

### Avatar

The hero avatar uses `public/uploads/first_avatar.glb`. To use a different avatar, pass `avatarUrl` to `AvatarViewer`:

```tsx
<AvatarViewer avatarUrl="/uploads/your_avatar.glb" ... />
```

On mount the avatar plays a greeting wave for 6 seconds, then settles into the default idle. This is configured in `src/hooks/useThreeScene.ts`:

```ts
const DEFAULT_GREET_URL      = '/uploads/animate_idle_wave.fbx';
const DEFAULT_IDLE_URL       = '/uploads/animate_idle_neutral.fbx';
const DEFAULT_GREET_DURATION = 6000; // ms
```

### Animations

The animation picker in the hero section is defined in `src/components/sections/Hero.tsx`. Each entry has a `duration` (ms) — how long the animation plays before auto-reverting to idle:

```ts
{ url: '/uploads/animate_dance_1.fbx', label: 'Dance', group: 'Dance', duration: 15000 },
```

Add any `.fbx` file to `public/uploads/` and add a new entry to the `ANIMATIONS` array.

### Profile Photo

Replace `public/uploads/profile.png` with your own photo (PNG, JPG, or WebP). The filename is referenced in `src/components/sections/About.tsx`.

### Projects

Edit `src/data/projects.json` — each entry renders as a project card.

### Skills

Edit `src/data/skills.json`.

### Resume

Replace `public/uploads/Python_Dev.pdf` with your resume PDF and update the filename in `src/components/sections/ResumeCTA.tsx`.

### Contact links

Update the social links in `src/components/layout/LeftRail.tsx` and the contact section in `src/components/sections/Contact.tsx`.

## Build & Deploy

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

The `dist/` folder is a fully static site — deploy anywhere. For Vercel, just import the repo and it auto-detects Vite with no configuration needed.

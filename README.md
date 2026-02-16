# Choose Your Own AIdventure

A retro-style "Choose Your Own Adventure" RPG powered by Cloudflare Workers AI.

## Features

- **AI-Powered Dungeon Master**: Dynamically generated stories based on your choices.
- **AI Image Generation**: Visualizes the scene based on the story progress.
- **Retro Aesthetic**: NES-style UI using `nes.css`.
- **Cloudflare Native**: Optimized for Cloudflare Pages and Workers AI.

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm

### Installation

```bash
npm install
```

### Local Development

To run the project locally with simulated AI responses:

```bash
npm run dev
```

To test with actual Cloudflare AI bindings locally (requires Cloudflare login):

```bash
npm run pages:dev
```

### Deployment

This project is designed to be deployed to **Cloudflare Pages**.

1. Connect your GitHub repository to Cloudflare Pages.
2. Set the build command to `npm run build`.
3. Set the build output directory to `.next`.
4. Add the `AI` binding in your Pages project settings (Settings > Functions > Compatibility Flags > AI).

To deploy manually via CLI:

```bash
npm run pages:deploy
```

## Technologies

- **Framework**: Next.js 16
- **Styling**: nes.css
- **AI Platform**: Cloudflare Workers AI
- **Adapter**: OpenNext for Cloudflare
- **Deployment**: Cloudflare Pages

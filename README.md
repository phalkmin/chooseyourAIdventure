# Choose Your Own AIdventure

A retro-style "Choose Your Own Adventure" RPG powered by Cloudflare Workers AI.

## Features

- **AI-Powered Dungeon Master**: Dynamically generated stories based on your choices.
- **AI Image Generation**: Visualizes the scene based on the story progress.
- **Retro Aesthetic**: NES-style UI using \`nes.css\`.
- **Cloudflare Native**: Optimized for Cloudflare Pages and Workers AI.

## Recent Milestones

- **Pacing Engine**: Implemented a tight 10-turn story arc. The AI now plans for a beginning, middle, climax, and a definitive ending based on your performance.
- **High-Stakes Gameplay**: Added "Hidden Trap" logic starting from Turn 4. Some choices now lead to major setbacks or immediate Game Overs, making decision-making more meaningful.
- **Scenario Engine**: Unified game logic by moving individual scenarios into \`lib/scenarios.ts\` using a standardized prompt template.
- **Cinematic Visuals**: Upgraded scene generation to **16:9 widescreen (1024x576)** using SDXL Lightning with increased sampling steps and negative prompting for sharper, atmospheric pixel art.
- **Interface Cleanup**: Refined the chat UI to automatically strip structural AI labels (\`NPC:\`, \`NARRATIVE:\`, etc.) while extracting clean character names and portraits.

## How to Add a New Scenario

Adding a new adventure is simple! Follow these steps:

### 1. Update `lib/scenarios.ts`
Add a new entry to the \`SCENARIOS\` object. Use the \`createSystemPrompt\` helper to benefit from the **Base Engine** rules (Brevity, Continuity, No Yapping).

\`\`\`typescript
horror: {
  id: 'horror',
  title: 'Victorian Horror',
  systemPrompt: createSystemPrompt(
    "A gothic Victorian mansion filled with shadows and whispers.",
    "The user must uncover the secret of the Blackwood curse."
  ),
  playerClasses: [
    { name: 'Investigator', portrait: '...' },
    { name: 'Psychic', portrait: '...' },
  ],
  // Add image/audio config here...
}
\`\`\`

### 2. Create the Page
Create a new file in \`app/[scenario_id]/page.tsx\` (e.g., \`app/horror/page.tsx\`). Use the shared \`AdventureChat\` component:

\`\`\`typescript
import AdventureChat from '../../components/AdventureChat';
import { SCENARIOS } from '../../lib/scenarios';

export default function HorrorPage() {
  return <AdventureChat scenario={SCENARIOS.horror} />;
}
\`\`\`

### 3. Add to Home Screen
Update \`app/page.tsx\` to include a new link button for your adventure.

## AI "Base Engine" & Pacing Logic

Every scenario uses a standardized prompt template that enforces high-quality RPG mechanics:

- **Brevity**: Narrative descriptions are kept under 80 words for fast-paced gameplay.
- **Atmospheric Prose**: Exactly one sensory detail (sound, smell, or texture) per scene.
- **Pacing Directives**: The system secretly guides the AI through four phases:
  - **Turns 1-3 (Hook)**: Establish the scene.
  - **Turns 4-7 (Mid-Game)**: Introduce "Hidden Traps" (risky but viable choices).
  - **Turns 8-9 (Climax)**: High stakes with lethal traps.
  - **Turn 10 (Ending)**: Forces a definitive resolution (Victory or Death).

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm

### Installation

\`\`\`bash
npm install
\`\`\`

### Local Development

To run the project locally with simulated AI responses:

\`\`\`bash
npm run dev
\`\`\`

To test with actual Cloudflare AI bindings locally (requires Cloudflare login):

\`\`\`bash
npm run pages:dev
\`\`\`

### Deployment

This project is designed to be deployed to **Cloudflare Pages**.

1. Connect your GitHub repository to Cloudflare Pages.
2. Set the build command to \`npm run build\`.
3. Set the build output directory to \`.next\`.
4. Add the \`AI\` binding in your Pages project settings (Settings > Functions > Compatibility Flags > AI).

## Technologies

- **Framework**: Next.js 16
- **Styling**: nes.css
- **AI Platform**: Cloudflare Workers AI
- **Adapter**: OpenNext for Cloudflare
- **Deployment**: Cloudflare Pages

export interface PlayerClass {
  name: string;
  portrait: string;
}

export interface ScenarioConfig {
  id: string;
  title: string;
  systemPrompt: string;
  playerClasses: PlayerClass[];
  imagePromptPrefix: string;
  portraitPromptPrefix: string;
  audioTrack: string;
  loadingMessage: string;
  inputPlaceholder: string;
}

const BASE_RPG_INSTRUCTIONS = `
You are a legendary Dungeon Master for a retro Text RPG. 
Your goal is to lead the player through a "Choose Your Own Adventure" style journey.

CORE RULES:
- BREVITY: Narrative descriptions MUST be under 80 words. Be punchy and atmospheric.
- NO REPETITION: Do not repeat or summarize the player's last action. Move the story forward immediately.
- CONTINUITY: You have perfect memory of the chat history. Respect all past decisions and inventory changes.
- SENSORY DETAIL: Include exactly one vivid sensory detail per response (smell, sound, or texture).
- NO PROLOGUE: If this is the start, do not give a long intro. Place the player immediately in a moment of choice or action.
- STRUCTURE: Use exactly these labels followed by a newline:
  NPC: [Name only]
  NARRATIVE: [Action and dialogue]
  Choices: [[Action 1]] [[Action 2]] [[Action 3]]

Example:
NPC: Zorvath
NARRATIVE: The wizard leans over his desk, eyes glowing like burning embers. "The axe you seek is guarded by shadows," he warns.
Choices: [[Ask about the shadows]] [[Offer him gold]] [[Leave the tower]]
`.trim();

const createSystemPrompt = (setting: string, objective: string) => `
${BASE_RPG_INSTRUCTIONS}

SETTING: ${setting}
OBJECTIVE: ${objective}
`.trim();

export const SCENARIOS: Record<string, ScenarioConfig> = {
  medieval: {
    id: 'medieval',
    title: 'Medieval Fantasy',
    systemPrompt: createSystemPrompt(
      "A medieval fantasy realm teeming with magic, mythical creatures, and monsters.",
      "The user must retrieve the legendary Golden Axe from the deep forest."
    ),
    playerClasses: [
      { name: 'Warrior', portrait: 'https://placehold.co/64x64/4a4a4a/ffffff/png?text=Warrior' },
      { name: 'Mage', portrait: 'https://placehold.co/64x64/4a4a4a/ffffff/png?text=Mage' },
      { name: 'Cleric', portrait: 'https://placehold.co/64x64/4a4a4a/ffffff/png?text=Cleric' },
    ],
    imagePromptPrefix: 'medieval fantasy setting, retro 8-bit pixel art style, high contrast, saturated colors, sharp pixel edges, NES aesthetic, ',
    portraitPromptPrefix: 'medieval fantasy character portrait, 8-bit retro pixel art style, flat background, ',
    audioTrack: '/konami/ultima.mp3',
    loadingMessage: 'The world is spinning...',
    inputPlaceholder: 'Type your action...',
  },
  scifi: {
    id: 'scifi',
    title: 'Cyberpunk Future',
    systemPrompt: createSystemPrompt(
      "A futuristic cyberpunk world filled with advanced technology, neon-lit cityscapes, and intrigue.",
      "The user must survive and achieve their secret mission in this dystopia."
    ),
    playerClasses: [
      { name: 'Private Detective', portrait: 'https://placehold.co/64x64/001f3f/ffffff/png?text=Detective' },
      { name: 'Replicant', portrait: 'https://placehold.co/64x64/3d0000/ffffff/png?text=Replicant' },
    ],
    imagePromptPrefix: 'cyberpunk futuristic setting, retro 8-bit pixel art style, high contrast, saturated neon colors, sharp pixel edges, NES aesthetic, ',
    portraitPromptPrefix: 'cyberpunk character portrait, 8-bit retro pixel art style, flat background, neon colors, ',
    audioTrack: '/konami/police.mp3',
    loadingMessage: 'Processing data...',
    inputPlaceholder: 'Command line...',
  }
};

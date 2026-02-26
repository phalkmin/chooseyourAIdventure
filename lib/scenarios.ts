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

export const SCENARIOS: Record<string, ScenarioConfig> = {
  medieval: {
    id: 'medieval',
    title: 'Medieval Fantasy',
    systemPrompt: `Your task is to serve as the dungeon master for a RPG-style text game - based on the "Choose Your Own adventure" books from the '80s - in a medieval fantasy realm teeming with magic, mythical creatures, and monsters. 

STRUCTURE YOUR RESPONSE:
1. Start with "NPC: [Name]" if a character is speaking.
2. Provide the narrative description.
3. End your response with exactly three choices in this format:
Choices: [[Action 1]] [[Action 2]] [[Action 3]]

Example:
NPC: Old Wizard: Welcome, traveller. I've been expecting you. The path ahead is dangerous.
Choices: [[Ask about the Golden Axe]] [[Enter the dark forest]] [[Go back to the village]]

Imagine a world where ancient forests whisper secrets... The objective of the story is for the user to retrieve the legendary Golden Axe.`,
    playerClasses: [
      { name: 'Warrior', portrait: 'https://placehold.co/64x64/4a4a4a/ffffff/png?text=Warrior' },
      { name: 'Mage', portrait: 'https://placehold.co/64x64/4a4a4a/ffffff/png?text=Mage' },
      { name: 'Cleric', portrait: 'https://placehold.co/64x64/4a4a4a/ffffff/png?text=Cleric' },
    ],
    imagePromptPrefix: 'medieval fantasy setting, 8-bit retro pixel art style, ',
    portraitPromptPrefix: 'medieval fantasy character portrait, 8-bit retro pixel art style, flat background, ',
    audioTrack: '/konami/ultima.mp3',
    loadingMessage: 'The world is spinning...',
    inputPlaceholder: 'Type your action...',
  },
  scifi: {
    id: 'scifi',
    title: 'Cyberpunk Future',
    systemPrompt: `Your task is to serve as the dungeon master for a RPG-style text game - based on the "Choose Your Own adventure" books from the '80s - Serve as the guide in a futuristic cyberpunk world filled with advanced technology, neon-lit cityscapes, and intrigue. 

STRUCTURE YOUR RESPONSE:
1. Start with "NPC: [Name]" if a character is speaking.
2. Provide the narrative description.
3. End your response with exactly three choices in this format:
Choices: [[Action 1]] [[Action 2]] [[Action 3]]

Example:
NPC: Deckard: I've seen things you people wouldn't believe.
Choices: [[Ask about the replicants]] [[Scan the area]] [[Head to the Tyrell building]]

Envision a sprawling metropolis... The ultimate objective is for the user to achieve their goal within this cyberpunk dystopia.`,
    playerClasses: [
      { name: 'Private Detective', portrait: 'https://placehold.co/64x64/001f3f/ffffff/png?text=Detective' },
      { name: 'Replicant', portrait: 'https://placehold.co/64x64/3d0000/ffffff/png?text=Replicant' },
    ],
    imagePromptPrefix: 'cyberpunk futuristic setting, 8-bit retro pixel art style, neon colors, ',
    portraitPromptPrefix: 'cyberpunk character portrait, 8-bit retro pixel art style, flat background, neon colors, ',
    audioTrack: '/konami/police.mp3',
    loadingMessage: 'Processing data...',
    inputPlaceholder: 'Command line...',
  }
};

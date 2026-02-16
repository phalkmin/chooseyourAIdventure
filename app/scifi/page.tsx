import { Metadata } from 'next';
import SciFiChat from '../../components/SciFiChat';

export const metadata: Metadata = {
  title: 'Sci-Fi Cyberpunk Adventure - Choose Your Own AIdventure',
  description:
    'Dive into a futuristic cyberpunk dystopia. Navigate neon streets, uncover conspiracies, and survive in this AI-generated sci-fi RPG.',
  keywords: 'Cyberpunk, Sci-Fi, RPG, AI Game, Adventure, Futuristic, Neon',
  openGraph: {
    title: 'Sci-Fi Cyberpunk Adventure - Choose Your Own AIdventure',
    description:
      'Survive the neon-lit streets of a cyberpunk future. Every choice matters.',
  },
  twitter: {
    title: 'Sci-Fi Cyberpunk Adventure - Choose Your Own AIdventure',
    description:
      'Survive the neon-lit streets of a cyberpunk future. Every choice matters.',
  },
};

export default function SciFiPage() {
  return <SciFiChat />;
}

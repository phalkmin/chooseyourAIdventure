import { Metadata } from 'next';
import MedievalChat from '../../components/MedievalChat';

export const metadata: Metadata = {
  title: 'Medieval Quest - Choose Your Own AIdventure',
  description:
    'Embark on a medieval fantasy quest. Retrieve the Golden Axe, battle mythical creatures, and shape your own legend in this AI-driven RPG.',
  keywords: 'Medieval, Fantasy, RPG, Quest, AI Game, Adventure, Golden Axe',
  openGraph: {
    title: 'Medieval Quest - Choose Your Own AIdventure',
    description:
      'Enter a world of magic and monsters. Your choices decide your fate.',
  },
  twitter: {
    title: 'Medieval Quest - Choose Your Own AIdventure',
    description:
      'Enter a world of magic and monsters. Your choices decide your fate.',
  },
};

export default function MedievalPage() {
  return <MedievalChat />;
}

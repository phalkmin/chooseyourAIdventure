import AdventureChat from '../../components/AdventureChat';
import { SCENARIOS } from '../../lib/scenarios';

export default function MedievalPage() {
  return <AdventureChat scenario={SCENARIOS.medieval} />;
}

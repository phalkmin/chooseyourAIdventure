import AdventureChat from '../../components/AdventureChat';
import { SCENARIOS } from '../../lib/scenarios';

export default function SciFiPage() {
  return <AdventureChat scenario={SCENARIOS.scifi} />;
}

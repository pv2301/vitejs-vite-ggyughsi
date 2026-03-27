import { useGame } from '../context/GameContext';
import translations from './translations';

export function useTranslation() {
  const { locale } = useGame();
  const t = translations[locale] ?? translations['en'];
  return t;
}

import { useEffect, useState } from 'react';
import { SceneShell } from '../ui/SceneShell';
import { FormScreen } from '../ui/FormScreen';
import { useTypewriter } from '../ui/useTypewriter';

export function Scene2() {
  const [phase, setPhase] = useState(0); // 0 = prénom, 1 = nom, 2 = suivant
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 1700),
      setTimeout(() => setPhase(2), 3400),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const first = useTypewriter('Léa', { startDelay: 500, charDelay: 200 });
  const second = useTypewriter('Dubois', { startDelay: 0, charDelay: 170, enabled: phase >= 1 });
  const activeKey = phase === 0 ? first.lastChar : phase === 1 ? second.lastChar : '';

  return (
    <SceneShell activeKey={activeKey}>
      <FormScreen
        title="Comment vous appelez-vous ?"
        subtitle="Votre nom complet, affiché en haut du CV."
        suivantPressed={phase >= 2}
        fields={[
          { label: 'Prénom', value: first.shown, placeholder: 'Marie', active: phase === 0 },
          { label: 'Nom', value: second.shown, placeholder: 'Dupont', active: phase === 1 },
        ]}
      />
    </SceneShell>
  );
}

import { useEffect, useState } from 'react';
import { SceneShell } from '../ui/SceneShell';
import { FormScreen } from '../ui/FormScreen';
import { useTypewriter } from '../ui/useTypewriter';

export function Scene3() {
  const [phase, setPhase] = useState(0); // 0 = typing adresse, 1 = suivant
  useEffect(() => {
    const t = [setTimeout(() => setPhase(1), 3100)];
    return () => t.forEach(clearTimeout);
  }, []);

  const adresse = useTypewriter('8 rue de Rivoli', { startDelay: 500, charDelay: 145 });
  const activeKey = phase === 0 ? adresse.lastChar : '';

  return (
    <SceneShell activeKey={activeKey}>
      <FormScreen
        title="Où habitez-vous ?"
        subtitle="Adresse et ville (facultatif)."
        suivantPressed={phase >= 1}
        fields={[
          { label: 'Adresse', value: adresse.shown, placeholder: '12 rue de Rivoli', active: phase === 0 },
          { label: 'Ville', value: 'Paris, France', placeholder: 'Paris, France', active: false },
        ]}
      />
    </SceneShell>
  );
}

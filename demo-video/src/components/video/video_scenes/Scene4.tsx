import { useEffect, useState } from 'react';
import { SceneShell } from '../ui/SceneShell';
import { FormScreen } from '../ui/FormScreen';
import { useTypewriter } from '../ui/useTypewriter';

export function Scene4() {
  const [phase, setPhase] = useState(0); // 0 = typing, 1 = suivant, 2 = generating
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 3700),
      setTimeout(() => setPhase(2), 4100),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const url = useTypewriter('linkedin.com/in/lea-dubois', { startDelay: 500, charDelay: 120 });
  const activeKey = phase === 0 ? url.lastChar : '';

  return (
    <SceneShell activeKey={activeKey} generating={phase >= 2}>
      <FormScreen
        title="Votre profil LinkedIn ?"
        subtitle="Facultatif, pour enrichir votre CV."
        passer
        suivantPressed={phase >= 1}
        fields={[
          { label: 'LinkedIn', value: url.shown, placeholder: 'linkedin.com/in/marie', active: phase === 0 },
        ]}
      />
    </SceneShell>
  );
}

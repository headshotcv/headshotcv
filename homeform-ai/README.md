# HOMEFORM AI — coaching de musculation à domicile avec analyse vidéo

> « Filme ton mouvement. Améliore ta technique. Progresse chez toi. »
> Nom de travail, à vérifier avant dépôt.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · MediaPipe Pose Landmarker · Supabase · Stripe · Claude API.

## Démarrer

```bash
cd homeform-ai
npm install          # copie aussi le runtime WASM MediaPipe dans public/mediapipe
cp .env.example .env.local
npm run dev          # http://localhost:3000
npm test             # 12 tests du moteur d'analyse
npm run build
```

Sans variables Supabase, l’app tourne en **mode local** (comptes et données dans le navigateur, bandeau jaune visible partout). Avec `NEXT_PUBLIC_ALLOW_DEV_UNLOCK=true`, la page d’abonnement propose un « accès de test » gratuit — jamais disponible quand Supabase est configuré.

## Ce qui fonctionne réellement

| Élément | État |
|---|---|
| Landing (8 sections), responsive mobile-first | ✅ |
| Funnel : questionnaire → exercice → caméra/import → analyse → aperçu → offre → inscription → abonnement | ✅ |
| **Analyse vidéo réelle** (squat, pompes) — MediaPipe Pose Landmarker *full*, exécuté dans le navigateur | ✅ testée de bout en bout |
| Contrôles qualité : durée, résolution, luminosité, détection, cadrage, angle de caméra, exercice non reconnu / différent, aucune répétition | ✅ rejets explicites, jamais de score inventé |
| Rapport : répétitions, angles au point bas, alignement, tempo, régularité, moments clés cliquables, revue vidéo avec squelette, limites | ✅ |
| Aperçu gratuit (1 observation complète, les autres réelles mais verrouillées) | ✅ |
| Comptes / RLS / routes privées (middleware) | ✅ Supabase, ou mode local |
| Stripe Checkout, webhook, portail client, résiliation | ✅ code prêt — à tester avec vos clés |
| Programme 4 semaines généré selon objectif/niveau/temps/matériel, 20 exercices avec instructions et variante plus facile | ✅ |
| Séance guidée (séries, chrono, repos, saisie des répétitions) → progression | ✅ |
| Progression : séances/semaine, heatmap de régularité, courbe de répétitions, objectifs, historique | ✅ |
| Coach IA (Claude, streaming, consentement pour partager l’historique) | ✅ code prêt — nécessite `ANTHROPIC_API_KEY` |
| Démo interne `/demo` (données fictives isolées, bouton Réinitialiser) | ✅ |
| Comptage des répétitions **en direct** pendant le filmage (squelette sur l’aperçu caméra) | ✅ testé avec un flux caméra simulé |
| Bilan de départ (4 tests, comptage caméra possible) → programme calculé sur les résultats | ✅ |
| Séries hebdomadaires, paliers, XP/niveau, défi du jour (calculés sur l’activité réelle) | ✅ |
| Corrections classées (« à corriger en premier ») | ✅ |
| Pages : analyse vidéo, forces et limites, comment filmer, programmes + leçons, coach IA, nouveautés, blog | ✅ |
| Vidéos réelles (Mixkit, licence libre) avec squelette MediaPipe pré-calculé | ✅ `public/media` |
| Pages légales (mentions, CGU/CGV, confidentialité, cookies, avertissement santé) | ✅ modèles, champs `[À COMPLÉTER]` |

## Pipeline d’analyse (`src/lib/analysis`, `src/lib/pose`)

```
Vidéo (jamais envoyée au serveur)
 → lecture image par image (requestVideoFrameCallback, ~15 i/s) + luminance
 → MediaPipe Pose (33 repères) — WASM + modèle servis depuis /public
 → contrôles qualité (quality.ts)
 → reconnaissance squat / pompe (ligne épaules–chevilles) + côté visible + vue profil/face
 → angles 2D lissés (genou ou coude, buste, alignement épaule-hanche-cheville)
 → découpage des répétitions (hystérésis)
 → mesures par répétition → observations (seuils dans thresholds.ts)
```

- **Les seuils de `thresholds.ts` sont indicatifs et doivent être validés par des professionnels qualifiés.**
- Le moteur est testé sur des séquences synthétiques à vérité terrain connue (`npm test`). Il a aussi été exécuté de bout en bout dans Chromium sur des vidéos de synthèse : le squat est reconnu et analysé ; sur la vidéo de pompes du mannequin, aucune répétition fiable n’a été trouvée et l’analyse est refusée proprement. **Prochaine étape indispensable : calibrer sur de vraies vidéos de personnes (profil, face, téléphones différents).**
- Les visuels de la landing et la démo utilisent le **même moteur** appliqué à des séquences générées (`synthetic.ts`), toujours étiquetées « Exemple ».

## Mise en production

1. **Supabase** : créer un projet (région UE), exécuter `supabase/migrations/0001_init.sql` puis `0002_motivation.sql`, renseigner les 3 variables. Configurer l’URL de redirection `https://<domaine>/auth/callback`.
2. **Stripe** : créer 2 prix récurrents (9,90 €/mois, 59,90 €/an) → `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`, webhook `https://<domaine>/api/stripe/webhook` (événements `checkout.session.completed`, `customer.subscription.*`), activer le portail client. Les prix affichés sont dans `src/config/pricing.ts`.
3. **Coach** : `ANTHROPIC_API_KEY` (serveur uniquement). Modèle par défaut `claude-opus-5-5` (effort bas), modifiable via `COACH_MODEL`. Remplacer la limitation de débit en mémoire par un store partagé.
4. **Vercel** : importer le dossier `homeform-ai`, ajouter les variables, déployer. `NEXT_PUBLIC_ALLOW_DEV_UNLOCK` doit rester vide.
5. Compléter les mentions `[À COMPLÉTER]` et faire relire CGV/confidentialité par un juriste.

## Visuels

L’environnement de création n’avait accès ni au site de référence ni aux banques d’images : **aucune photo n’est intégrée**. Les scènes (salon, chambre, jardin, athlète + squelette) sont des illustrations SVG originales, animées par le modèle corporel du moteur. Pour atteindre le rendu photo souhaité, prévoir un shooting (ou des photos sous licence) :

1. Hero — squat de profil dans un salon lumineux, plan large vertical 4:5.
2. Pompes sur tapis, chambre, lumière rasante, plan horizontal.
3. Gros plans : genoux au point bas, mains au sol, gainage.
4. Personne qui pose son téléphone au sol pour se filmer.
5. Jardin / terrasse, fente arrière.

Les composants `TrainingScene` peuvent alors être remplacés section par section par des `<Image>` avec le calque d’analyse par-dessus.

## Structure

```
src/
  app/                 routes (landing, analyser, inscription, abonnement, app/*, demo/*, legal, api/*)
  components/
    landing/           sections de la landing
    analyze/           capture caméra/import, traitement, rapport, revue vidéo
    app/               espace personnel (shell, pages, graphiques)
    figure/            athlète + scènes SVG originales
    program/           questionnaire, timeline programme
  lib/
    analysis/          moteur d'analyse pur (testé)
    pose/              extraction MediaPipe dans le navigateur
    program/           bibliothèque d'exercices + générateur
    store/             dépôts local / Supabase, brouillon du funnel, vidéos locales (IndexedDB)
    stripe/ supabase/ coach/ demo/
supabase/migrations/   schéma + RLS
```

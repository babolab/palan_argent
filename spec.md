# La Chasse au Trésor du Vieux Corsaire
### *Game Design Document — v1.0*
*À remettre à Claude Code pour implémentation*

***

## 1. Résumé Exécutif

**Titre :** La Chasse au Trésor du Vieux Corsaire *(sous-titre : « Le Palan d'Argent »)*
**Genre :** Jeu d'aventure textuel/visuel à la première personne, point & click léger
**Plateforme cible :** Navigateur web (HTML5 + CSS3 + JavaScript vanilla ou React), compatible Windows, macOS, Linux, Android, iOS — **aucune installation requise**[^1]
**Durée estimée :** 45–90 minutes (7–8 escales)
**Public :** Un ami féru de nautisme ; langue entièrement française, registre décalé, argot marin authentique
**Moteur :** Zéro dépendance externe si possible ; HTML5 `anvas>` ou simple DOM pour les animations[^1]

***

## 2. Concept & Histoire

### 2.1 Pitch en une phrase

> *Un vieux loup de mer cébèche a caché son or dans les îles anglo-normandes. Appareille depuis Cherbourg, résous ses énigmes de port en port, et ramène le trésor avant que la marée tourne.*

### 2.2 Prologue — Texte d'introduction du jeu

*(Affiché sur fond de carte marine, avec le bruit de vague et de mouettes en optionnel)*

> **"Moussaillon,**
>
> Si tu lis ces lignes, c'est que tu as trouvé mon carnet de bord dans la chambre des cartes de La Chantereyne. Je suis Hippolyte Kergoat dit *"le Palan"*, corsaire raté, pilote côtier plus ou moins recommandable, et fin connaisseur de la Manche et de ses caillasses.
>
> J'ai planqué mon pactole — quarante lingots d'or et une bouteille de Calvados vintage — en sept endroits que toi seul pourras retrouver, à condition de ne pas être une gueule de raie et de savoir lire un alignement.
>
> À chaque escale, un indice. À chaque indice, une énigme. Plante bien tes pattes de mouche sur la carte, borde ta grand-voile, et fais gaffe au Raz Blanchard : il a avalé de meilleurs marins que toi.
>
> Bonne route. Et si t'échoues, c'est que tu mérites de rester sur le quai à compter les bigorneaux.
>
> — *Hippolyte Kergoat, dit le Palan, quelque part entre deux marées"*

### 2.3 Structure narrative

Le joueur incarne un plaisancier moderne qui a hérité d'un vieux carnet de bord. Chaque port est une **escale narrative** avec :
- Un personnage local haut en couleur (capitaine de port, patron de bar, ostréiculteur, garde-côte…)
- Une **énigme** liée au lieu, à la navigation ou au vocabulaire marin
- Un fragment de la carte au trésor qu'on assemble au fil du jeu

La carte au trésor se révèle progressivement, pièce par pièce, à chaque énigme résolue.

***

## 3. Carte du Jeu & Escales

### 3.1 Zone géographique

Le jeu se déroule dans le quadrilatère Cherbourg – Granville – Jersey – Aurigny, incluant la côte du Cotentin et l'archipel des îles anglo-normandes.[^2][^3]

### 3.2 Les 8 Escales (dans l'ordre narratif)

| # | Port | Île / Région | Particularité réelle | Personnage PNJ |
|---|------|-------------|---------------------|----------------|
| 0 | **Cherbourg-Chantereyne** | Cotentin | Port de départ, grande rade abritée | *Marcel*, le capitaine de port grincheux |
| 1 | **Barfleur** | Cotentin | Petit port en schiste bleu, phare historique | *Odette*, la patronne du café-tabac |
| 2 | **Saint-Vaast-la-Hougue** | Cotentin | Tours Vauban UNESCO, huîtres réputées, île Tatihou[^4][^5] | *Gaston*, l'ostréiculteur philosophe |
| 3 | **Braye Harbour, Aurigny** | Alderney | Port isolé, 70 bouées visiteurs, digue d'1,5 km[^6] | *Dotty*, la capitaine du port anglophone |
| 4 | **Granville** | Cotentin | Port en cœur de ville, porte abattante, baie du Mont-Saint-Michel[^3][^7] | *Prosper*, le pêcheur de crevettes |
| 5 | **Sound de Chausey** | Archipel Chausey | Mouillage mythique, marnage de 12 m, bouées visiteurs[^8][^9] | *La Pyramide* (un cairn qui "parle") |
| 6 | **Saint-Hélier** | Jersey | Marina 5 ancres d'or, VHF 14, forte marée[^10][^11] | *Inspecteur Dorey*, douanier zélé |
| 7 | **Saint-Peter Port** | Guernesey | Victoria Marina, porte à seuil 4,2 m, arrivée finale[^12][^13] | *Hippolyte le Palan* (fantôme) |

### 3.3 Carte interactive

- Fond de carte : **style carte marine SHOM** — blanc cassé, isobathe bleu pâle, toponymes en lettres gothiques
- Le voilier du joueur (icône SVG d'un sloop) se déplace d'un port à l'autre avec une animation de route au layline
- Les ports débloqués brillent d'un petit phare animé (CSS)
- La carte au trésor partielle s'affiche dans le coin inférieur droit, les fragments s'assemblant à chaque escale réussie

***

## 4. Mécaniques de Jeu

### 4.1 Boucle principale

```
[Arrivée au port]
     │
     ▼
[Dialogue avec PNJ] ──► récit contextuel (2–4 textes à cliquer)
     │
     ▼
[Présentation de l'Énigme] ──► texte + illustration ASCII/SVG
     │
     ▼
[Saisie de la réponse OU choix multiple]
     │
  ┌──┴──┐
Juste   Faux
  │       │
  ▼       ▼
[Fragment] [Indice + nouvel essai (max 3)]
  │
  ▼
[Route vers escale suivante disponible]
```

### 4.2 Types d'Énigmes (une par escale)

Chaque énigme appartient à l'un des types suivants — variés pour éviter la monotonie :

| Escale | Type | Format réponse |
|--------|------|---------------|
| Cherbourg (0) | Tutoriel — trouver le cap au compas | Choix multiple |
| Barfleur (1) | Vocabulaire marin — devinette décalée | Mot libre |
| Saint-Vaast (2) | Énigme chiffrée — calcul de marée | Nombre (heure) |
| Aurigny (3) | Logique — code de signal VHF | Choix multiple |
| Granville (4) | Mémoire contextuelle — citation du carnet | Texte libre court |
| Chausey (5) | Observation — trouver l'amer sur la carte | Clic sur la carte |
| Saint-Hélier (6) | Rébus marin | Mot composite libre |
| Saint-Peter Port (7) | Assemblage — reconstitution du trésor | Glisser-déposer fragments |

### 4.3 Système d'essais & indices

- **3 essais par énigme** avant que l'indice s'active
- **1 indice disponible** à tout moment (pénalité : le fragment de carte arrivera "corné", visuellement abîmé)
- **Pas de mort**, pas de Game Over — le jeu est contemplatif et bienveillant

### 4.4 Progression

- **Journal de bord** : chaque escale ajoute une entrée avec le texte narratif d'Hippolyte, consultable à tout moment
- **Carte au trésor** : 7 fragments à assembler ; la destination finale (Saint-Peter Port) n'est visible qu'une fois tous les fragments obtenus
- **Sauvegarde automatique** dans `localStorage` — le jeu reprend exactement où on l'a laissé
- **Partage** : un bouton génère un lien URL encodé avec l'état du jeu (optionnel, implémentation phase 2)

***

## 5. Les Énigmes — Script Complet

### Énigme 0 — Cherbourg-Chantereyne (Tutoriel)
**Contexte PNJ (Marcel) :**
> *"Ah, te v'là, moussaillon. T'as l'air aussi perdu qu'un foc dans une risée. Écoute-moi bien : avant d'appareiller, on vérifie son compas. Ton premier cap pour Barfleur, c'est quoi ? Tu choisis à bâbord ou à tribord du vent ?"*

**Énigme :**
> Barfleur se trouve à l'**est** de Cherbourg. Le vent vient du **nord-ouest**. Pour rallier Barfleur en tirant des bords, quelle amure prends-tu au départ ?

**Options :** A) Bâbord amures ✓ | B) Tribord amures | C) Vent arrière

**Réponse correcte :** A — *"Bâbord amures, évidemment ! Le vent vient de la gauche quand on fait face au vent. Bravo, t'as pas la tête dans le sable. Marcel t'observe d'un œil moins dédaigneux."*

***

### Énigme 1 — Barfleur
**Contexte PNJ (Odette) :**
> *"Alors comme ça, t'as reçu le carnet du Palan ? Ce vieux filou m'avait promis de m'épouser. Il m'a laissé une devinette à la place. Typique. La v'là :"*

**Énigme (devinette décalée) :**
> *"Je suis un marin qui n'a pas de bras, qui ne boit pas et qui ne dort jamais. La nuit, je cligne de l'œil pour guider les perdus. Le jour, je me tais. Qui suis-je ?"*

**Réponse libre :** `phare` (accepter aussi : `feu`, `fanal`, `phare de barfleur`)

**Texte correct :** *"Un phare, pardi ! Et le phare de Barfleur, c'est le plus haut de France, mon gars — 71 mètres, 1 835 marches. T'aurais quand même pu monter le vérifier. Odette glisse un fragment de carte dans ta poche, non sans un soupir à faire flancher une vergue."*

***

### Énigme 2 — Saint-Vaast-la-Hougue
**Contexte PNJ (Gaston) :**
> *"Les huîtres, mon fils, elles s'ouvrent à marée montante. Hippolyte le savait. Il a caché son indice dans la tour Vauban de l'île Tatihou — mais le bac ne passe qu'à marée haute. Alors :"*

**Énigme (calcul de marée) :**
> La pleine mer est à **14h37**. Le coefficient est **95**. L'accès à Tatihou se fait dans la fenêtre **PM ± 2h15**. À quelle heure **au plus tôt** peux-tu embarquer pour Tatihou ?

**Réponse :** `12h22` (accepter ± 10 min : de 12h20 à 12h24)

**Texte correct :** *"12h22, exact comme un chrono de régatte. Gaston lève son chapeau. Les Tours Vauban sont classées au patrimoine mondial depuis 2008 — et dans leurs pierres, un carré de parchemin t'attend."*[^5]

***

### Énigme 3 — Braye Harbour, Aurigny
**Contexte PNJ (Dotty) :**
> *"Welcome — euh, bienvenue. Hippolyte, yes, he came here. Left a message. Said you'd have to earn it. VHF protocol, you know. What channel do Alderney Coastguard listen on ?"*

**Énigme :**
> Aurigny n'est pas dans les eaux françaises. Sur quel canal VHF dois-tu appeler la capitainerie d'Aurigny pour demander un poste d'amarrage ?

**Options :** A) VHF 16 | B) VHF 9 | C) VHF 74 ✓ | D) VHF 12

**Réponse correcte :** C — VHF 74 — *"VHF 74 pour la capitainerie, canal 16 pour les urgences. Dotty hoche la tête et sort de son tiroir un rouleau de parchemin. 'Hippolyte left this. Peculiar man. Good sailor, though.' Haïf compliment de la part d'une Aurignaise."*[^14]

***

### Énigme 4 — Granville
**Contexte PNJ (Prosper) :**
> *"La porte du bassin s'ouvre à PM ± 2h30. Le Palan avait le sens du timing. Il m'a dit : 'Prosper, mon gars, rappelle à mon successeur ce qu'on dit quand on quitte un port.' C'est une expression. Laquelle ?"*

**Énigme :**
> Dans le carnet de bord d'Hippolyte, cette phrase est barrée et réécrite trois fois : *"Quand on…  ______ les amarres, on ne…"*
>
> Quel verbe marin signifie **détacher les amarres pour partir** ?

**Réponse libre :** `larguer` (accepter : `larguer les amarres`, `appareiller`, `carguer`)

**Texte correct :** *"Larguer les amarres ! C'est bien ça. Et non 'décoller les cordes', espèce de terrestre. Prosper te tend un fragment trempé de jus de crevette, mais intègre. 'C'est le Palan qui l'avait planqué dans ma nasse. Fallait bien que ça serve à quelque chose.'"*

***

### Énigme 5 — Sound de Chausey
**Contexte (narratif, pas de PNJ humain) :**
> *Tu mouilles dans le Sound. Il est 19h00. La pyramide blanche se découpe sur le ciel orange. Autour de toi, dix bateaux embossés à couple se balancent mollement. Dans le carnet : « Trouve l'amer. Il est blanc, il est pointu, et quand tu le vois dans l'axe du chenal Beauchamp, t'es en sécurité. »*

**Énigme (clic sur carte) :**
> Sur la mini-carte de l'archipel affichée à l'écran, **clique sur la Pyramide** de Chausey pour valider l'amer.

**Mécanique :** Zone cliquable de 40×40 px centrée sur la Pyramide. Si le joueur clique ailleurs : *"Non, ça c'est un récif. Réessaie."*

**Texte correct :** *"La Pyramide de Chausey, érigée au XIXe siècle pour les navigateurs. Tu remarques une fissure dans sa base. Et dans la fissure… un fragment de parchemin, protégé par une bouteille en verre. Le Palan était méthodique, faut lui reconnaître ça."*[^9]

***

### Énigme 6 — Saint-Hélier (Jersey)
**Contexte PNJ (Inspecteur Dorey) :**
> *"Passeport, please. ETA soumise ? Formulaire de déclaration ? Non ? Monsieur, depuis le 23 avril 2026, les plaisanciers français doivent obligatoirement disposer d'une ETA pour naviguer vers les îles anglo-normandes. Je vais avoir besoin de vous retenir… à moins que vous puissiez répondre à mon petit rébus."*[^15]

**Énigme (rébus marin) :**
> Trouve le mot composé :
>
> 🐦 (MOUETTE) − ETTE + ✋ (MAIN) − AIN + 🛶 (NAGE, verbe) = ?

**Solution :** `MOUSSE` → non... réessayons avec un vrai rébus :

> **Image 1 :** Un *cabillot* (cheville) = **CABI** + **LOT**
> **Image 2 :** Une *écoute* = le mot désigne aussi une voile et s'entend comme **ÉCOUTE**
> **Rébus complet :** Prends les 3 premières lettres de CHALUT + les 2 dernières de AMURE = ?

*(Alternative plus simple, choix libre dans l'implémentation :)*

**Rébus :** Un **CHAT** + un **AMER** (amer = repère côtier) → **CHATAMER** → anagramme → **MÂCHERAIT** ? 

**Implémentation recommandée :** Utiliser un format à **choix multiples** pour cette escale, plus fiable :

> Hippolyte décrit dans son carnet *"la manœuvre qu'on exécute quand on veut ralentir en tirant des bords face au vent, pour ne pas aller trop vite dans une passe"*. Comment s'appelle cette technique ?

**Options :** A) Lofer | B) Empanner | C) Louvoyer ✓ | D) Affaler

**Réponse :** C — *"Louvoyer ! C'est l'art noble du plaisancier en Manche, face au vent dominant de secteur ouest. L'Inspecteur Dorey tamponne votre carnet de bord d'un coup sec. 'Very well. Allez, passez.' Il glisse sous le tampon un fragment de parchemin. 'Le vieux Kergoat était un habitué ici. Toujours en règle, lui.'"*

***

### Énigme 7 — Saint-Peter Port (Guernesey) — Finale
**Contexte PNJ (Hippolyte, fantôme) :**
> *"Alors t'es arrivé jusqu'ici. Pas mal pour un mousse de ton espèce. Devant toi, les sept fragments de ma carte. Remets-les dans le bon ordre et l'emplacement du trésor se révélera. Tu as les pièces en main — et maintenant, un peu de mémoire de ma route :"*

**Énigme (assemblage — drag & drop) :**
> Les 7 fragments de la carte au trésor s'affichent dans le désordre. Le joueur doit les **glisser-déposer** dans la grille 3×3 (une case vide au centre) pour recomposer la carte complète.
>
> La carte révèle : **les Minquiers** (récif entre Jersey et Saint-Malo) comme emplacement final du trésor — mais *"le trésor, c'était les amis qu'on s'est faits en chemin"*, dixit Hippolyte, dans un dernier clin d'œil au joueur.

**Texte de fin :**
> *"Tu as recollé les morceaux, moussaillon. Les Minquiers… il n'y a rien là-bas à marée haute, c'est vrai. Mais à marée basse, tu aurais trouvé ma bouteille de Calvados et un mot : 'Le vrai trésor, c'est d'avoir navigué. Le reste, c'est du lest.' Je te l'offre quand même, le Calvados — tu sais où me trouver : au bar du Victoria Marina, troisième tabouret en partant de la droite. Bonne route. Et borde ton foc."*
>
> — **FIN —** ⚓

***

## 6. Spécifications Techniques

### 6.1 Architecture recommandée

```
/
├── index.html          ← Point d'entrée unique
├── style.css           ← Thème marin (palette SHOM)
├── game.js             ← Moteur principal (state machine)
├── data/
│   ├── story.json      ← Tout le contenu narratif & énigmes
│   ├── ports.json      ← Coordonnées & métadonnées des ports
│   └── map.svg         ← Carte SVG interactive
├── assets/
│   ├── sounds/         ← (optionnel) vagues, cri de mouette
│   └── sprites/        ← SVG du voilier, fragments de carte
└── README.md
```

### 6.2 Technologies

| Composant | Technologie recommandée | Raison |
|-----------|------------------------|--------|
| UI/Rendu | HTML5 DOM + CSS3 | Zéro dépendance, portable partout[^1] |
| Carte interactive | SVG inline | Scalable, cliquable, animable en CSS |
| Animations | CSS transitions + `requestAnimationFrame` | Performant, no library |
| Sauvegarde | `localStorage` | Natif navigateur, persiste sans serveur |
| Drag & drop (finale) | HTML5 Drag and Drop API | Natif, pas de lib |
| Son (optionnel) | Web Audio API | Natif |
| Responsive | CSS Grid + media queries | S'adapte mobile/desktop |

> **Note :** Si Claude Code préfère un framework pour la structure d'état, **Svelte** ou **Vue 3** (CDN, sans bundler) sont acceptables. Éviter React + bundler pour garder la portabilité maximale.

### 6.3 State Machine du jeu

```javascript
// États possibles
const STATES = {
  INTRO: 'intro',           // Écran titre + prologue
  SAILING: 'sailing',       // Animation de navigation entre ports
  PORT: 'port',             // Dialogue PNJ
  RIDDLE: 'riddle',         // Présentation énigme
  ANSWER: 'answer',         // Attente réponse joueur
  WRONG: 'wrong',           // Mauvaise réponse (max 3)
  HINT: 'hint',             // Indice affiché
  SUCCESS: 'success',       // Bonne réponse + fragment
  MAP: 'map',               // Vue carte globale
  LOGBOOK: 'logbook',       // Journal de bord
  ENDGAME: 'endgame'        // Écran de fin
};

// Structure de données d'une escale
const portSchema = {
  id: 'string',
  name: 'string',
  coords: { x: Number, y: Number },  // % de la carte SVG
  pnj: { name: 'string', avatar: 'emoji ou SVG' },
  dialogue: ['string[]'],            // Lignes de dialogue avant énigme
  riddle: {
    text: 'string',
    type: 'multiple|free|click|dragdrop',
    options: ['string[]'],           // si multiple
    answers: ['string[]'],           // réponses acceptées (lowercase, trim)
    hints: ['string[]'],             // 1 à 3 indices progressifs
    successText: 'string',
    wrongText: 'string'
  },
  fragmentSVG: 'string',            // SVG du fragment de carte
  logEntry: 'string'                // Texte ajouté au journal
};
```

### 6.4 Palette graphique (thème SHOM marin)

```css
:root {
  --sea-deep:    #1a3a5c;   /* Fond mer profonde */
  --sea-shallow: #4a90b8;   /* Mer peu profonde */
  --chart-bg:    #f5f0e0;   /* Fond carte marine (parchemin) */
  --chart-line:  #2c3e50;   /* Traits de carte */
  --isobath:     #a8d4e6;   /* Isobathes */
  --land:        #e8dcc8;   /* Terres émergées */
  --port-color:  #c0392b;   /* Ports actifs */
  --gold:        #f39c12;   /* Trésor, fragments */
  --text-main:   #2c3e50;   /* Texte principal */
  --text-pnj:    #7f4c1a;   /* Paroles des PNJ */
  --font-main:   'Georgia', serif;
  --font-ui:     'Courier New', monospace;  /* Touches techniques */
}
```

### 6.5 Typographie & ton éditorial

- **Narrateur** : ton neutre, légèrement poétique, vocabulaire marin précis — utiliser les termes corrects (`écoute`, `amure`, `amer`, `empanner`)
- **Hippolyte** : vieux marin normand décalé, humour sec, expressions patoisantes (`moussaillon`, `gueule de raie`, `planter ses pattes de mouche`)
- **Marcel** : capitaine bourru, parle peu, soupire beaucoup
- **Odette** : bavarde, nostalgique, glisse des métaphores culinaires marines
- **Gaston** : philosophe contemplatif, cite Prévert et les tables de marée dans la même phrase
- **Dotty** : Aurignaise bilingue, accent anglais prononcé en français, directe
- **Prosper** : Granvillais, accent normand, phrases courtes, odeur de crevette
- **Inspecteur Dorey** : bureaucrate jersiais zélé, cache son admiration pour Hippolyte

### 6.6 Responsive & Accessibilité

- **Mobile first** : les boutons de réponse font minimum 44×44 px (WCAG 2.1 AA)
- **Contraste** : ratio minimum 4.5:1 pour tout texte[^1]
- **Clavier** : navigation Tab + Entrée fonctionnelle pour toutes les interactions
- **Écran de chargement** : la carte SVG se charge en deux passes (squelette puis détail)
- **Orientation** : portrait (mobile) et paysage (desktop) supportés via media queries

***

## 7. Flux d'Écrans

```
[Écran titre]
     │ Clic "Appareiller"
     ▼
[Prologue — lettre d'Hippolyte]
     │ Clic "Lire la suite"
     ▼
[Vue carte globale]
     │ Clic sur port disponible
     ▼
[Animation navigation] ──► transition fondu + voilier qui glisse
     │
     ▼
[Écran port — dialogue PNJ]
     │ Clic "Continuer"
     ▼
[Écran énigme]
     │
     ├── [Réponse juste] ──► [Animation fragment] ──► [Journal mis à jour] ──► [Retour carte]
     │
     └── [Mauvaise réponse x3] ──► [Affichage indice] ──► [Nouvelle tentative]
     
[Fin — tous fragments] ──► [Drag & drop finale] ──► [Écran de fin + crédits]
```

***

## 8. Contenu Audio (optionnel / Phase 2)

| Événement | Son suggéré |
|-----------|-------------|
| Navigation entre ports | Bruit de vague + vent léger |
| Bonne réponse | Coup de corne de brume joyeux |
| Mauvaise réponse | Cloche de brume triste |
| Découverte fragment | Mélodie accordéon brève |
| Écran de fin | Chant de marin (folk normand) |

***

## 9. Journal de Bord — Textes Complets (entrées débloquées)

Chaque entrée est rédigée à la première personne du joueur, style carnet de bord authentique :

**Cherbourg** : *"Appareillé ce matin de la Chantereyne par beau temps, petit vent de NW force 3. Marcel m'a regardé partir avec l'expression d'un chien à qui on aurait pris son os. La rade est grande. Le ciel est haut. Les îles m'attendent."*

**Barfleur** : *"Barfleur par le cap Lévi. Le phare est blanc, immense, silencieux. Odette m'a offert un café dans une tasse ébréchée et une devinette dans un cœur brisé. J'ai résolu la première."*

**Saint-Vaast** : *"Les tours Vauban de Tatihou se découpent sur le ciel. Les huîtres de Gaston valent le détour. Il dit que les marées sont les seules vraies horloges. Il a peut-être raison."*[^5]

**Aurigny** : *"Braye par le Raz Blanchard — des courants à se faire des cheveux blancs. La digue d'Aurigny est impressionnante. Dotty est directe comme un cap. J'aime ça."*[^6]

**Granville** : *"Granville par le sud. La porte du bassin s'est ouverte avec une ponctualité de commandant au carré. Prosper sent la crevette et la sagesse. Il m'a dit que larguer les amarres, c'est toujours la partie facile."*[^7]

**Chausey** : *"Le Sound de Chausey au coucher du soleil. Dix bateaux à couple, ça balance comme un hamac. La Pyramide est blanche. Le silence est épais. C'est ici qu'on comprend pourquoi on navigue."*[^9]

**Saint-Hélier** : *"Entrée dans le port de plaisance de Saint-Hélier, 5 ancres d'or. L'Inspecteur Dorey avait l'air d'un homme qui contrôle les passeports en rêvant d'autre chose. Je lui ai donné raison sur la réglementation ETA. Il m'a donné un fragment de carte."*[^10]

***

## 10. Checklist d'Implémentation pour Claude Code

### Phase 1 — Noyau jouable
- [ ] HTML/CSS de base : écran titre, écran port, écran carte
- [ ] `story.json` complet avec les 8 escales et énigmes
- [ ] Moteur de state machine en JS
- [ ] Carte SVG interactive avec ports cliquables
- [ ] Animation de navigation (voilier SVG qui se déplace)
- [ ] Système de réponse (choix multiple + texte libre)
- [ ] Sauvegarde `localStorage`

### Phase 2 — Polish
- [ ] Fragment de carte SVG × 7 + drag & drop finale
- [ ] Journal de bord consultable
- [ ] Animations CSS (phare clignotant, vague, fondu)
- [ ] Responsive mobile
- [ ] Écran de fin complet

### Phase 3 — Bonus
- [ ] Effets sonores (Web Audio API)
- [ ] Mode "nuit" (basculement palette sombre)
- [ ] Partage d'état via URL
- [ ] Easter egg : cliquer 3× sur le Raz Blanchard déclenche un avertissement d'Hippolyte

***

## 11. Notes de Localisation & Précision Nautique

- **Vocabulaire validé :** tous les termes marins utilisés dans les énigmes et dialogues sont issus du lexique nautique officiel français[^16][^17]
- **Ports réels :** les informations portuaires (VHF, profondeurs, portes abattantes) correspondent aux données de navigation réelles[^10][^6][^14]
- **ETA Anglo-normandes :** depuis le 23 avril 2026, une autorisation de voyage électronique est requise — intégrée comme élément narratif à Saint-Hélier[^15]
- **Chausey :** mouillage organisé en ZMEL depuis 2019, bouées visiteurs numérotées W1–W17 et E1–E9[^8]
- **Tatihou :** accessible à marée haute uniquement, tours Vauban classées UNESCO 2008[^5]
- **Aurigny :** 70 bouées visiteurs à Braye, VHF 74 pour la capitainerie[^6][^14]

***

*Document rédigé pour transmission à Claude Code — tous droits de modification réservés au capitaine Hippolyte Kergoat, dit le Palan.*

⚓ *Bon vent et bonne route.*

---

## References

1. [Tout ce qu’il faut savoir pour réaliser des jeux HTML5 avec Canvas et SVG](https://learn.microsoft.com/en-us/archive/blogs/davrous/tout-ce-quil-faut-savoir-pour-raliser-des-jeux-html5-avec-canvas-et-svg)

2. [Cherbourg](https://www.pavillonfrance.fr/fillere-entre-terre-mer/ports-francais/cherbourg) - Situé à mi-distance de Boulogne-sur-Mer et de Lorient, le port de Cherbourg-Cotentin est aussi proch...

3. [Liste des ports de la Manche](https://www.wikimanche.fr/Liste_des_ports_de_la_Manche) - Liste des ports de la Manche

4. [Saint-Vaast-la-Hougue, un petit coin de paradis où débarquer à l'est ...](https://www.ouest-france.fr/economie/tourisme/saint-vaast-la-hougue-un-petit-coin-de-paradis-a-l-est-du-cotentin-5f6ecfb4-802b-11ec-be7c-6adc9f4bf6f7) - L'île de Tatihou et ses fortifications rappellent l'histoire riche de ce port, un lieu d'embarquemen...

5. [Saint-Vaast-la-Hougue : Guide Complet 2026 - Cotentin Tourisme](https://www.cotentin-tourisme-normandie.fr/pointdevue/saint-vaast-la-hougue/) - Lieu convoité par les Vikings, puis par les Anglais au XIVe siècle, ce port est désormais apprécié p...

6. [Naviguer vers Aurigny | Visit Alderney, Channel Islands](https://www.visitalderney.com/visiter-aurigny/naviguer-vers-aurigny/) - Situé dans la Baie de Braye, notre petit port compte 70 bouées d'amarrage pour les visiteurs et des ...

7. [Tous les ports de la Manche |](https://ports-manche.com/ports) - spl

8. [Mouillages Chausey - Association](https://plaisanciers-dinard.fr/index.php/documentation/mouillage-a-chausey) - La vitesse maximale des navires dans les zones de mouillage est de 3 nœuds et les amarrages à emboss...

9. [Où mouiller ? En Manche : Sound de Chausey - Voile & Moteur](https://www.voileetmoteur.com/voiliers/naviguer/ou-mouiller-en-manche-sound-de-chausey/179919) - Par vent de secteur nord, le mouillage voisin de Port Marie, dans la petite anse au sud-est de Grand...

10. [Port Saint-Helier : Toutes les informations sur le port - Figaro Nautisme](https://figaronautisme.meteoconsult.fr/bloc-marine/info-port/1599-informations-port-saint-helier) - Le seuil du port de plaisance de Saint-Helier a un minimum de 1,8 m à l'ouverture de la porte. La ma...

11. [Plaisanciers visiteurs | Ports of Jersey](https://www.ports.je/jerseymarinas/french/) - Services offerts par la marina de St Hélier · Approches maritimes du port de plaisance de St Hélier ...

12. [Port Saint Peter Port](http://matsu-aquila.fr/port-mouillage/port/Saint%20Peter%20Port) - Coordonnées, commentaires et quelques images de Saint Peter Port, un des ports aperçus ou visités lo...

13. [GUERNESEY](https://www.pass-ports.com/fr/marina/205-guernesey) - Pass-Ports

14. [Port Braye : Toutes les informations sur le port - Figaro Nautisme](https://figaronautisme.meteoconsult.fr/bloc-marine/info-port/1588-informations-port-braye) - Profondeur : Quai commercial 1 à 5 m (réservé au commerce) ; Inner Harbour 1 à 4 m. Amarrage : Bon d...

15. [La Manche, ports et tourisme, Le port de Saint vaast la hougue, port ...](https://ports-manche.com/ports/saint-vaast-la-hougue) - Situé à 8 M au sud de la pointe de Barfleur, dans la Baie de Seine, le port de pêche et de plaisance...

16. [Vocabulaire marin: Tout le lexique du nautisme et du bateau](https://mersetbateaux.com/lexique-de-voile-bateaux/) - Découvrez et apprenez le vocabulaire marin utilisé sur les voiliers et bateaux à moteur. Tout le lex...

17. [Le vocabulaire du bateau - Orange-marine](https://www.orange-marine.com/content/434-le-vocabulaire-du-bateau) - Choquer une voile : Relâcher l'écoute de voile et la voile s'ouvrira. Éloigner la voile de l'axe du ...


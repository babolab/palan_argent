# Le Palan d'Argent
### *La Chasse au Trésor du Vieux Corsaire*

> *Un vieux loup de mer cébèche a caché son or dans les îles anglo-normandes. Appareille depuis Cherbourg, résous ses énigmes de port en port, et ramène le trésor avant que la marée tourne.*

**🎮 [Jouer en ligne](https://babolab.github.io/palan_argent/)** ← GitHub Pages

<p align="center">
  <img src="assets/qrcode.png" width="180" alt="QR code — babolab.github.io/palan_argent"/>
  <br><sub>Scanner pour jouer sur mobile</sub>
</p>

---

## Le jeu

Jeu d'aventure textuel/visuel à la première personne. Tu incarnes un plaisancier moderne qui a hérité du carnet de bord d'Hippolyte Kergoat, dit *"le Palan"* — corsaire raté, pilote côtier normand et fin connaisseur de la Manche.

**8 escales · 45–90 minutes · Sauvegarde automatique**

### Les escales

| # | Port | Région | Personnage |
|---|------|--------|-----------|
| 0 | Cherbourg-Chantereyne | Cotentin | Marcel, le capitaine grincheux |
| 1 | Barfleur | Cotentin | Odette, la patronne du café-tabac |
| 2 | Saint-Vaast-la-Hougue | Cotentin | Gaston, l'ostréiculteur philosophe |
| 3 | Braye Harbour, Aurigny | Alderney | Dotty, la capitaine anglophone |
| 4 | Granville | Cotentin | Prosper, le pêcheur de crevettes |
| 5 | Sound de Chausey | Archipel Chausey | La Pyramide (amer séculaire) |
| 6 | Saint-Hélier | Jersey | Inspecteur Dorey, douanier zélé |
| 7 | Saint-Peter Port | Guernesey | Hippolyte le Palan (fantôme) |

### Types d'énigmes

- **Choix multiple** — cap au compas, VHF, vocabulaire
- **Texte libre** — devinettes, vocabulaire marin
- **Calcul de marée** — fenêtre d'accès à Tatihou
- **Clic sur carte** — trouver l'amer dans le Sound de Chausey
- **Glisser-déposer** — reconstituer la carte au trésor finale

---

## Lancer localement

Aucune dépendance, aucune installation :

```bash
git clone https://github.com/babolab/palan_argent.git
cd palan_argent
python3 -m http.server 8080
# Ouvrir http://localhost:8080
```

> ⚠️ Nécessite un serveur HTTP local (pas `file://`) à cause du `fetch()` du fichier JSON.

---

## Architecture

```
palan_argent/
├── index.html        — Point d'entrée, carte SVG inline
├── style.css         — Thème SHOM (palette marine)
├── game.js           — State machine + mécaniques de jeu
├── data/
│   └── story.json    — 8 escales, PNJ, dialogues, énigmes
└── assets/           — Sons et sprites (Phase 3)
```

**Technologies :** HTML5 · CSS3 · JavaScript vanilla · SVG · `localStorage`
**Dépendances externes :** zéro.

### State machine

```
TITLE → PROLOGUE → MAP ⇄ LOGBOOK
                    ↓
                 SAILING → PORT → RIDDLE → (succès) → MAP
                                         → (échec)  → RIDDLE
                    └──────────────────────────────→ ENDGAME
```

---

## Authenticité nautique

- Vocabulaire marin validé (`écoute`, `amure`, `amer`, `empanner`, `louvoyer`)
- Informations portuaires réelles : VHF 74 pour Braye/Aurigny, porte PM ± 2h30 à Granville
- Tatihou accessible dans la fenêtre PM ± 2h15 (classée UNESCO 2008)
- ETA obligatoire pour les îles anglo-normandes depuis le 23 avril 2026
- Mouillage de Chausey : bouées visiteurs W1–W17 et E1–E9

---

## Easter egg

Clique **3 fois** sur Aurigny dans la carte — et méfie-toi du Raz Blanchard.

---

*Document de conception : [`spec.md`](spec.md)*
*— Hippolyte Kergoat, dit le Palan, quelque part entre deux marées* ⚓

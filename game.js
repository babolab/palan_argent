/**
 * Le Palan d'Argent — Moteur de jeu principal
 * State machine en JavaScript vanilla
 */

'use strict';

// ============================================================
// ÉTATS DE LA STATE MACHINE
// ============================================================
const STATES = {
  TITLE:    'title',
  PROLOGUE: 'prologue',
  MAP:      'map',
  SAILING:  'sailing',
  PORT:     'port',
  RIDDLE:   'riddle',
  LOGBOOK:  'logbook',
  ENDGAME:  'endgame'
};

// ============================================================
// ÉTAT DU JEU (chargé depuis localStorage ou initialisé)
// ============================================================
const DEFAULT_STATE = {
  currentScreen: STATES.TITLE,
  currentPortIndex: 0,
  dialogueLine: 0,
  triesLeft: 3,
  hintUsed: false,
  // completed[i] = true si l'énigme i est résolue
  completed: [false, false, false, false, false, false, false, false],
  // cornered[i] = true si l'indice a été utilisé pour ce port
  cornered: [false, false, false, false, false, false, false, false],
  // fragments obtenus (SVG data ou juste booléen)
  fragments: [],
  logEntries: [],
  // Pour l'énigme drag & drop finale : ordre actuel dans la grille
  ddGrid: [null, null, null, null, null, null, null, null, null]
};

// ============================================================
// VARIABLES GLOBALES
// ============================================================
let story = null;     // Données JSON chargées
let state  = null;     // État courant du jeu
let sailingTimeout = null;

// ============================================================
// INITIALISATION
// ============================================================
async function init() {
  try {
    const resp = await fetch('./data/story.json');
    story = await resp.json();
  } catch (e) {
    console.error('Impossible de charger story.json', e);
    document.body.innerHTML = '<p style="color:white;padding:2rem">Erreur de chargement. Rechargez la page.</p>';
    return;
  }

  // Charger ou créer l'état
  const saved = localStorage.getItem('palan_argent_state');
  if (saved) {
    try { state = JSON.parse(saved); } catch { state = { ...DEFAULT_STATE }; }
    // Migrer les champs manquants
    state = { ...DEFAULT_STATE, ...state };
  } else {
    state = { ...DEFAULT_STATE };
  }

  // Attacher les événements globaux
  attachGlobalEvents();

  // Afficher l'écran approprié
  goto(state.currentScreen || STATES.TITLE);
}

// ============================================================
// SAUVEGARDE
// ============================================================
function save() {
  try { localStorage.setItem('palan_argent_state', JSON.stringify(state)); } catch {}
}

function resetGame() {
  if (!confirm('Recommencer une nouvelle partie ? Ta progression sera perdue.')) return;
  localStorage.removeItem('palan_argent_state');
  state = { ...DEFAULT_STATE };
  save();
  goto(STATES.TITLE);
}

// ============================================================
// NAVIGATION ENTRE ÉCRANS
// ============================================================
function goto(screenName) {
  // Masquer tous les écrans
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  state.currentScreen = screenName;
  save();

  const el = document.getElementById('screen-' + screenName);
  if (el) el.classList.add('active');

  // Appeler le renderer de l'écran
  const renders = {
    [STATES.TITLE]:    renderTitle,
    [STATES.PROLOGUE]: renderPrologue,
    [STATES.MAP]:      renderMap,
    [STATES.SAILING]:  renderSailing,
    [STATES.PORT]:     renderPort,
    [STATES.RIDDLE]:   renderRiddle,
    [STATES.LOGBOOK]:  renderLogbook,
    [STATES.ENDGAME]:  renderEndgame
  };

  updateHUD();
  if (renders[screenName]) renders[screenName]();
}

// ============================================================
// HUD — Barre de progression
// ============================================================
function updateHUD() {
  const completed = state.completed.filter(Boolean).length;
  const total = story ? story.ports.length : 8;
  const pct = (completed / total) * 100;
  const bar = document.querySelector('.hud-bar');
  if (bar) bar.style.width = pct + '%';
}

// ============================================================
// ÉCRAN TITRE
// ============================================================
function renderTitle() {
  const hasSave = state.completed.some(Boolean) || state.logEntries.length > 0;
  const continueBtn = document.getElementById('btn-continue');
  if (continueBtn) {
    continueBtn.style.display = hasSave ? 'inline-flex' : 'none';
  }
}

// ============================================================
// ÉCRAN PROLOGUE
// ============================================================
function renderPrologue() {
  const el = document.getElementById('prologue-text');
  if (el && story) el.textContent = story.prologue;
}

// ============================================================
// ÉCRAN CARTE
// ============================================================
function renderMap() {
  if (!story) return;

  const svg = document.getElementById('main-map');
  if (!svg) return;

  // Mettre à jour les ports sur la carte SVG
  story.ports.forEach((port, i) => {
    const portEl = svg.querySelector(`#port-${port.id}`);
    if (!portEl) return;

    portEl.classList.remove('locked', 'completed', 'current', 'available');

    if (state.completed[i]) {
      portEl.classList.add('completed');
    } else if (i === 0 || state.completed[i - 1]) {
      // Port disponible = premier port ou port suivant le dernier complété
      if (i === getCurrentPortIndex()) {
        portEl.classList.add('current');
      } else {
        portEl.classList.add('available');
      }
    } else {
      portEl.classList.add('locked');
    }
  });

  // Mettre à jour la carte au trésor partielle
  renderTreasurePreview();

  // Positionner le voilier sur le port actuel
  updateBoatPosition();
}

function getCurrentPortIndex() {
  // Retourne l'index du premier port non complété
  for (let i = 0; i < state.completed.length; i++) {
    if (!state.completed[i]) return i;
  }
  return story.ports.length - 1;
}

function updateBoatPosition() {
  const boat = document.getElementById('boat-svg');
  if (!boat || !story) return;
  const idx = getCurrentPortIndex();
  const port = story.ports[Math.min(idx, story.ports.length - 1)];
  // Les coords sont en % de la viewbox 800×600
  const x = (port.coords.x / 100) * 800;
  const y = (port.coords.y / 100) * 600;
  boat.setAttribute('transform', `translate(${x - 10},${y - 18})`);
}

function renderTreasurePreview() {
  const preview = document.getElementById('treasure-preview-svg');
  if (!preview) return;
  const count = state.fragments.length;
  // Afficher visuellement combien de fragments ont été collectés
  preview.innerHTML = renderTreasureMapSVG(count);
}

function renderTreasureMapSVG(collected) {
  const colors = [
    '#f5f0e0','#e8dcc8','#d4c4a8','#c0aa88',
    '#a89068','#907850','#786040','#605028'
  ];
  // Grille 3×3 (case centrale vide = mystère)
  let cells = '';
  const positions = [
    [0,0],[1,0],[2,0],
    [0,1],      [2,1],
    [0,2],[1,2],[2,2]
  ];
  positions.forEach(([cx, cy], i) => {
    const filled = i < collected;
    cells += `<rect x="${cx*18+2}" y="${cy*18+2}" width="16" height="16"
      fill="${filled ? colors[i] : '#ccc'}"
      stroke="${filled ? '#f39c12' : '#aaa'}" stroke-width="0.5" rx="1"/>`;
    if (filled) {
      cells += `<text x="${cx*18+10}" y="${cy*18+13}" text-anchor="middle"
        font-size="9" fill="#7f4c1a">⚓</text>`;
    }
  });
  return `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect width="56" height="56" fill="#f5f0e0" rx="2"/>
    ${cells}
    <text x="28" y="32" text-anchor="middle" font-size="7" fill="#c0392b"
      ${collected >= 7 ? '' : 'display="none"'}>✕</text>
  </svg>`;
}

// ============================================================
// ANIMATION NAVIGATION (SAILING)
// ============================================================
function renderSailing() {
  const destEl = document.getElementById('sailing-dest');
  if (destEl && story) {
    const idx = state.currentPortIndex;
    destEl.textContent = story.ports[idx].name;
  }

  // Après 2.5s, aller au port
  if (sailingTimeout) clearTimeout(sailingTimeout);
  sailingTimeout = setTimeout(() => {
    goto(STATES.PORT);
  }, 2500);
}

// ============================================================
// ÉCRAN PORT — Dialogue PNJ
// ============================================================
function renderPort() {
  if (!story) return;
  const port = story.ports[state.currentPortIndex];
  if (!port) return;

  // Reset ligne de dialogue si on vient d'arriver
  if (state.dialogueLine === undefined) state.dialogueLine = 0;

  // En-tête
  setEl('port-name', port.name);
  setEl('port-region', port.region);
  setEl('port-pnj-emoji', port.pnj.emoji);

  // Dialogue courant
  renderDialogueLine(port);
}

function renderDialogueLine(port) {
  const line = state.dialogueLine;
  const total = port.dialogue.length;
  const bubble = document.getElementById('pnj-bubble');
  const pnjText = document.getElementById('pnj-text');
  const continueBtn = document.getElementById('btn-port-continue');
  const riddleBtn = document.getElementById('btn-port-riddle');

  if (!bubble || !pnjText) return;

  bubble.dataset.pnj = `${port.pnj.emoji} ${port.pnj.name}`;
  pnjText.textContent = port.dialogue[line] || '';

  // Dernière ligne → proposer l'énigme
  const isLast = line >= total - 1;
  if (continueBtn) continueBtn.style.display = isLast ? 'none' : 'inline-flex';
  if (riddleBtn) {
    riddleBtn.style.display = isLast ? 'inline-flex' : 'none';
    riddleBtn.textContent = state.completed[state.currentPortIndex]
      ? 'Continuer vers la carte →'
      : "Affronter l'énigme →";
  }
}

function advanceDialogue() {
  if (!story) return;
  const port = story.ports[state.currentPortIndex];
  if (state.dialogueLine < port.dialogue.length - 1) {
    state.dialogueLine++;
    save();
    renderDialogueLine(port);
  }
}

function goToRiddle() {
  if (state.completed[state.currentPortIndex]) {
    // Déjà complété, retour carte
    goto(STATES.MAP);
    return;
  }
  state.triesLeft = 3;
  state.hintUsed = false;
  save();
  goto(STATES.RIDDLE);
}

// ============================================================
// ÉCRAN ÉNIGME
// ============================================================
function renderRiddle() {
  if (!story) return;
  const port = story.ports[state.currentPortIndex];
  if (!port) return;

  const riddle = port.riddle;

  // En-tête
  setEl('riddle-port-name', port.name);
  updateTryDots();

  // Texte de l'énigme (markdown léger)
  const textEl = document.getElementById('riddle-text');
  if (textEl) textEl.innerHTML = simpleMarkdown(riddle.text);

  // Reset feedback
  hideFeedback();

  // Rendu selon le type
  const zones = {
    'zone-multiple': false,
    'zone-free':     false,
    'zone-click':    false,
    'zone-dragdrop': false
  };

  switch (riddle.type) {
    case 'multiple': zones['zone-multiple'] = true; renderMultiple(riddle); break;
    case 'free':     zones['zone-free']     = true; renderFree(riddle); break;
    case 'click':    zones['zone-click']    = true; renderClick(riddle); break;
    case 'dragdrop': zones['zone-dragdrop'] = true; renderDragDrop(riddle); break;
  }

  Object.entries(zones).forEach(([id, show]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
  });

  // Bouton indice
  const hintBtn = document.getElementById('btn-hint');
  if (hintBtn) {
    hintBtn.style.display = state.triesLeft < 3 && !state.hintUsed ? 'inline-flex' : 'none';
  }
}

function updateTryDots() {
  const dots = document.querySelectorAll('.try-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('used', i >= state.triesLeft);
  });
}

// -- Multiple choice --
function renderMultiple(riddle) {
  const container = document.getElementById('options-list');
  if (!container) return;
  container.innerHTML = '';
  riddle.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.setAttribute('aria-label', `Option ${String.fromCharCode(65+i)}: ${opt}`);
    btn.innerHTML = `<span style="font-family:var(--font-ui);margin-right:0.7rem;opacity:0.6">${String.fromCharCode(65+i)})</span>${opt}`;
    btn.addEventListener('click', () => submitMultiple(i, btn, riddle));
    container.appendChild(btn);
  });
}

function submitMultiple(chosen, btn, riddle) {
  const correct = riddle.answers.includes(String(chosen));
  if (correct) {
    btn.classList.add('correct');
    setTimeout(() => onSuccess(), 600);
  } else {
    btn.classList.add('wrong');
    onWrongAnswer(riddle);
  }
}

// -- Réponse libre --
function renderFree(riddle) {
  const input = document.getElementById('free-input');
  const submitBtn = document.getElementById('btn-free-submit');
  if (!input || !submitBtn) return;
  input.value = '';
  input.className = 'free-answer-input';
  input.focus();

  // Supprimer ancien listener
  const newInput = input.cloneNode(true);
  input.parentNode.replaceChild(newInput, input);
  const newBtn = submitBtn.cloneNode(true);
  submitBtn.parentNode.replaceChild(newBtn, submitBtn);

  newInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') newBtn.click();
  });

  newBtn.addEventListener('click', () => {
    const val = newInput.value.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const accepted = riddle.answers.map(a =>
      a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    );
    if (accepted.includes(val)) {
      newInput.classList.add('correct');
      setTimeout(() => onSuccess(), 600);
    } else {
      newInput.classList.add('wrong');
      setTimeout(() => newInput.classList.remove('wrong'), 600);
      onWrongAnswer(riddle);
    }
  });
}

// -- Clic sur carte (Chausey) --
function renderClick(riddle) {
  const mapEl = document.getElementById('chausey-map-svg');
  if (!mapEl) return;

  // Injecter la SVG de Chausey
  mapEl.innerHTML = buildChauseySVG();

  const wrap = document.getElementById('chausey-map-wrap');
  if (!wrap) return;

  // Supprimer ancien listener
  const newWrap = wrap.cloneNode(false);
  newWrap.innerHTML = mapEl.outerHTML;
  wrap.parentNode.replaceChild(newWrap, wrap);

  newWrap.addEventListener('click', (e) => {
    const rect = newWrap.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    // Animation click
    const dot = document.createElement('div');
    dot.className = 'click-feedback';
    dot.style.left = `${e.clientX - rect.left}px`;
    dot.style.top  = `${e.clientY - rect.top}px`;
    newWrap.appendChild(dot);
    setTimeout(() => dot.remove(), 900);

    // Zone cible : autour de la Pyramide (50%, 45%) rayon 12%
    const target = riddle.clickTarget || { x: 50, y: 45, radius: 12 };
    const dist = Math.sqrt((px - target.x) ** 2 + (py - target.y) ** 2);

    if (dist <= target.radius) {
      onSuccess();
    } else {
      onWrongAnswer(riddle);
    }
  });
}

function buildChauseySVG() {
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style="cursor:crosshair">
    <!-- Fond mer -->
    <rect width="300" height="200" fill="#a8d4e6"/>
    <!-- Île Grande (simplifiée) -->
    <ellipse cx="150" cy="110" rx="80" ry="55" fill="#e8dcc8" stroke="#2c3e50" stroke-width="1.5"/>
    <!-- Rochers/récifs -->
    <ellipse cx="60" cy="80" rx="18" ry="10" fill="#d4c4a8" stroke="#2c3e50" stroke-width="1"/>
    <ellipse cx="240" cy="140" rx="14" ry="8" fill="#d4c4a8" stroke="#2c3e50" stroke-width="1"/>
    <ellipse cx="200" cy="60" rx="10" ry="6" fill="#d4c4a8" stroke="#2c3e50" stroke-width="1"/>
    <ellipse cx="90" cy="165" rx="12" ry="7" fill="#d4c4a8" stroke="#2c3e50" stroke-width="1"/>
    <!-- Bouées (W1-W3) -->
    <circle cx="110" cy="75" r="4" fill="#f39c12" stroke="#7f4c1a" stroke-width="1"/>
    <text x="110" y="68" text-anchor="middle" font-size="8" fill="#7f4c1a">W1</text>
    <circle cx="175" cy="65" r="4" fill="#f39c12" stroke="#7f4c1a" stroke-width="1"/>
    <text x="175" y="58" text-anchor="middle" font-size="8" fill="#7f4c1a">W2</text>
    <!-- La Pyramide (zone cliquable) -->
    <polygon points="150,68 141,90 159,90" fill="white" stroke="#2c3e50" stroke-width="1.5"/>
    <text x="150" y="104" text-anchor="middle" font-size="8" fill="#2c3e50">Pyramide</text>
    <!-- Labels -->
    <text x="150" y="130" text-anchor="middle" font-size="11" fill="#2c3e50" font-style="italic">Île Grande</text>
    <text x="150" y="185" text-anchor="middle" font-size="9" fill="#4a90b8">Sound de Chausey</text>
    <text x="20" y="185" text-anchor="start" font-size="8" fill="#4a90b8">N →</text>
    <!-- Chenal Beauchamp -->
    <line x1="150" y1="40" x2="150" y2="68" stroke="#4a90b8" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="162" y="55" font-size="7" fill="#4a90b8">Chenal</text>
  </svg>`;
}

// -- Drag & Drop (finale) --
function renderDragDrop(riddle) {
  const pool = document.getElementById('fragments-pool');
  const grid = document.getElementById('grid-target');
  if (!pool || !grid) return;

  // Fragments disponibles (ceux qui ne sont pas encore placés)
  const placed = state.ddGrid.filter(Boolean);
  const available = [0,1,2,3,4,5,6].filter(i => !placed.includes(String(i)));

  pool.innerHTML = '';
  available.forEach(i => {
    const piece = createFragmentPiece(i);
    pool.appendChild(piece);
  });

  // Grille 3×3 (8 fragments + 1 case vide)
  grid.innerHTML = '';
  for (let c = 0; c < 9; c++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.cell = c;

    const cellContent = state.ddGrid[c];
    if (cellContent !== null && cellContent !== undefined) {
      const piece = createFragmentPiece(parseInt(cellContent));
      piece.draggable = true;
      piece.dataset.fromCell = c;
      cell.appendChild(piece);
      cell.classList.toggle('correct-place', String(c) === cellContent || correctPosition(c, parseInt(cellContent)));
    }

    setupDropTarget(cell, riddle);
    grid.appendChild(cell);
  }
}

function correctPosition(cellIndex, fragmentIndex) {
  // Ordre correct : fragments 0-2 en haut, 3 gauche, 4 droite, 5-6 en bas
  // Case centrale (4) = révélation finale, non utilisée comme fragment
  const mapping = [0,1,2,3,4,5,6];
  // Fragment i va dans la cellule i (sauf cellule 4 = vide/mystère)
  const targetCell = fragmentIndex < 4 ? fragmentIndex : fragmentIndex + 1;
  return cellIndex === targetCell;
}

function createFragmentPiece(index) {
  const piece = document.createElement('div');
  piece.className = 'fragment-piece';
  piece.draggable = true;
  piece.dataset.fragment = index;
  piece.setAttribute('aria-label', `Fragment ${index + 1}`);

  // Représentation visuelle du fragment (emoji + numéro)
  const icons = ['🏔️','🌊','⛵','🦅','🦐','🔺','🛂'];
  const labels = ['Cherbourg','Barfleur','St-Vaast','Aurigny','Granville','Chausey','St-Hélier'];
  piece.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;font-size:0.7rem;">
    <span style="font-size:1.4rem">${icons[index] || '📜'}</span>
    <span style="color:var(--text-pnj);font-size:0.65rem">${labels[index] || `#${index+1}`}</span>
  </div>`;

  // Events drag
  piece.addEventListener('dragstart', e => {
    e.dataTransfer.setData('fragmentIndex', index);
    e.dataTransfer.setData('fromCell', piece.dataset.fromCell || 'pool');
    piece.classList.add('dragging');
  });
  piece.addEventListener('dragend', () => piece.classList.remove('dragging'));

  return piece;
}

function setupDropTarget(cell, riddle) {
  cell.addEventListener('dragover', e => {
    e.preventDefault();
    cell.classList.add('drag-over');
  });
  cell.addEventListener('dragleave', () => cell.classList.remove('drag-over'));
  cell.addEventListener('drop', e => {
    e.preventDefault();
    cell.classList.remove('drag-over');
    const fragIdx = e.dataTransfer.getData('fragmentIndex');
    const fromCell = e.dataTransfer.getData('fromCell');

    // Si la cellule est déjà occupée, remettre l'ancien fragment dans le pool
    const cellIdx = parseInt(cell.dataset.cell);
    const existing = state.ddGrid[cellIdx];
    if (existing !== null && existing !== undefined) {
      // Remettre dans le pool
      state.ddGrid[cellIdx] = null;
    }

    // Libérer la cellule source si vient de la grille
    if (fromCell !== 'pool') {
      state.ddGrid[parseInt(fromCell)] = null;
    }

    // Placer le fragment
    state.ddGrid[cellIdx] = fragIdx;
    save();

    // Re-render
    renderDragDrop(riddle);

    // Vérifier si la disposition est correcte
    checkDragDropWin(riddle);
  });
}

function checkDragDropWin(riddle) {
  // Victoire si les 7 fragments sont placés (case 4 = vide)
  const placed = state.ddGrid.filter((v, i) => i !== 4 && v !== null && v !== undefined);
  if (placed.length === 7) {
    setTimeout(() => onSuccess(), 500);
  }
}

// ============================================================
// SOUMISSION & FEEDBACK
// ============================================================
function onSuccess() {
  const port = story.ports[state.currentPortIndex];
  state.completed[state.currentPortIndex] = true;

  // Ajouter le fragment
  if (!state.fragments.includes(state.currentPortIndex)) {
    state.fragments.push(state.currentPortIndex);
  }

  // Ajouter entrée journal
  if (!state.logEntries.find(e => e.port === port.id)) {
    state.logEntries.push({ port: port.id, name: port.name, text: port.logEntry });
  }

  save();

  // Afficher feedback succès
  showFeedback(port.riddle.successText, 'success');

  // Cacher les zones d'interaction
  ['zone-multiple','zone-free','zone-click','zone-dragdrop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Bouton continuer
  const actionsEl = document.querySelector('.riddle-actions');
  if (actionsEl) {
    const nextBtn = document.getElementById('btn-riddle-next');
    if (nextBtn) nextBtn.style.display = 'inline-flex';
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) hintBtn.style.display = 'none';
  }

  // Notification fragment
  showFragmentNotif(state.currentPortIndex);
}

function onWrongAnswer(riddle) {
  state.triesLeft = Math.max(0, state.triesLeft - 1);
  save();
  updateTryDots();

  if (state.triesLeft === 0) {
    // Plus d'essais → afficher indice automatiquement
    useHint(riddle);
  } else {
    showFeedback(riddle.wrongText, 'error');
    // Afficher le bouton indice si au moins 1 essai raté
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn && !state.hintUsed) hintBtn.style.display = 'inline-flex';
  }
}

function useHint(riddle) {
  if (!riddle || !riddle.hints || riddle.hints.length === 0) return;
  state.hintUsed = true;
  state.cornered[state.currentPortIndex] = true;
  save();

  // Choisir un indice adapté au nombre d'essais restants
  const hintIndex = Math.min(2 - state.triesLeft, riddle.hints.length - 1);
  const hintText = riddle.hints[Math.max(0, hintIndex)] || riddle.hints[0];

  showFeedback('💡 Indice : ' + hintText, 'hint');

  // Réinitialiser les essais avec une pénalité signalée
  if (state.triesLeft === 0) {
    state.triesLeft = 1; // Donner un dernier essai
    save();
    updateTryDots();
  }

  const hintBtn = document.getElementById('btn-hint');
  if (hintBtn) hintBtn.style.display = 'none';
}

function showFeedback(text, type) {
  const fb = document.getElementById('riddle-feedback');
  if (!fb) return;
  fb.textContent = text;
  fb.className = `feedback-box visible ${type}`;
}

function hideFeedback() {
  const fb = document.getElementById('riddle-feedback');
  if (fb) { fb.className = 'feedback-box'; fb.textContent = ''; }
}

function goToNextPort() {
  const nextIdx = state.currentPortIndex + 1;
  if (nextIdx >= story.ports.length) {
    // Toutes les escales complétées → fin du jeu
    goto(STATES.ENDGAME);
    return;
  }
  state.currentPortIndex = nextIdx;
  state.dialogueLine = 0;
  save();
  goto(STATES.SAILING);
}

function showFragmentNotif(portIdx) {
  const notif = document.getElementById('fragment-notif');
  if (!notif) return;
  notif.textContent = `Fragment ${portIdx + 1}/7 obtenu ! 🗺️`;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3000);
}

// ============================================================
// JOURNAL DE BORD
// ============================================================
function renderLogbook() {
  const container = document.getElementById('logbook-entries');
  if (!container) return;

  if (state.logEntries.length === 0) {
    container.innerHTML = '<p style="color:var(--text-light);font-style:italic">Aucune entrée pour l\'instant. Résous des énigmes pour remplir ton journal.</p>';
    return;
  }

  container.innerHTML = state.logEntries.map(entry => `
    <div class="log-entry">
      <h4>⚓ ${entry.name}</h4>
      <p>${entry.text}</p>
    </div>
  `).join('');
}

// ============================================================
// ÉCRAN FIN
// ============================================================
function renderEndgame() {
  const el = document.getElementById('endgame-text');
  if (el && story) el.textContent = story.endgame;
}

// ============================================================
// UTILITAIRES
// ============================================================
function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function simpleMarkdown(text) {
  // Markdown ultra-léger : gras, italique, saut de ligne
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// ============================================================
// ÉVÉNEMENTS GLOBAUX — Attacher une seule fois
// ============================================================
function attachGlobalEvents() {

  // ---- Titre ----
  on('btn-start', 'click', () => goto(STATES.PROLOGUE));
  on('btn-continue', 'click', () => {
    // Reprendre depuis le bon état
    const idx = getCurrentPortIndex();
    state.currentPortIndex = idx;
    state.dialogueLine = 0;
    save();
    goto(STATES.MAP);
  });
  on('btn-reset-title', 'click', resetGame);

  // ---- Prologue ----
  on('btn-prologue-next', 'click', () => {
    state.dialogueLine = 0;
    state.currentPortIndex = 0;
    save();
    goto(STATES.MAP);
  });

  // ---- Carte ----
  on('btn-logbook', 'click', () => goto(STATES.LOGBOOK));
  on('btn-restart-map', 'click', resetGame);

  // Les ports sont gérés via SVG, voir attachMapEvents() après le render

  // ---- Port ----
  on('btn-port-continue', 'click', advanceDialogue);
  on('btn-port-riddle', 'click', goToRiddle);
  on('btn-port-map', 'click', () => goto(STATES.MAP));

  // ---- Énigme ----
  on('btn-hint', 'click', () => {
    const port = story.ports[state.currentPortIndex];
    if (port) useHint(port.riddle);
  });
  on('btn-riddle-next', 'click', () => {
    const nextIdx = state.currentPortIndex + 1;
    if (nextIdx >= story.ports.length) {
      goto(STATES.ENDGAME);
    } else {
      state.currentPortIndex = nextIdx;
      state.dialogueLine = 0;
      save();
      goto(STATES.SAILING);
    }
  });
  on('btn-riddle-map', 'click', () => goto(STATES.MAP));

  // ---- Journal ----
  on('btn-logbook-close', 'click', () => goto(STATES.MAP));

  // ---- Fin ----
  on('btn-endgame-restart', 'click', resetGame);
}

function on(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

// Gérer les clics sur les ports de la carte SVG
function attachMapPortEvents() {
  if (!story) return;
  story.ports.forEach((port, i) => {
    const el = document.getElementById(`port-${port.id}`);
    if (!el) return;
    el.addEventListener('click', () => {
      if (el.classList.contains('locked')) return;
      state.currentPortIndex = i;
      state.dialogueLine = 0;
      save();
      if (state.completed[i]) {
        // Port déjà visité → dialogue rapide + retour carte
        goto(STATES.PORT);
      } else if (i === 0 || state.completed[i - 1]) {
        goto(STATES.SAILING);
      }
    });
    // Easter egg : Raz Blanchard (clic 3× sur Aurigny)
    el.dataset.clickCount = 0;
    el.addEventListener('click', () => {
      el.dataset.clickCount = parseInt(el.dataset.clickCount || 0) + 1;
      if (parseInt(el.dataset.clickCount) >= 3 && port.id === 'aurigny') {
        alert('⚠️ Hippolyte te crie dessus : « Fais gaffe au Raz Blanchard, espèce de terrestre ! Ces courants ont avalé de meilleurs marins que toi ! »');
        el.dataset.clickCount = 0;
      }
    });
  });
}

// ============================================================
// DÉMARRAGE
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await init();
  attachMapPortEvents();
});

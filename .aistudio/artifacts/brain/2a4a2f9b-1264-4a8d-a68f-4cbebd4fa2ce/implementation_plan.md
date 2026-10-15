# River Quest: Level Progression (Easy to Hard) & Boss System

Introduce a multi-stage difficulty progression across Level 1 (Easy), Level 2 (Normal), and Level 3 (Hard), where Level 1 focuses purely on platforming navigation, minion combat, and collecting 10 keys without a boss encounter, while subsequent levels feature the mechanical Leviathan Boss with escalating speed, hit points, and aggressive attack patterns.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user requested an Easy-to-Hard level progression with **no boss in the first level** and the **boss appearing in subsequent levels**. The following decisions establish the stage flow:

- **Confirmed Decision 1 (Stage Flow)**: Level 1 (Easy) serves as the tutorial and minion gauntlet. The player crosses the river docks and defeats serpents and drones to collect all 10 keys. Upon collecting key 10, the rescue boat lights up and triggers "STAGE 1 CLEAR!" without spawning the boss.
- **Confirmed Decision 2 (Boss Levels)**: Level 2 (Normal) and Level 3 (Hard) feature the Giant Mechanical Leviathan Boss rising from the river. In Level 2, the boss appears once the arena is reached with balanced claw and plasma attacks. In Level 3 (Hard), the Leviathan is armored, strikes faster, unleashes dual plasma projectile waves, and enters a ferocious enrage phase.
- **Confirmed Decision 3 (HUD & Progression UI)**: Add a Level indicator badge ("LVL 1 - EASY", "LVL 2 - NORMAL", "LVL 3 - HARD") to the top HUD and allow players to continue to the next stage upon victory, or restart from any unlocked stage.

---

## 1. Overview & Core Concept

- **What It Does**: Enhances the 16-bit action-platformer into a multi-tier campaign. Players experience a rewarding difficulty curve: learning movement, jumping water gaps, and timing crescent slashes in Level 1, then facing the Leviathan in Level 2 and conquering an aggressive cyber-boss in Level 3.
- **Target Audience / Persona**: Retro arcade and action-platformer enthusiasts who appreciate classic Capcom/Konami 16-bit pacing with telegraphed combat and responsive controls.
- **Key Value**: Eliminates sudden difficulty spikes for newcomers while providing replay value and mastery challenges across escalating difficulty tiers.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Title Screen**: "RIVER QUEST" logo with blinking "PRESS START" and stage indicator showing the current stage.
2. **Level 1 (Easy - Riverbank Crossing)**:
   - Green serpents patrol the grass; surveillance drones hover over water gaps.
   - Slower enemy projectile speed and reduced minion count.
   - Player collects 10 gold keys from enemies.
   - Reaching 10 keys displays a glowing prompt: "RIVER PATH CLEARED! BOARD THE BOAT!"
   - Stepping to the eastern dock triggers celebratory "STAGE 1 CLEAR!" fireworks and a button to advance to "STAGE 2: NORMAL".
3. **Level 2 (Normal - Leviathan Awoken)**:
   - River turns dark indigo dusk; stronger minions guard the island.
   - Collecting the keys causes the river to boil, triggering the screen shake and boss alarm as the Giant Mechanical Sea-Serpent rises.
   - Classic Boss encounter: Claw swipes, plasma orbs, head/jaw slash weak point.
   - Defeating the boss clears Stage 2 and unlocks "STAGE 3: HARD".
4. **Level 3 (Hard - Leviathan Fury)**:
   - Fiery crimson twilight sky; faster green serpents and rapid-fire combat drones.
   - Leviathan emerges with glowing ruby core, increased HP, and dual plasma sweeps.
   - Enrage phase below 40% HP: boss flashes and claws strike with greater velocity.
   - Defeating Stage 3 grants the ultimate "MISSION ACCOMPLISHED / GAME CLEAR!" grand fireworks celebration.

### Visual Identity & Theme
- **Color Palettes by Level**:
  - Level 1: Teal waters, golden-dusk sky with pastel clouds, bright serene lighting.
  - Level 2: Rich purple dusk sky, foaming cyan river, glowing pink boss eyes and cyber conduits.
  - Level 3: Deep violet and crimson twilight, fiery neon boss aura, heavy screen shake on impacts.
- **HUD Update**:
  - Top center: Crisp pixel badge displaying `LVL 1 [EASY]`, `LVL 2 [NORMAL]`, or `LVL 3 [HARD]`.
  - Keys, health, energy, pause, and mute remain seamlessly integrated at 360x640 pixel resolution.

---

## 3. Key Product Decisions & Trade-Offs

- **Level Structure**:
  - *Chosen Approach*: 3 distinct progressive stages with seamless "NEXT STAGE" transitions and automatic difficulty parameter scaling.
  - *Why*: Directly aligns with user prompt ("Ad level easy to hard do not show boss in first level show boss every time level") without bloating asset size.
- **Level 1 Clear Criteria**:
  - *Chosen Approach*: Collect 10 keys and reach the moored boat on the riverbank.
  - *Why*: Teaches all core mechanics (movement, gap jumping, attacking, key gathering) in a rewarding non-boss environment.
- **Boss Scaling Engine**:
  - *Chosen Approach*: Parameterized boss attributes (HP: 100 in L2 vs 160 in L3, claw speed: 1.0x vs 1.4x, plasma cooldown: 2.0s vs 1.1s, enrage trigger).
  - *Why*: Keeps code modular, predictable, and fully synchronized with the 60fps game loop.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  - 9:16 Viewport & CRT Overlay                         │
│  - Virtual D-Pad, Jump & Slash Touch Buttons           │
│  - Keyboard Listeners (WASD, Arrows, J, Space, P)      │
└──────────────────────────┬─────────────────────────────┘
                           │ controls & tick
┌──────────────────────────▼─────────────────────────────┐
│                   RiverQuestGame                       │
│  - currentLevel: 1 | 2 | 3                             │
│  - Level Parameters (minionSpeed, bossActive, bossHp)  │
│  - State Machine: TITLE -> PLAYING -> STAGE_CLEAR ...  │
├──────────────────────────┬─────────────────────────────┤
│ Level 1 (Easy):          │ Level 2 & 3 (Boss Levels):  │
│ - Boss: null             │ - Boss: Rising Leviathan    │
│ - Collect 10 keys        │ - Level 2: Normal AI        │
│ - Reach boat goal        │ - Level 3: Enraged AI       │
└──────────────────────────┴─────────────────────────────┘
```

- **State Management**:
  - Add `currentLevel: number` (1, 2, 3) to `RiverQuestGame`.
  - Add `difficultyLabel: string` for HUD rendering.
  - Level configuration table:
    - Level 1: `hasBoss: false`, `minionCount: 5`, `minionHp: 1`, `enemySpeed: 0.85`
    - Level 2: `hasBoss: true`, `bossHp: 100`, `bossSpeed: 1.0`, `minionHp: 2`
    - Level 3: `hasBoss: true`, `bossHp: 160`, `bossSpeed: 1.35`, `dualPlasma: true`
- **Stage Clear Modal**:
  - Level 1 & 2 Clear: Shows "STAGE CLEAR!" with "▶ NEXT LEVEL (LVL {n+1})" button.
  - Level 3 Clear: Shows "CAMPAIGN VICTORY!" with grand statistics and "▶ PLAY AGAIN".

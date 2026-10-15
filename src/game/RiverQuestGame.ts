import {
  GameState,
  Player,
  Minion,
  Boss,
  Projectile,
  Particle,
  FloatingText,
  KeyItem,
  ControlsState,
} from './types';
import { sound } from './audio';
import {
  drawTitleLogo,
  drawIndusBoat,
  drawBarrageDam,
  drawRiverWater,
  drawWoodenDock,
  drawIslandTerrain,
  drawHangingVines,
  drawHero,
  drawSeaSerpent,
  drawRobotDrone,
  drawGiantBoss,
  drawKeyItem,
  drawHUD,
  drawBossHUD,
} from './sprites';

export class RiverQuestGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 360;
  private height: number = 640;
  private worldWidth: number = 900;
  private cameraX: number = 0;

  public state: GameState = 'TITLE';
  public soundMuted: boolean = false;
  public currentLevel: number = 1; // 1: Easy, 2: Normal, 3: Hard
  public selectedStartLevel: number = 1;

  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private gameTime: number = 0;

  // Screen shake & hitstop
  private screenShake: number = 0;
  private hitstopTimer: number = 0;

  // Controls
  public controls: ControlsState = {
    left: false,
    right: false,
    jump: false,
    attack: false,
    justJumped: false,
    justAttacked: false,
  };

  // Entities
  private player: Player;
  private minions: Minion[] = [];
  private boss: Boss | null = null;
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private keyItems: KeyItem[] = [];

  // Fireworks & Confetti for Victory
  private victoryConfetti: Particle[] = [];
  private victoryFireworks: { x: number; y: number; timer: number; color: string; burst: boolean }[] = [];
  private victoryTimer: number = 0;

  // Platforms
  private platforms = [
    // Starting Wooden Pier / Dock on Left
    { x: 0, y: 460, width: 110, height: 180, type: 'dock' },
    // Intermediate stepping pier plank across water gap
    { x: 125, y: 470, width: 40, height: 170, type: 'dock_step' },
    // Grassy Riverbank Island
    { x: 180, y: 450, width: 720, height: 190, type: 'island' },
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.player = this.createInitialPlayer();
    this.resetToTitle();
  }

  private createInitialPlayer(): Player {
    return {
      x: 35,
      y: 400,
      vx: 0,
      vy: 0,
      width: 32,
      height: 52,
      isGrounded: false,
      facing: 'right',
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      keys: 0,
      targetKeys: 10,
      isAttacking: false,
      attackTimer: 0,
      attackCooldown: 0,
      slashHitbox: { x: 0, y: 0, width: 55, height: 45, active: false },
      hurtTimer: 0,
      invulnerableTimer: 0,
      animationFrame: 0,
      animationTimer: 0,
      state: 'idle',
    };
  }

  public resetToTitle() {
    this.state = 'TITLE';
    this.cameraX = 0;
    this.player = this.createInitialPlayer();
    this.minions = [];
    this.boss = null;
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.keyItems = [];
    this.victoryConfetti = [];
    this.victoryFireworks = [];
    sound.stopBGM();
  }

  public startGame(level: number = this.selectedStartLevel) {
    this.currentLevel = Math.max(1, Math.min(3, level));
    this.state = 'PLAYING';
    this.player = this.createInitialPlayer();
    this.cameraX = 0;
    this.minions = [];
    this.boss = null;
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.keyItems = [];
    this.victoryConfetti = [];
    this.victoryFireworks = [];
    this.victoryTimer = 0;

    // Level intro announcement
    const levelLabels = ['STAGE 1: EASY', 'STAGE 2: NORMAL', 'STAGE 3: HARD'];
    this.addFloatingText(this.width / 2, 220, levelLabels[this.currentLevel - 1], '#38bdf8');

    // Spawn minions based on difficulty
    this.spawnMinions();

    sound.startBGM();
  }

  public startNextLevel() {
    if (this.currentLevel < 3) {
      this.startGame(this.currentLevel + 1);
    } else {
      this.startGame(1);
    }
  }

  private spawnMinions() {
    let minionConfigs: { type: 'serpent' | 'drone'; x: number; y: number }[] = [];

    if (this.currentLevel === 1) {
      // Level 1 (Easy): 5 minions, slower and non-boss stage
      minionConfigs = [
        { type: 'serpent', x: 260, y: 422 },
        { type: 'drone', x: 360, y: 350 },
        { type: 'serpent', x: 470, y: 422 },
        { type: 'drone', x: 580, y: 340 },
        { type: 'serpent', x: 690, y: 422 },
      ];
    } else if (this.currentLevel === 2) {
      // Level 2 (Normal): 7 minions, standard challenge
      minionConfigs = [
        { type: 'serpent', x: 250, y: 422 },
        { type: 'drone', x: 330, y: 350 },
        { type: 'serpent', x: 410, y: 422 },
        { type: 'drone', x: 490, y: 340 },
        { type: 'serpent', x: 570, y: 422 },
        { type: 'drone', x: 650, y: 350 },
        { type: 'serpent', x: 730, y: 422 },
      ];
    } else {
      // Level 3 (Hard): 8 aggressive minions
      minionConfigs = [
        { type: 'serpent', x: 240, y: 422 },
        { type: 'drone', x: 310, y: 330 },
        { type: 'serpent', x: 380, y: 422 },
        { type: 'drone', x: 460, y: 340 },
        { type: 'serpent', x: 540, y: 422 },
        { type: 'drone', x: 620, y: 330 },
        { type: 'serpent', x: 700, y: 422 },
        { type: 'drone', x: 770, y: 340 },
      ];
    }

    const speedScale = this.currentLevel === 1 ? 0.75 : this.currentLevel === 2 ? 1.0 : 1.35;
    const shootCdScale = this.currentLevel === 1 ? 3.5 : this.currentLevel === 2 ? 2.5 : 1.8;

    this.minions = minionConfigs.map((cfg, idx) => ({
      id: idx + 1,
      type: cfg.type,
      x: cfg.x,
      y: cfg.y,
      vx: (cfg.type === 'serpent' ? (idx % 2 === 0 ? 0.7 : -0.7) : 0.8) * speedScale,
      vy: 0,
      baseY: cfg.y,
      width: cfg.type === 'serpent' ? 36 : 30,
      height: cfg.type === 'serpent' ? 26 : 28,
      health: cfg.type === 'serpent' ? (this.currentLevel === 3 ? 3 : 2) : 1,
      maxHealth: cfg.type === 'serpent' ? (this.currentLevel === 3 ? 3 : 2) : 1,
      hurtTimer: 0,
      facing: 'left',
      timer: Math.random() * 5,
      shootCooldown: shootCdScale + Math.random() * 1.5,
      isDead: false,
    }));
  }

  private spawnBoss() {
    // Only spawn boss in Level 2 and Level 3!
    if (this.currentLevel === 1) return;

    this.state = 'BOSS_INTRO';
    sound.playBossRoar();
    this.addScreenShake(14);

    const isHard = this.currentLevel === 3;
    const bossTitle = isHard ? 'ENRAGED LEVIATHAN!' : 'LEVIATHAN AWAKENS!';
    this.addFloatingText(this.cameraX + this.width / 2, 220, bossTitle, '#f43f5e');

    // Boss spawns in the river behind the island arena
    const bossX = 490;
    const maxHp = isHard ? 160 : 110;

    this.boss = {
      x: bossX,
      y: 520, // starts submerged
      targetY: 340, // rises out of river
      width: 140,
      height: 220,
      health: maxHp,
      maxHealth: maxHp,
      hurtTimer: 0,
      state: 'rising',
      stateTimer: 0,
      clawPhase: 0,
      facing: 'left',
      jawHitbox: { x: bossX + 15, y: 340 + 20, width: 70, height: 45 },
      claws: {
        left: { x: -45, y: 65, targetX: -45, targetY: 65, attacking: false },
        right: { x: 75, y: 60, targetX: 75, targetY: 60, attacking: false },
      },
      plasmaTimer: isHard ? 1.2 : 2.0,
      defeatedTimer: 0,
      isEnraged: isHard,
      speedMultiplier: isHard ? 1.35 : 1.0,
    };

    // Splash water explosion
    this.createWaterSplash(bossX + 20, 480, 40);
  }

  public triggerStageClear() {
    this.state = 'STAGE_CLEAR';
    this.victoryTimer = 0;
    this.player.state = 'victory';
    this.player.vx = 0;
    this.player.vy = 0;

    // Reposition player onto island center stage for clear view
    this.player.x = this.cameraX + this.width / 2 - 16;
    this.player.y = 398;
    this.player.facing = 'right';

    sound.playVictoryFanfare();

    // Spawn victory confetti pool
    for (let i = 0; i < 70; i++) {
      this.spawnConfettiParticle();
    }
  }

  private spawnConfettiParticle() {
    const colors = ['#f43f5e', '#38bdf8', '#facc15', '#4ade80', '#c084fc', '#fb923c', '#ffffff'];
    this.victoryConfetti.push({
      x: this.cameraX + Math.random() * this.width,
      y: Math.random() * -100,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.5 + Math.random() * 2.5,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: 0,
      shape: 'confetti',
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.1,
    });
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
    }
  }

  public toggleMute(): boolean {
    this.soundMuted = sound.toggleMute();
    return this.soundMuted;
  }

  public handleCanvasClick(screenX: number, screenY: number) {
    // Check Top-Right HUD buttons during PLAYING or PAUSED
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      // Top-right Mute button (x: 290 - 325, y: 10 - 38)
      if (screenX >= 290 && screenX <= 325 && screenY >= 10 && screenY <= 38) {
        this.toggleMute();
        return;
      }
      // Top-right Pause button (x: 325 - 355, y: 10 - 38)
      if (screenX >= 325 && screenX <= 355 && screenY >= 10 && screenY <= 38) {
        this.togglePause();
        return;
      }
    }

    if (this.state === 'TITLE') {
      // Check difficulty selection buttons on Title Screen (y: 380 - 450)
      if (screenY >= 370 && screenY <= 450) {
        if (screenX >= 20 && screenX <= 120) {
          this.selectedStartLevel = 1;
          sound.playKeyPickup();
          return;
        } else if (screenX >= 130 && screenX <= 230) {
          this.selectedStartLevel = 2;
          sound.playKeyPickup();
          return;
        } else if (screenX >= 240 && screenX <= 340) {
          this.selectedStartLevel = 3;
          sound.playKeyPickup();
          return;
        }
      }

      sound.playJump();
      this.startGame(this.selectedStartLevel);
      return;
    }

    if (this.state === 'STAGE_CLEAR') {
      sound.playJump();
      // Check if clicking "NEXT LEVEL" or "TITLE"
      if (screenY >= 530 && screenY <= 590) {
        if (this.currentLevel < 3) {
          this.startNextLevel();
        } else {
          this.resetToTitle();
        }
        return;
      }
      this.startNextLevel();
      return;
    }

    if (this.state === 'GAME_OVER') {
      sound.playJump();
      this.startGame(this.currentLevel);
      return;
    }

    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
    }
  }

  public addScreenShake(amount: number) {
    this.screenShake = Math.max(this.screenShake, amount);
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#facc15') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -1.2,
    });
  }

  public createWaterSplash(x: number, y: number, count: number = 14) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.4 ? '#ffffff' : '#38bdf8',
        alpha: 1.0,
        decay: 0.03 + Math.random() * 0.03,
        shape: 'spark',
      });
    }
  }

  public createDroneDebris(x: number, y: number) {
    // Shatter into metallic shards and debris
    const debrisColors = ['#94a3b8', '#64748b', '#cbd5e1', '#38bdf8', '#f43f5e'];
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 3 + Math.random() * 4,
        color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        shape: 'debris',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
      });
    }
    // Explosion fire motes
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 2,
        size: 6 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
        alpha: 0.9,
        decay: 0.05,
        shape: 'smoke',
      });
    }
  }

  // --- GAME LOOP & UPDATES ---
  public start() {
    this.lastTime = performance.now();
    const loop = (timestamp: number) => {
      const rawDt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopBGM();
  }

  private update(dt: number) {
    this.gameTime += dt;

    // Hitstop freeze handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    if (this.state === 'TITLE') {
      return;
    }

    if (this.state === 'PAUSED') {
      return;
    }

    if (this.state === 'STAGE_CLEAR') {
      this.updateStageClear(dt);
      return;
    }

    if (this.state === 'GAME_OVER') {
      return;
    }

    // Active gameplay update
    this.updatePlayer(dt);
    this.updateCamera();
    this.updateMinions(dt);
    this.updateBoss(dt);
    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.updateKeyItems(dt);
    this.updateFloatingTexts(dt);
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Timers
    if (p.hurtTimer > 0) p.hurtTimer -= dt;
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;

    // Energy passive regen
    p.energy = Math.min(p.maxEnergy, p.energy + dt * 15);

    // Horizontal Movement
    const moveSpeed = 160;
    const accel = 900;
    const friction = 750;

    if (this.controls.left && !this.controls.right) {
      p.vx = Math.max(p.vx - accel * dt, -moveSpeed);
      p.facing = 'left';
    } else if (this.controls.right && !this.controls.left) {
      p.vx = Math.min(p.vx + accel * dt, moveSpeed);
      p.facing = 'right';
    } else {
      // Decelerate
      if (p.vx > 0) p.vx = Math.max(0, p.vx - friction * dt);
      else if (p.vx < 0) p.vx = Math.min(0, p.vx + friction * dt);
    }

    // Jump
    const gravity = 850;
    const jumpForce = -380;

    if (this.controls.justJumped && p.isGrounded) {
      p.vy = jumpForce;
      p.isGrounded = false;
      this.controls.justJumped = false;
      sound.playJump();

      // Check if jumping off dock edge into gap: spawn water splash
      if (p.x < 170 && p.x > 100) {
        this.createWaterSplash(p.x + p.width / 2, 470, 8);
      }
    }

    // Apply gravity
    p.vy += gravity * dt;

    // Update positions
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // World boundaries
    p.x = Math.max(0, Math.min(p.x, this.worldWidth - p.width));

    // Platform Collisions
    p.isGrounded = false;
    for (const plat of this.platforms) {
      // Check horizontal overlap
      if (p.x + p.width - 6 > plat.x && p.x + 6 < plat.x + plat.width) {
        // Falling onto platform surface
        const prevBottom = p.y + p.height - p.vy * dt;
        const currentBottom = p.y + p.height;

        if (prevBottom <= plat.y + 4 && currentBottom >= plat.y) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          break;
        }
      }
    }

    // Water pit hazard (falling between dock and island)
    if (p.y > 520) {
      // Fell into water!
      sound.playHit();
      this.createWaterSplash(p.x + p.width / 2, 500, 25);
      p.health -= 25;
      this.addFloatingText(p.x, 480, '-25 WATER HAZARD', '#f43f5e');

      if (p.health <= 0) {
        this.state = 'GAME_OVER';
        sound.stopBGM();
        return;
      }
      // Respawn back on the wooden dock
      p.x = 40;
      p.y = 400;
      p.vx = 0;
      p.vy = 0;
      p.hurtTimer = 0.5;
      p.invulnerableTimer = 1.5;
    }

    // Crescent Slash Attack
    if (this.controls.justAttacked && p.attackCooldown <= 0) {
      this.controls.justAttacked = false;
      p.isAttacking = true;
      p.attackTimer = 0.22;
      p.attackCooldown = 0.32;
      sound.playSlash();

      // Activate slash hitbox in front of player
      const dir = p.facing === 'right' ? 1 : -1;
      p.slashHitbox = {
        x: p.facing === 'right' ? p.x + p.width : p.x - 50,
        y: p.y + 6,
        width: 50,
        height: 44,
        active: true,
      };

      // Slash sparks
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: p.slashHitbox.x + Math.random() * p.slashHitbox.width,
          y: p.slashHitbox.y + Math.random() * p.slashHitbox.height,
          vx: dir * (2 + Math.random() * 3),
          vy: (Math.random() - 0.5) * 3,
          size: 3,
          color: '#38bdf8',
          alpha: 1.0,
          decay: 0.08,
          shape: 'spark',
        });
      }

      // Check hits against Minions
      this.checkSlashMinionHits();

      // Check hits against Boss Jaw/Head (Levels 2 & 3 only)
      if (this.currentLevel >= 2) {
        this.checkSlashBossHits();
      }
    }

    if (p.isAttacking) {
      p.attackTimer -= dt;
      if (p.attackTimer <= 0) {
        p.isAttacking = false;
        p.slashHitbox.active = false;
      }
    }

    // Determine Animation State
    if (p.isAttacking) {
      p.state = 'attack';
    } else if (!p.isGrounded) {
      p.state = 'jump';
    } else if (Math.abs(p.vx) > 10) {
      p.state = 'run';
      p.animationTimer += dt;
      if (p.animationTimer > 0.09) {
        p.animationFrame++;
        p.animationTimer = 0;
      }
    } else {
      p.state = 'idle';
    }
  }

  private updateCamera() {
    // Camera smoothly follows player with target lookahead
    const targetCamX = Math.max(0, Math.min(this.player.x - this.width * 0.38, this.worldWidth - this.width));
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
  }

  private checkSlashMinionHits() {
    const p = this.player;
    const hb = p.slashHitbox;

    for (const m of this.minions) {
      if (m.isDead) continue;

      // Check overlap
      if (
        hb.x < m.x + m.width &&
        hb.x + hb.width > m.x &&
        hb.y < m.y + m.height &&
        hb.y + hb.height > m.y
      ) {
        // Hit minion!
        m.health -= 1;
        m.hurtTimer = 0.2;
        this.addScreenShake(4);

        if (m.health <= 0) {
          m.isDead = true;

          if (m.type === 'drone') {
            sound.playDroneShatter();
            this.createDroneDebris(m.x + m.width / 2, m.y + m.height / 2);
            this.addFloatingText(m.x, m.y - 10, 'SHATTER!', '#38bdf8');
          } else {
            sound.playHit();
            this.createWaterSplash(m.x + m.width / 2, m.y + m.height, 12);
            this.addFloatingText(m.x, m.y - 10, 'SLICED!', '#4ade80');
          }

          // Drop a gold key!
          this.spawnKeyItem(m.x + m.width / 2, m.y);

          // Check level objective progress
          this.checkLevelObjective();
        } else {
          sound.playHit();
          this.addFloatingText(m.x, m.y - 10, 'HIT!', '#ffffff');
          // Knockback minion
          m.vx = p.facing === 'right' ? 1.5 : -1.5;
        }
      }
    }
  }

  private checkSlashBossHits() {
    if (!this.boss || this.boss.state === 'rising' || this.boss.state === 'defeated') return;

    const p = this.player;
    const hb = p.slashHitbox;
    const b = this.boss;

    // Boss Jaw / Head Hitbox (Frames 00:07 - 00:08)
    const jawBox = {
      x: b.x - 20,
      y: b.y - 50,
      width: 90,
      height: 70,
    };

    if (
      hb.x < jawBox.x + jawBox.width &&
      hb.x + hb.width > jawBox.x &&
      hb.y < jawBox.y + jawBox.height &&
      hb.y + hb.height > jawBox.y
    ) {
      // Hit Boss Jaw!
      const damage = this.currentLevel === 3 ? 15 : 18;
      b.health -= damage;
      b.hurtTimer = 0.35; // Red hit flash!
      this.hitstopTimer = 0.05; // 50ms juicy hitstop!
      this.addScreenShake(9);
      sound.playBossHit();

      // Check enrage trigger in Level 3
      if (this.currentLevel === 3 && b.health < b.maxHealth * 0.45 && !b.isEnraged) {
        b.isEnraged = true;
        this.addFloatingText(jawBox.x + 35, jawBox.y - 30, 'LEVIATHAN ENRAGED!', '#ef4444');
        sound.playBossRoar();
      }

      this.addFloatingText(jawBox.x + 35, jawBox.y - 15, `-${damage} CRITICAL!`, '#f43f5e');

      // Heavy cyan slash & spark burst on boss head
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          x: jawBox.x + 35 + (Math.random() - 0.5) * 30,
          y: jawBox.y + 30 + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: 4,
          color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
          alpha: 1.0,
          decay: 0.04,
          shape: 'spark',
        });
      }

      if (b.health <= 0) {
        b.health = 0;
        b.state = 'defeated';
        sound.playBossRoar();
        this.addScreenShake(18);
        this.createDroneDebris(b.x + 20, b.y);
      }
    }
  }

  private spawnKeyItem(x: number, y: number) {
    this.keyItems.push({
      x,
      y,
      vy: -3.5,
      baseY: 420,
      collected: false,
      timer: 0,
    });
  }

  private updateKeyItems(dt: number) {
    for (const key of this.keyItems) {
      if (key.collected) continue;

      key.timer += dt;
      key.y += key.vy;
      key.vy += 9.8 * dt * 0.8;

      if (key.y > key.baseY) {
        key.y = key.baseY;
        key.vy = 0;
      }

      // Check collision with player
      const dx = this.player.x + this.player.width / 2 - key.x;
      const dy = this.player.y + this.player.height / 2 - key.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 32) {
        key.collected = true;
        this.player.keys = Math.min(10, this.player.keys + 1);
        sound.playKeyPickup();
        this.addFloatingText(key.x, key.y - 15, '+1 KEY', '#facc15');

        // Sparkle burst
        for (let i = 0; i < 8; i++) {
          this.particles.push({
            x: key.x,
            y: key.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: 3,
            color: '#facc15',
            alpha: 1.0,
            decay: 0.05,
            shape: 'spark',
          });
        }

        // Check level progression
        this.checkLevelObjective();
      }
    }

    this.keyItems = this.keyItems.filter((k) => !k.collected);
  }

  private checkLevelObjective() {
    if (this.state !== 'PLAYING') return;

    if (this.currentLevel === 1) {
      // Level 1: DO NOT SHOW BOSS!
      // Once player collects 10 keys or defeats all minions, trigger Stage 1 victory!
      const aliveMinions = this.minions.filter((m) => !m.isDead).length;
      if (this.player.keys >= 10 || aliveMinions === 0) {
        this.player.keys = 10;
        this.addFloatingText(this.player.x, this.player.y - 25, 'STAGE 1 COMPLETE!', '#4ade80');
        // Short pause then trigger stage clear
        setTimeout(() => {
          if (this.state === 'PLAYING') {
            this.triggerStageClear();
          }
        }, 800);
      }
    } else {
      // Level 2 & 3: SHOW BOSS!
      const aliveMinions = this.minions.filter((m) => !m.isDead).length;
      if ((aliveMinions === 0 || this.player.keys >= 10) && !this.boss) {
        this.player.keys = 10;
        this.spawnBoss();
      }
    }
  }

  private updateMinions(dt: number) {
    for (const m of this.minions) {
      if (m.isDead) continue;

      m.timer += dt;
      if (m.hurtTimer > 0) m.hurtTimer -= dt;

      if (m.type === 'serpent') {
        // Slither back and forth on island
        m.x += m.vx * 40 * dt;
        if (m.x < 220) {
          m.x = 220;
          m.vx = Math.abs(m.vx);
          m.facing = 'right';
        } else if (m.x > 820) {
          m.x = 820;
          m.vx = -Math.abs(m.vx);
          m.facing = 'left';
        } else {
          m.facing = m.vx > 0 ? 'right' : 'left';
        }

        // Check collision with player
        if (this.player.invulnerableTimer <= 0) {
          if (
            this.player.x < m.x + m.width &&
            this.player.x + this.player.width > m.x &&
            this.player.y < m.y + m.height &&
            this.player.y + this.player.height > m.y
          ) {
            const dmg = this.currentLevel === 1 ? 8 : this.currentLevel === 2 ? 12 : 16;
            this.hurtPlayer(dmg, m.x);
          }
        }
      } else if (m.type === 'drone') {
        // Drone hovers with sine wave and tracks player
        m.x += m.vx * 35 * dt;
        m.y = m.baseY + Math.sin(m.timer * 3) * 18;

        if (m.x < 250) {
          m.x = 250;
          m.vx = Math.abs(m.vx);
        } else if (m.x > 840) {
          m.x = 840;
          m.vx = -Math.abs(m.vx);
        }

        // Drone laser shot
        m.shootCooldown -= dt;
        if (m.shootCooldown <= 0) {
          m.shootCooldown = (this.currentLevel === 3 ? 1.8 : 2.8) + Math.random() * 1.5;
          // Shoot laser projectile towards player
          const angle = Math.atan2(
            this.player.y + 20 - m.y,
            this.player.x + 16 - m.x
          );
          const laserSpeed = this.currentLevel === 1 ? 110 : this.currentLevel === 2 ? 140 : 175;
          this.projectiles.push({
            x: m.x + m.width / 2,
            y: m.y + m.height / 2,
            vx: Math.cos(angle) * laserSpeed,
            vy: Math.sin(angle) * laserSpeed,
            radius: 4,
            type: 'enemy_laser',
            timer: 4.0,
          });
        }
      }
    }
  }

  private updateBoss(dt: number) {
    if (!this.boss) return;
    const b = this.boss;

    if (b.hurtTimer > 0) b.hurtTimer -= dt;

    if (b.state === 'rising') {
      b.y -= 70 * dt;
      this.createWaterSplash(b.x + 20, 480, 2);

      if (b.y <= b.targetY) {
        b.y = b.targetY;
        b.state = 'idle';
        b.stateTimer = 1.5;
        this.state = 'PLAYING';
      }
      return;
    }

    if (b.state === 'defeated') {
      b.defeatedTimer += dt;
      this.addScreenShake(6);

      // Series of mechanical explosions
      if (Math.floor(b.defeatedTimer * 10) % 2 === 0) {
        const ex = b.x + (Math.random() - 0.5) * 90;
        const ey = b.y + (Math.random() - 0.5) * 80;
        this.createDroneDebris(ex, ey);
        sound.playDroneShatter();
      }

      // Sinks back into river
      b.y += 35 * dt;

      if (b.defeatedTimer > 2.5) {
        this.triggerStageClear();
      }
      return;
    }

    // Boss AI Phases: Claw Swipe, Plasma Barrage, Surge
    const speedMult = b.speedMultiplier || 1.0;
    b.stateTimer -= dt * speedMult;
    b.plasmaTimer -= dt * speedMult;

    // Claw attack cycle
    if (b.state === 'idle' && b.stateTimer <= 0) {
      const pick = Math.random();
      if (pick < 0.5) {
        b.state = 'attack_claw';
        b.stateTimer = 2.0;
        sound.playSlash();
      } else {
        b.state = 'attack_plasma';
        b.stateTimer = 2.5;
      }
    } else if (b.state === 'attack_claw') {
      // Swiping claw down toward island!
      const clawSweep = Math.sin((2.0 - b.stateTimer) * 3.5) * (b.isEnraged ? 65 : 55);
      b.claws.left.y = 65 + clawSweep;
      b.claws.right.y = 60 + clawSweep;

      // Check claw impact on player
      if (clawSweep > 40 && this.player.invulnerableTimer <= 0) {
        const clawWorldX = b.x + b.claws.left.x;
        if (Math.abs(this.player.x - clawWorldX) < 55) {
          const dmg = b.isEnraged ? 22 : 16;
          this.hurtPlayer(dmg, clawWorldX);
        }
      }

      if (b.stateTimer <= 0) {
        b.state = 'idle';
        b.stateTimer = b.isEnraged ? 1.2 : 1.8;
        b.claws.left.y = 65;
        b.claws.right.y = 60;
      }
    } else if (b.state === 'attack_plasma') {
      // Mouth opens, launches plasma orbs
      if (b.plasmaTimer <= 0) {
        b.plasmaTimer = b.isEnraged ? 0.35 : 0.5;

        // In Hard / Enraged mode, fire dual spread plasma orbs!
        const angles = b.isEnraged ? [-Math.PI * 0.75, -Math.PI * 0.55] : [-Math.PI * 0.7 + Math.random() * 0.4];

        for (const angle of angles) {
          this.projectiles.push({
            x: b.x + 20,
            y: b.y - 10,
            vx: Math.cos(angle) * (b.isEnraged ? 190 : 160),
            vy: Math.sin(angle) * (b.isEnraged ? 190 : 160),
            radius: b.isEnraged ? 9 : 7,
            type: 'boss_plasma',
            timer: 3.5,
          });
        }
        sound.playHit();
      }

      if (b.stateTimer <= 0) {
        b.state = 'idle';
        b.stateTimer = b.isEnraged ? 1.4 : 2.0;
      }
    }
  }

  private updateProjectiles(dt: number) {
    for (const proj of this.projectiles) {
      proj.timer -= dt;
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      // Boss plasma has gravity
      if (proj.type === 'boss_plasma') {
        proj.vy += 120 * dt;
      }

      // Check collision with player
      if (this.player.invulnerableTimer <= 0) {
        const dx = this.player.x + this.player.width / 2 - proj.x;
        const dy = this.player.y + this.player.height / 2 - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < proj.radius + 16) {
          proj.timer = 0; // Destroy projectile
          this.hurtPlayer(proj.type === 'boss_plasma' ? (this.currentLevel === 3 ? 24 : 18) : 10, proj.x);
        }
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.timer > 0 && p.y < 580);
  }

  private hurtPlayer(damage: number, sourceX: number) {
    const p = this.player;
    p.health = Math.max(0, p.health - damage);
    p.hurtTimer = 0.35;
    p.invulnerableTimer = 1.2;
    this.addScreenShake(8);
    sound.playHit();

    // Knockback
    p.vx = p.x > sourceX ? 150 : -150;
    p.vy = -180;
    p.isGrounded = false;

    this.addFloatingText(p.x, p.y - 10, `-${damage} HP`, '#ef4444');

    if (p.health <= 0) {
      this.state = 'GAME_OVER';
      sound.stopBGM();
    }
  }

  private updateParticles(dt: number) {
    for (const part of this.particles) {
      part.x += part.vx * dt * 50;
      part.y += part.vy * dt * 50;
      part.alpha -= part.decay;
      if (part.vRot && part.rotation !== undefined) {
        part.rotation += part.vRot;
      }
    }
    this.particles = this.particles.filter((p) => p.alpha > 0);
  }

  private updateFloatingTexts(dt: number) {
    for (const t of this.floatingTexts) {
      t.y += t.vy * dt * 50;
      t.alpha -= 0.02;
    }
    this.floatingTexts = this.floatingTexts.filter((t) => t.alpha > 0);
  }

  private updateStageClear(dt: number) {
    this.victoryTimer += dt;

    // Continuously spawn confetti
    if (this.victoryConfetti.length < 90 && Math.random() < 0.6) {
      this.spawnConfettiParticle();
    }

    // Update confetti
    for (const c of this.victoryConfetti) {
      c.x += c.vx;
      c.y += c.vy;
      if (c.vRot && c.rotation !== undefined) {
        c.rotation += c.vRot;
      }
      if (c.y > this.height) {
        c.y = -10;
        c.x = this.cameraX + Math.random() * this.width;
      }
    }

    // Spawn Fireworks in the Sky (Frame 00:09)
    if (Math.random() < 0.05) {
      const colors = ['#f43f5e', '#38bdf8', '#facc15', '#4ade80', '#c084fc', '#ffffff'];
      const fwX = this.cameraX + 40 + Math.random() * (this.width - 80);
      const fwY = 70 + Math.random() * 110;
      const color = colors[Math.floor(Math.random() * colors.length)];

      sound.playKeyPickup();

      // Explode fireworks starburst
      for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * Math.PI * 2;
        const spd = 2 + Math.random() * 4;
        this.particles.push({
          x: fwX,
          y: fwY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 3 + Math.random() * 2,
          color,
          alpha: 1.0,
          decay: 0.025,
          shape: 'spark',
        });
      }
    }

    this.updateParticles(dt);
  }

  // --- RENDERING ---
  private render() {
    const ctx = this.ctx;
    ctx.save();

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Apply Screen Shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    if (this.state === 'TITLE') {
      this.renderTitleScreen();
    } else {
      this.renderGameWorld();
    }

    ctx.restore();
  }

  // Render Title Screen (Frames 00:00 - 00:01)
  private renderTitleScreen() {
    const ctx = this.ctx;
    const time = this.gameTime;

    // Teal Daytime River Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
    skyGrad.addColorStop(0, '#7dd3fc');
    skyGrad.addColorStop(0.5, '#bae6fd');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, 300);

    // Gentle fluffy clouds
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(80, 90, 45, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(260, 110, 60, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Concrete Barrage Dam in Midground
    drawBarrageDam(ctx, 0, this.width, 240, time);

    // Teal River Water
    drawRiverWater(ctx, 0, this.width, 290, this.height - 290, time);

    // Pakistani / Indus River Boat (Naav) moored on river
    drawIndusBoat(ctx, 160, 320, time);

    // Foreground riverbank foliage
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.ellipse(40, 560, 60, 24, -0.2, 0, Math.PI * 2);
    ctx.ellipse(320, 580, 50, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // STACKED "RIVER QUEST" PIXEL LOGO (Frames 00:00 - 00:01)
    drawTitleLogo(ctx, this.width / 2, 115, time);

    // BLINKING "▶ PRESS START" PROMPT
    const isBlinking = Math.floor(time * 3) % 2 === 0;
    if (isBlinking) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const promptY = 275;
      // Golden play triangle arrow
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(this.width / 2 - 95, promptY - 9);
      ctx.lineTo(this.width / 2 - 80, promptY);
      ctx.lineTo(this.width / 2 - 95, promptY + 9);
      ctx.closePath();
      ctx.fill();

      // White/yellow pixel text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Press Start 2P", monospace';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText('PRESS START', this.width / 2 + 10, promptY);
      ctx.restore();
    }

    // DIFFICULTY LEVEL SELECTOR BUTTONS (Easy to Hard)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillText('SELECT DIFFICULTY:', this.width / 2, 360);

    const levels = [
      { id: 1, label: 'LVL 1', sub: 'EASY', color: '#059669', x: 70 },
      { id: 2, label: 'LVL 2', sub: 'NORMAL', color: '#7c3aed', x: 180 },
      { id: 3, label: 'LVL 3', sub: 'HARD', color: '#dc2626', x: 290 },
    ];

    levels.forEach((lvl) => {
      const isSelected = this.selectedStartLevel === lvl.id;
      const btnW = 92;
      const btnH = 38;
      const bx = lvl.x - btnW / 2;
      const by = 380;

      // Button background
      ctx.fillStyle = isSelected ? '#ffffff' : '#0f172a';
      ctx.fillRect(bx - 2, by - 2, btnW + 4, btnH + 4);

      ctx.fillStyle = isSelected ? lvl.color : '#1e293b';
      ctx.fillRect(bx, by, btnW, btnH);

      // Level text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.fillText(lvl.label, lvl.x, by + 16);

      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = isSelected ? '#fde047' : '#94a3b8';
      ctx.fillText(lvl.sub, lvl.x, by + 29);

      if (isSelected) {
        // Selection pointer
        ctx.fillStyle = '#facc15';
        ctx.fillText('▲', lvl.x, by + 48);
      }
    });

    ctx.restore();

    // Flat control hints line
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('WASD / TOUCH MOVE • J / SPACE SLASH', this.width / 2, 595);
    ctx.fillStyle = '#67e8f9';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('TAP SCREEN OR PRESS ENTER TO START', this.width / 2, 615);
    ctx.restore();
  }

  // Render Active Gameplay World (Frames 00:02 - 00:09)
  private renderGameWorld() {
    const ctx = this.ctx;
    const time = this.gameTime;

    // --- SKY GRADIENTS PER DIFFICULTY LEVEL ---
    const duskSky = ctx.createLinearGradient(0, 0, 0, 310);
    if (this.currentLevel === 1) {
      // Level 1: Gentle amber twilight
      duskSky.addColorStop(0, '#1e1b4b');
      duskSky.addColorStop(0.5, '#4338ca');
      duskSky.addColorStop(1, '#06b6d4');
    } else if (this.currentLevel === 2) {
      // Level 2: Classic purple dusk
      duskSky.addColorStop(0, '#2e1065');
      duskSky.addColorStop(0.4, '#581c87');
      duskSky.addColorStop(0.75, '#7e22ce');
      duskSky.addColorStop(1, '#a855f7');
    } else {
      // Level 3: Fiery crimson/violet twilight
      duskSky.addColorStop(0, '#4a044e');
      duskSky.addColorStop(0.4, '#701a75');
      duskSky.addColorStop(0.75, '#9d174d');
      duskSky.addColorStop(1, '#f43f5e');
    }
    ctx.fillStyle = duskSky;
    ctx.fillRect(0, 0, this.width, 310);

    // Drifting layered clouds
    ctx.fillStyle = this.currentLevel === 3 ? '#fda4af' : '#c084fc';
    ctx.globalAlpha = 0.4;
    const cloud1X = ((time * 8) % (this.width + 120)) - 60;
    const cloud2X = ((time * 5 + 160) % (this.width + 160)) - 80;
    ctx.beginPath();
    ctx.ellipse(cloud1X, 90, 65, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud2X, 150, 85, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // --- MIDGROUND: CONCRETE BARRAGE DAM & RIVER BOAT ---
    drawBarrageDam(ctx, this.cameraX, this.width, 240, time);

    // Teal River Water below dam
    drawRiverWater(ctx, this.cameraX, this.width, 285, this.height - 285, time);

    // Wooden boat moored in distance
    const boatScreenX = 420 - this.cameraX * 0.5;
    if (boatScreenX > -120 && boatScreenX < this.width + 60) {
      drawIndusBoat(ctx, boatScreenX, 310, time);
    }

    // --- CAMERA TRANSLATION FOR FOREGROUND ENTITIES ---
    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Hanging Jungle Vines Canopy from Top-Right (Frame 00:05)
    drawHangingVines(ctx, this.cameraX, this.worldWidth, time);

    // Platforms: Starting Dock, Step Plank, and Grassy Island
    drawWoodenDock(ctx, 0, 460, 110);
    drawWoodenDock(ctx, 125, 470, 40); // Stepping pier plank
    drawIslandTerrain(ctx, 180, 450, 720, 190);

    // In Level 1: Draw the Rescue Boat waiting at the eastern dock!
    if (this.currentLevel === 1) {
      drawIndusBoat(ctx, 740, 405, time);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RESCUE BOAT', 790, 360 + Math.sin(time * 3) * 2);
      ctx.fillText('▼', 790, 372 + Math.sin(time * 3) * 2);
    }

    // Giant Mechanical Boss (Levels 2 & 3 only)
    if (this.boss) {
      drawGiantBoss(ctx, this.boss, time);
    }

    // Key Items dropped on island
    for (const key of this.keyItems) {
      drawKeyItem(ctx, key, time);
    }

    // Minions (Green Sea-Serpents & Robot Drones)
    for (const m of this.minions) {
      if (m.isDead) continue;
      if (m.type === 'serpent') {
        drawSeaSerpent(ctx, m, time);
      } else {
        drawRobotDrone(ctx, m, time);
      }
    }

    // Projectiles
    for (const proj of this.projectiles) {
      if (proj.type === 'enemy_laser') {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Boss plasma orb
        ctx.save();
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // South Asian Hero in Shalwar Kameez
    drawHero(ctx, this.player, time);

    // Floating Combat Texts (HIT!, -15 HP, SHATTER!)
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // Particles (Sparks, debris, smoke)
    for (const part of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, part.alpha);
      ctx.fillStyle = part.color;

      if (part.shape === 'debris' && part.rotation !== undefined) {
        ctx.translate(part.x, part.y);
        ctx.rotate(part.rotation);
        ctx.fillRect(-part.size / 2, -part.size / 2, part.size, part.size);
      } else if (part.shape === 'smoke') {
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(part.x, part.y, part.size, part.size);
      }

      ctx.restore();
    }

    // Victory Confetti
    if (this.state === 'STAGE_CLEAR') {
      for (const c of this.victoryConfetti) {
        ctx.save();
        ctx.fillStyle = c.color;
        ctx.translate(c.x, c.y);
        if (c.rotation !== undefined) ctx.rotate(c.rotation);
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.7);
        ctx.restore();
      }
    }

    ctx.restore(); // Restore camera translation

    // --- TOP HUD WITH DIFFICULTY LEVEL BADGE ---
    const levelLabels = ['LVL 1 [EASY]', 'LVL 2 [NORMAL]', 'LVL 3 [HARD]'];
    drawHUD(
      ctx,
      this.player,
      this.soundMuted,
      this.state === 'PAUSED',
      this.width,
      this.currentLevel,
      levelLabels[this.currentLevel - 1]
    );

    // Bottom Boss HUD when Boss is Active (Levels 2 & 3 only)
    if (this.boss && (this.boss.state !== 'rising' || this.boss.health < this.boss.maxHealth)) {
      drawBossHUD(ctx, this.boss, this.width, this.height);
    }

    // Level 1 objective banner hint
    if (this.currentLevel === 1 && this.state === 'PLAYING') {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(this.width / 2 - 100, 68, 200, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText(
        this.player.keys >= 10 ? '★ RESCUE BOAT UNLOCKED! ★' : `COLLECT KEYS: ${this.player.keys}/10`,
        this.width / 2,
        79
      );
      ctx.restore();
    }

    // STAGE CLEAR BANNER
    if (this.state === 'STAGE_CLEAR') {
      this.renderStageClearScreen();
    }

    // GAME OVER OVERLAY
    if (this.state === 'GAME_OVER') {
      this.renderGameOverScreen();
    }

    // PAUSE OVERLAY
    if (this.state === 'PAUSED') {
      this.renderPauseOverlay();
    }
  }

  // Render "STAGE CLEAR!" Victory Screen
  private renderStageClearScreen() {
    const ctx = this.ctx;
    const time = this.gameTime;

    ctx.save();
    ctx.textAlign = 'center';

    const bannerY = 135 + Math.sin(time * 3) * 3;

    // 3D Drop Shadow
    for (let o = 5; o > 0; o--) {
      ctx.fillStyle = '#4c0519';
      ctx.font = 'bold 22px "Press Start 2P", monospace';
      ctx.fillText(
        this.currentLevel === 3 ? 'ALL CLEARED!' : 'STAGE CLEAR!',
        this.width / 2,
        bannerY + o
      );
    }

    // Border bevel
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px "Press Start 2P", monospace';
    ctx.fillText(
      this.currentLevel === 3 ? 'ALL CLEARED!' : 'STAGE CLEAR!',
      this.width / 2,
      bannerY + 2
    );

    // Glowing face
    const clearGrad = ctx.createLinearGradient(0, bannerY - 14, 0, bannerY + 14);
    clearGrad.addColorStop(0, '#fef08a');
    clearGrad.addColorStop(0.5, '#facc15');
    clearGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = clearGrad;
    ctx.fillText(
      this.currentLevel === 3 ? 'ALL CLEARED!' : 'STAGE CLEAR!',
      this.width / 2,
      bannerY
    );

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#020617';
    ctx.strokeText(
      this.currentLevel === 3 ? 'ALL CLEARED!' : 'STAGE CLEAR!',
      this.width / 2,
      bannerY
    );

    // Subtitle & Score Card per Level
    const subtitles = [
      'RIVER BARRAGE CROSSED (EASY)',
      'LEVIATHAN VANQUISHED (NORMAL)',
      'ULTIMATE RIVER MASTER (HARD)!',
    ];
    ctx.fillStyle = '#a5f3fc';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(subtitles[this.currentLevel - 1], this.width / 2, bannerY + 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('KEYS COLLECTED: 10/10', this.width / 2, bannerY + 56);

    // Next Level or Replay Buttons
    const pulse = Math.floor(time * 3) % 2 === 0;
    const btnText =
      this.currentLevel === 1
        ? '▶ NEXT: LVL 2 (NORMAL)'
        : this.currentLevel === 2
        ? '▶ NEXT: LVL 3 (HARD)'
        : '▶ REPLAY CAMPAIGN';

    // Button frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(this.width / 2 - 120, 545, 240, 36);
    ctx.fillStyle = pulse ? '#0284c7' : '#0369a1';
    ctx.fillRect(this.width / 2 - 118, 547, 236, 32);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillText(btnText, this.width / 2, 567);

    ctx.restore();
  }

  private renderGameOverScreen() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 24px "Press Start 2P", monospace';
    ctx.fillText('GAME OVER', this.width / 2, 280);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('THE RIVER CLAIMED YOU', this.width / 2, 320);

    ctx.fillStyle = '#facc15';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('▶ RETRY STAGE', this.width / 2, 400);

    ctx.restore();
  }

  private renderPauseOverlay() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "Press Start 2P", monospace';
    ctx.fillText('PAUSED', this.width / 2, 290);

    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText('PRESS P / TAP TO RESUME', this.width / 2, 335);

    ctx.restore();
  }
}

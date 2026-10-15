export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'BOSS_INTRO' | 'STAGE_CLEAR' | 'GAME_OVER';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  keys: number;
  targetKeys: number;
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  slashHitbox: { x: number; y: number; width: number; height: number; active: boolean };
  hurtTimer: number;
  invulnerableTimer: number;
  animationFrame: number;
  animationTimer: number;
  state: 'idle' | 'run' | 'jump' | 'attack' | 'hurt' | 'victory';
}

export interface Minion {
  id: number;
  type: 'serpent' | 'drone';
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseY: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  hurtTimer: number;
  facing: 'left' | 'right';
  timer: number;
  shootCooldown: number;
  isDead: boolean;
}

export interface Boss {
  x: number;
  y: number;
  targetY: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  hurtTimer: number;
  state: 'rising' | 'idle' | 'attack_claw' | 'attack_plasma' | 'attack_surge' | 'recovering' | 'defeated';
  stateTimer: number;
  clawPhase: number;
  facing: 'left' | 'right';
  jawHitbox: { x: number; y: number; width: number; height: number };
  claws: {
    left: { x: number; y: number; targetX: number; targetY: number; attacking: boolean };
    right: { x: number; y: number; targetX: number; targetY: number; attacking: boolean };
  };
  plasmaTimer: number;
  defeatedTimer: number;
  isEnraged?: boolean;
  speedMultiplier?: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'enemy_laser' | 'boss_plasma';
  timer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'square' | 'spark' | 'smoke' | 'debris' | 'confetti';
  rotation?: number;
  vRot?: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface KeyItem {
  x: number;
  y: number;
  vy: number;
  baseY: number;
  collected: boolean;
  timer: number;
}

export interface ControlsState {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  justJumped: boolean;
  justAttacked: boolean;
}

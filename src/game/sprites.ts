/**
 * High-fidelity 16-bit pixel art sprite rendering for River Quest
 */
import { Player, Minion, Boss, KeyItem } from './types';

// Helper to draw crisp pixel rectangles
export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Draw Stacked 3D Pixel Logo: "RIVER QUEST"
export function drawTitleLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const bob = Math.sin(time * 2.5) * 2;

  // "RIVER" - Bold extruded gold/orange pixel typography
  const riverY = cy - 26 + bob;
  const questY = cy + 22 + bob;

  // Draw 3D extrusion shadow for RIVER
  for (let offset = 6; offset > 0; offset--) {
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px "Press Start 2P", monospace';
    ctx.fillText('RIVER', cx, riverY + offset);
  }
  // Bevel bottom
  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 36px "Press Start 2P", monospace';
  ctx.fillText('RIVER', cx, riverY + 3);
  // Main face gradient
  const riverGrad = ctx.createLinearGradient(cx, riverY - 18, cx, riverY + 18);
  riverGrad.addColorStop(0, '#fef08a');
  riverGrad.addColorStop(0.5, '#facc15');
  riverGrad.addColorStop(1, '#f97316');
  ctx.fillStyle = riverGrad;
  ctx.fillText('RIVER', cx, riverY);

  // Outline highlights
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#020617';
  ctx.strokeText('RIVER', cx, riverY);

  // "QUEST" - Bold extruded cyan/teal pixel typography
  for (let offset = 6; offset > 0; offset--) {
    ctx.fillStyle = '#082f49';
    ctx.font = 'bold 34px "Press Start 2P", monospace';
    ctx.fillText('QUEST', cx, questY + offset);
  }
  ctx.fillStyle = '#0e7490';
  ctx.font = 'bold 34px "Press Start 2P", monospace';
  ctx.fillText('QUEST', cx, questY + 3);

  const questGrad = ctx.createLinearGradient(cx, questY - 16, cx, questY + 16);
  questGrad.addColorStop(0, '#a5f3fc');
  questGrad.addColorStop(0.5, '#22d3ee');
  questGrad.addColorStop(1, '#0891b2');
  ctx.fillStyle = questGrad;
  ctx.fillText('QUEST', cx, questY);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#020617';
  ctx.strokeText('QUEST', cx, questY);

  ctx.restore();
}

// Draw the South Asian Indus River Boat (Naav)
export function drawIndusBoat(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  const bobY = Math.sin(time * 2 + x) * 2;
  const py = y + bobY;

  // Reflection in water
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#0f3b4c';
  ctx.beginPath();
  ctx.ellipse(x + 50, py + 26, 60, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Boat Wooden Hull
  // Dark bottom outline
  ctx.fillStyle = '#3f1c07';
  ctx.beginPath();
  ctx.moveTo(x - 10, py + 12);
  ctx.quadraticCurveTo(x + 50, py + 30, x + 115, py + 10);
  ctx.lineTo(x + 105, py + 2);
  ctx.quadraticCurveTo(x + 50, py + 20, x, py + 4);
  ctx.closePath();
  ctx.fill();

  // Main wooden planks (warm teak/sheesham wood)
  ctx.fillStyle = '#9a3412';
  ctx.beginPath();
  ctx.moveTo(x - 5, py + 8);
  ctx.quadraticCurveTo(x + 50, py + 24, x + 108, py + 6);
  ctx.lineTo(x + 102, py + 2);
  ctx.quadraticCurveTo(x + 50, py + 16, x + 2, py + 3);
  ctx.closePath();
  ctx.fill();

  // Highlight plank
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(x + 8, py + 6, 90, 4);

  // Red & Golden carved traditional rim (Truck art / Indus motif)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x + 5, py + 2, 96, 3);
  ctx.fillStyle = '#fbbf24';
  for (let i = 0; i < 90; i += 8) {
    ctx.fillRect(x + 10 + i, py + 2, 4, 3);
  }

  // Wooden Cabin / Shelter Awning
  // Posts
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 24, py - 14, 3, 16);
  ctx.fillRect(x + 46, py - 14, 3, 16);
  ctx.fillRect(x + 68, py - 14, 3, 16);

  // Curved wooden roof awning
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.roundRect(x + 20, py - 18, 54, 6, 2);
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x + 22, py - 17, 50, 4);

  // Mooring mast & red pennant flag
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 80, py - 26, 3, 28);
  // Red flag fluttering
  const flagWave = Math.sin(time * 6) * 2;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(x + 83, py - 26);
  ctx.lineTo(x + 95 + flagWave, py - 22);
  ctx.lineTo(x + 83, py - 18);
  ctx.closePath();
  ctx.fill();

  // Rudder / Oar in water
  ctx.fillStyle = '#572206';
  ctx.beginPath();
  ctx.moveTo(x - 2, py + 6);
  ctx.lineTo(x - 18, py + 24);
  ctx.lineTo(x - 14, py + 26);
  ctx.lineTo(x, py + 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Draw Concrete Barrage Dam with Sluice Gates and Foaming Water
export function drawBarrageDam(
  ctx: CanvasRenderingContext2D,
  viewX: number,
  canvasW: number,
  y: number,
  time: number
) {
  ctx.save();
  const damHeight = 44;

  // Distant mountain silhouette behind dam
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(50, y - 22);
  ctx.lineTo(120, y - 10);
  ctx.lineTo(190, y - 28);
  ctx.lineTo(270, y - 14);
  ctx.lineTo(360, y - 26);
  ctx.lineTo(360, y);
  ctx.closePath();
  ctx.fill();

  // Dam base & superstructure
  ctx.fillStyle = '#64748b'; // Concrete gray
  ctx.fillRect(0, y, canvasW, damHeight);

  // Dam top roadway & railings
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, y, canvasW, 6);
  ctx.fillStyle = '#475569';
  for (let x = 0; x < canvasW; x += 10) {
    ctx.fillRect(x, y - 5, 2, 6); // Railing posts
  }
  ctx.fillRect(0, y - 5, canvasW, 2); // Railing bar

  // Repeating Barrage Sluice Gates & Piers
  const gateWidth = 32;
  const startX = -((viewX * 0.4) % gateWidth);

  for (let x = startX - gateWidth; x < canvasW + gateWidth; x += gateWidth) {
    // Sluice gate arch
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 4, y + 10, gateWidth - 8, damHeight - 10);

    // Gate metal door
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 6, y + 12, gateWidth - 12, 10);

    // Water cascading/churning out of sluice gate!
    const sprayPulse = Math.sin(time * 12 + x) * 2;
    const waterGrad = ctx.createLinearGradient(x + 6, y + 22, x + 6, y + damHeight + 10);
    waterGrad.addColorStop(0, '#bae6fd');
    waterGrad.addColorStop(0.4, '#38bdf8');
    waterGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(x + 6, y + 22, gateWidth - 12, damHeight - 20 + sprayPulse);

    // Frothing white water spray at bottom of spillway
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + gateWidth / 2, y + damHeight + 2, gateWidth / 2 - 2, 4 + sprayPulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pier columns
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x, y + 6, 4, damHeight - 6);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 3, y + 6, 1, damHeight - 6); // shadow line
  }

  ctx.restore();
}

// Draw River Water with Shimmering Pixel Waves
export function drawRiverWater(
  ctx: CanvasRenderingContext2D,
  viewX: number,
  canvasW: number,
  y: number,
  height: number,
  time: number
) {
  ctx.save();
  // Deep teal river water gradient
  const riverGrad = ctx.createLinearGradient(0, y, 0, y + height);
  riverGrad.addColorStop(0, '#0d9488'); // Emerald teal
  riverGrad.addColorStop(0.35, '#0f766e');
  riverGrad.addColorStop(0.7, '#115e59');
  riverGrad.addColorStop(1, '#042f2e'); // Deep river abyss
  ctx.fillStyle = riverGrad;
  ctx.fillRect(0, y, canvasW, height);

  // Animated pixel wave highlights
  for (let row = 0; row < 6; row++) {
    const waveY = y + 12 + row * 24;
    const speed = (row + 1) * 1.5;
    const waveOffset = (time * speed * 25 + viewX * 0.2) % 40;
    ctx.fillStyle = row % 2 === 0 ? '#5eead4' : '#2dd4bf';
    ctx.globalAlpha = 0.45 - row * 0.05;

    for (let x = -40; x < canvasW + 40; x += 36) {
      const wx = x - waveOffset;
      const wSize = 14 + (row % 3) * 6;
      ctx.fillRect(wx, waveY + Math.sin(time * 3 + wx * 0.05) * 2, wSize, 2);
    }
  }

  ctx.restore();
}

// Draw the Wooden Pier / Dock on the left
export function drawWoodenDock(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  ctx.save();
  // Vertical support timber pilings going into water
  for (let px = x + 12; px < x + width; px += 36) {
    // Piling pole
    ctx.fillStyle = '#451a03';
    ctx.fillRect(px, y + 10, 10, 90);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 2, y + 10, 6, 90);
    // Green moss / algae at water line
    ctx.fillStyle = '#14532d';
    ctx.fillRect(px, y + 45, 10, 14);

    // Rope coils on mooring post
    ctx.fillStyle = '#d97706';
    ctx.fillRect(px - 1, y + 12, 12, 3);
    ctx.fillRect(px - 1, y + 17, 12, 3);
  }

  // Cross timber beams
  ctx.fillStyle = '#3f1a04';
  ctx.fillRect(x, y + 8, width, 6);

  // Top wooden deck planks with rich timber texture
  for (let px = x; px < x + width; px += 14) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px, y, 12, 10);
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(px + 1, y, 10, 3); // Plank highlight
    ctx.fillStyle = '#291102';
    ctx.fillRect(px + 12, y, 2, 10); // Plank groove gap
  }

  // Mooring bollard with rope on the edge
  ctx.fillStyle = '#572206';
  ctx.fillRect(x + width - 14, y - 8, 8, 9);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x + width - 15, y - 9, 10, 3);

  ctx.restore();
}

// Draw Grassy Island Riverbank Terrain
export function drawIslandTerrain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.save();
  // Earthy cliff/rock bank
  ctx.fillStyle = '#3f2112'; // Deep loam/rock
  ctx.fillRect(x, y + 12, width, height - 12);

  // Rock layers & sediment lines
  ctx.fillStyle = '#5c3317';
  for (let rx = x + 10; rx < x + width; rx += 28) {
    ctx.fillRect(rx, y + 18, 18, 8);
    ctx.fillRect(rx + 8, y + 32, 22, 10);
  }

  // Wet water-line moss
  ctx.fillStyle = '#14532d';
  ctx.fillRect(x, y + height - 14, width, 14);

  // Lush Grass Top Layer
  ctx.fillStyle = '#15803d'; // Rich green
  ctx.fillRect(x, y, width, 12);
  ctx.fillStyle = '#4ade80'; // Bright grass highlight
  ctx.fillRect(x, y, width, 3);

  // Grass blades hanging over edge
  ctx.fillStyle = '#16a34a';
  for (let gx = x; gx < x + width; gx += 6) {
    const bladeH = 4 + (gx % 5);
    ctx.fillRect(gx, y + 12, 3, bladeH);
  }

  // Small riverbank pebbles / wildflowers
  for (let px = x + 16; px < x + width - 20; px += 45) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(px, y - 2, 4, 3); // Pebble
    // Tiny blue/pink wildflower
    ctx.fillStyle = px % 2 === 0 ? '#38bdf8' : '#f472b6';
    ctx.fillRect(px + 12, y - 4, 3, 3);
  }

  ctx.restore();
}

// Draw Hanging Jungle Canopy Vines from Top-Right (matching Frame 00:05)
export function drawHangingVines(
  ctx: CanvasRenderingContext2D,
  viewX: number,
  canvasW: number,
  time: number
) {
  ctx.save();
  // Lush canopy block in top-right
  const canopyX = canvasW - 130 - (viewX * 0.1);
  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.ellipse(canopyX + 65, 0, 90, 45, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(canopyX + 70, 0, 75, 35, 0, 0, Math.PI);
  ctx.fill();

  // Hanging vines
  for (let i = 0; i < 4; i++) {
    const vx = canopyX + 30 + i * 24;
    const sway = Math.sin(time * 2 + i) * 3;
    const vLen = 65 + (i % 3) * 25;

    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(vx, 25);
    ctx.quadraticCurveTo(vx + sway, 25 + vLen / 2, vx + sway * 1.5, 25 + vLen);
    ctx.stroke();

    // Vine leaves
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(vx + sway - 3, 45, 4, 4);
    ctx.fillRect(vx + sway + 2, 70, 4, 4);
  }

  ctx.restore();
}

// Draw the Bearded South Asian Hero in Shalwar Kameez
export function drawHero(ctx: CanvasRenderingContext2D, player: Player, time: number) {
  ctx.save();
  ctx.translate(Math.floor(player.x), Math.floor(player.y));

  // Flip horizontally if facing left
  if (player.facing === 'left') {
    ctx.scale(-1, 1);
    ctx.translate(-player.width, 0);
  }

  // Hurt flash effect (blink red/white)
  if (player.hurtTimer > 0 && Math.floor(time * 30) % 2 === 0) {
    ctx.filter = 'brightness(2.2) sepia(1) hue-rotate(-50deg) saturate(5)';
  }

  const anim = player.state;
  const isRunning = anim === 'run';
  const isJumping = anim === 'jump';
  const isAttacking = anim === 'attack';
  const isVictory = anim === 'victory';

  // Animation cycle values
  const runCycle = Math.sin(player.animationFrame * 0.8);
  const breathBob = anim === 'idle' ? Math.sin(time * 4) * 1.5 : 0;

  const px = 0;
  const py = breathBob;

  // --- 1. LEGS & SHALWAR PANTS ---
  // Traditional pleated loose trousers (light blue / periwinkle)
  const shalwarBase = '#93c5fd';
  const shalwarDark = '#3b82f6';
  const shalwarLight = '#dbeafe';

  if (isVictory) {
    // Standing proud with feet planted
    drawPixelRect(ctx, px + 8, py + 34, 9, 14, shalwarBase);
    drawPixelRect(ctx, px + 19, py + 34, 9, 14, shalwarBase);
    // Pleat shadow
    drawPixelRect(ctx, px + 15, py + 34, 2, 14, shalwarDark);
  } else if (isRunning) {
    // Dynamic running legs
    const leg1Y = py + 34 + runCycle * 4;
    const leg2Y = py + 34 - runCycle * 4;
    const leg1X = px + 6 - runCycle * 4;
    const leg2X = px + 20 + runCycle * 4;

    drawPixelRect(ctx, leg1X, leg1Y, 10, 13, shalwarBase);
    drawPixelRect(ctx, leg2X, leg2Y, 10, 13, shalwarBase);
    // Folds
    drawPixelRect(ctx, leg1X + 2, leg1Y + 3, 3, 8, shalwarLight);
    drawPixelRect(ctx, leg2X + 2, leg2Y + 3, 3, 8, shalwarLight);
  } else if (isJumping) {
    // Legs bent in mid-air leap
    drawPixelRect(ctx, px + 7, py + 32, 10, 12, shalwarBase);
    drawPixelRect(ctx, px + 18, py + 34, 9, 10, shalwarBase);
  } else {
    // Fighting stance - wide stable stance
    drawPixelRect(ctx, px + 6, py + 34, 10, 14, shalwarBase);
    drawPixelRect(ctx, px + 20, py + 34, 10, 14, shalwarBase);
    // Pleats & cloth folds
    drawPixelRect(ctx, px + 8, py + 36, 2, 10, shalwarDark);
    drawPixelRect(ctx, px + 22, py + 36, 2, 10, shalwarDark);
  }

  // --- 2. BROWN SANDALS (Peshawari Chappal) ---
  const sandalLeather = '#78350f';
  const sandalSole = '#451a03';
  const footSkin = '#d97706';

  if (isVictory) {
    drawPixelRect(ctx, px + 7, py + 46, 11, 4, sandalLeather);
    drawPixelRect(ctx, px + 6, py + 49, 12, 2, sandalSole);
    drawPixelRect(ctx, px + 19, py + 46, 11, 4, sandalLeather);
    drawPixelRect(ctx, px + 18, py + 49, 12, 2, sandalSole);
  } else if (isRunning) {
    const f1X = px + 5 - runCycle * 4;
    const f1Y = py + 45 + runCycle * 4;
    const f2X = px + 19 + runCycle * 4;
    const f2Y = py + 45 - runCycle * 4;

    drawPixelRect(ctx, f1X, f1Y, 11, 3, sandalLeather);
    drawPixelRect(ctx, f1X, f1Y + 3, 11, 2, sandalSole);
    drawPixelRect(ctx, f2X, f2Y, 11, 3, sandalLeather);
    drawPixelRect(ctx, f2X, f2Y + 3, 11, 2, sandalSole);
  } else {
    drawPixelRect(ctx, px + 5, py + 46, 11, 3, sandalLeather);
    drawPixelRect(ctx, px + 4, py + 48, 12, 2, sandalSole);
    drawPixelRect(ctx, px + 20, py + 46, 11, 3, sandalLeather);
    drawPixelRect(ctx, px + 19, py + 48, 12, 2, sandalSole);
  }

  // --- 3. SHALWAR KAMEEZ TUNIC (Light-Blue / Sky-Blue Kurta) ---
  const kameezSky = '#bae6fd';
  const kameezMid = '#38bdf8';
  const kameezShade = '#0284c7';
  const kameezLight = '#e0f2fe';

  // Lower hem of kurta tunic (knee length with side slits)
  let tailFlutter = 0;
  if (isRunning) tailFlutter = Math.sin(time * 14) * 3;
  if (isJumping) tailFlutter = -2;

  // Kurta bottom skirt
  drawPixelRect(ctx, px + 5 - tailFlutter, py + 24, 25 + tailFlutter, 12, kameezSky);
  // Center placket line and side slit shadows
  drawPixelRect(ctx, px + 16, py + 24, 2, 12, kameezMid);
  drawPixelRect(ctx, px + 7, py + 30, 2, 6, kameezShade);
  drawPixelRect(ctx, px + 27, py + 30, 2, 6, kameezShade);

  // Upper Kurta Torso
  drawPixelRect(ctx, px + 6, py + 14, 23, 12, kameezSky);
  drawPixelRect(ctx, px + 8, py + 15, 6, 9, kameezLight); // Highlight
  drawPixelRect(ctx, px + 16, py + 14, 2, 10, kameezShade); // Button placket
  // Tiny gold buttons on kameez placket
  drawPixelRect(ctx, px + 16, py + 16, 2, 2, '#facc15');
  drawPixelRect(ctx, px + 16, py + 20, 2, 2, '#facc15');
  // Nehru / Mandarin collar
  drawPixelRect(ctx, px + 12, py + 12, 10, 3, kameezMid);

  // --- 4. HEAD, BEARD, FACE, HAIR ---
  const skinTone = '#f59e0b'; // Warm South Asian golden complexion
  const skinShadow = '#d97706';
  const darkHair = '#1e1b18';
  const beardColor = '#0f0e0c';

  // Neck
  drawPixelRect(ctx, px + 14, py + 11, 6, 3, skinShadow);

  // Face base
  drawPixelRect(ctx, px + 11, py + 2, 13, 10, skinTone);

  // Stylish modern dark hair with undercut / quiff
  drawPixelRect(ctx, px + 9, py - 3, 16, 6, darkHair);
  drawPixelRect(ctx, px + 10, py - 5, 12, 3, darkHair);
  drawPixelRect(ctx, px + 8, py + 1, 4, 4, darkHair); // Side hair/burns

  // Neatly sculpted full beard & mustache
  drawPixelRect(ctx, px + 10, py + 6, 3, 6, beardColor); // Cheek beard
  drawPixelRect(ctx, px + 11, py + 8, 13, 5, beardColor); // Jaw & chin beard
  drawPixelRect(ctx, px + 14, py + 6, 7, 2, beardColor); // Mustache

  if (isVictory) {
    // Cheering happy smiling face with closed happy eyes
    drawPixelRect(ctx, px + 13, py + 4, 3, 2, '#0f172a');
    drawPixelRect(ctx, px + 19, py + 4, 3, 2, '#0f172a');
    // Big cheerful white smile!
    drawPixelRect(ctx, px + 15, py + 7, 5, 3, '#ffffff');
  } else {
    // Determined martial hero eyes
    drawPixelRect(ctx, px + 14, py + 4, 3, 2, '#0f172a');
    drawPixelRect(ctx, px + 19, py + 4, 3, 2, '#0f172a');
    // White eye reflections
    drawPixelRect(ctx, px + 14, py + 4, 1, 1, '#ffffff');
    drawPixelRect(ctx, px + 19, py + 4, 1, 1, '#ffffff');
    // Fierce dark eyebrows
    drawPixelRect(ctx, px + 13, py + 3, 4, 1, darkHair);
    drawPixelRect(ctx, px + 18, py + 3, 4, 1, darkHair);
  }

  // --- 5. ARMS & SLEEVES ---
  if (isVictory) {
    // Triumphant Victory Pose: Right arm thrust straight up into the air with clenched fist!
    // Left hand on hip
    drawPixelRect(ctx, px + 4, py + 16, 4, 10, kameezSky);
    drawPixelRect(ctx, px + 3, py + 24, 4, 4, skinTone);

    // Right arm raised high
    drawPixelRect(ctx, px + 22, py + 2, 5, 12, kameezSky);
    drawPixelRect(ctx, px + 22, py - 8, 5, 10, skinTone);
    // Raised clenched fist!
    drawPixelRect(ctx, px + 21, py - 13, 7, 6, skinTone);
    drawPixelRect(ctx, px + 22, py - 11, 4, 2, skinShadow); // Knuckles
  } else if (isAttacking) {
    // Martial Crescent Slash Pose!
    // Back arm counterbalancing
    drawPixelRect(ctx, px + 1, py + 16, 5, 7, kameezSky);
    drawPixelRect(ctx, px - 2, py + 21, 5, 4, skinTone);

    // Striking front arm slashing forward with blade/martial energy!
    drawPixelRect(ctx, px + 20, py + 12, 14, 5, kameezSky);
    drawPixelRect(ctx, px + 32, py + 11, 6, 5, skinTone);
    drawPixelRect(ctx, px + 35, py + 10, 4, 6, skinShadow); // Fist
  } else if (isRunning) {
    // Arms pumping dynamically in sprint
    const arm1Y = py + 16 - runCycle * 4;
    const arm2Y = py + 16 + runCycle * 4;
    drawPixelRect(ctx, px + 3, arm1Y, 5, 8, kameezSky);
    drawPixelRect(ctx, px + 2, arm1Y + 7, 5, 5, skinTone);

    drawPixelRect(ctx, px + 24, arm2Y, 5, 8, kameezSky);
    drawPixelRect(ctx, px + 25, arm2Y + 7, 5, 5, skinTone);
  } else {
    // Martial fighting stance (clenched fists raised ready at chest height)
    drawPixelRect(ctx, px + 5, py + 16, 5, 7, kameezSky);
    drawPixelRect(ctx, px + 2, py + 18, 5, 5, skinTone); // Left fist

    drawPixelRect(ctx, px + 22, py + 15, 6, 6, kameezSky);
    drawPixelRect(ctx, px + 27, py + 14, 6, 6, skinTone); // Right guard fist
    drawPixelRect(ctx, px + 28, py + 16, 4, 2, skinShadow); // Knuckles
  }

  ctx.restore();

  // --- 6. GLOWING CYAN CRESCENT SLASH ATTACK EFFECT ---
  if (player.isAttacking) {
    drawCrescentSlashEffect(ctx, player, time);
  }
}

// Draw the Glowing Cyan Crescent Slash Arc
export function drawCrescentSlashEffect(ctx: CanvasRenderingContext2D, player: Player, time: number) {
  ctx.save();
  const dir = player.facing === 'right' ? 1 : -1;
  const cx = player.x + (dir === 1 ? player.width + 10 : -10);
  const cy = player.y + 20;

  const progress = 1 - (player.attackTimer / 0.22); // 0 to 1
  const radius = 38;

  ctx.translate(cx, cy);
  if (dir === -1) ctx.scale(-1, 1);

  // Outer glowing aura
  ctx.save();
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(0, 0, radius, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  ctx.restore();

  // Brilliant cyan core arc
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ecfeff';
  ctx.beginPath();
  ctx.arc(0, 0, radius, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();

  // Inner energy blade crescent body
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(0, 0, radius + 4, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.quadraticCurveTo(8, 0, radius - 8, -Math.PI * 0.35);
  ctx.closePath();
  ctx.fill();

  // Sparkles & slash motes
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI * 0.4 + (i / 4) * Math.PI * 0.8;
    const sx = Math.cos(angle) * (radius + 6);
    const sy = Math.sin(angle) * (radius + 6);
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#67e8f9';
    ctx.fillRect(sx, sy, 3, 3);
  }

  ctx.restore();
}

// Draw Green Sea-Serpent Minion
export function drawSeaSerpent(ctx: CanvasRenderingContext2D, minion: Minion, time: number) {
  ctx.save();
  ctx.translate(Math.floor(minion.x), Math.floor(minion.y));

  if (minion.facing === 'left') {
    ctx.scale(-1, 1);
    ctx.translate(-minion.width, 0);
  }

  if (minion.hurtTimer > 0 && Math.floor(time * 30) % 2 === 0) {
    ctx.filter = 'brightness(2.5) saturate(0)';
  }

  const slither = Math.sin(time * 8 + minion.id) * 3;

  // Emerald green body segments
  const greenDark = '#14532d';
  const greenMid = '#16a34a';
  const greenBright = '#4ade80';
  const goldFin = '#eab308';

  // Serpentine tail
  drawPixelRect(ctx, 0, 16 + slither, 8, 8, greenDark);
  drawPixelRect(ctx, 6, 12 - slither, 9, 12, greenMid);
  drawPixelRect(ctx, 13, 8 + slither, 10, 15, greenMid);

  // Dorsal gold spine/horn
  drawPixelRect(ctx, 16, 2 + slither, 4, 7, goldFin);
  drawPixelRect(ctx, 9, 6 - slither, 3, 6, goldFin);

  // Serpent Head
  drawPixelRect(ctx, 21, 6, 13, 14, greenMid);
  drawPixelRect(ctx, 23, 4, 7, 3, goldFin); // Head crest

  // Snapping Jaws & Fangs
  drawPixelRect(ctx, 28, 14, 7, 5, greenDark);
  drawPixelRect(ctx, 29, 13, 2, 2, '#ffffff'); // Upper fang
  drawPixelRect(ctx, 32, 17, 2, 2, '#ffffff'); // Lower fang

  // Forked red tongue flicking out
  if (Math.sin(time * 10) > 0) {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(35, 14, 5, 2);
    ctx.fillRect(39, 13, 2, 1);
    ctx.fillRect(39, 16, 2, 1);
  }

  // Glowing red reptilian eye
  drawPixelRect(ctx, 26, 8, 3, 3, '#ef4444');
  drawPixelRect(ctx, 27, 8, 1, 2, '#000000'); // Slit pupil

  // Scales highlight
  drawPixelRect(ctx, 14, 10 + slither, 3, 2, greenBright);
  drawPixelRect(ctx, 22, 8, 2, 2, greenBright);

  ctx.restore();
}

// Draw Hovering Robot Drone
export function drawRobotDrone(ctx: CanvasRenderingContext2D, drone: Minion, time: number) {
  ctx.save();
  ctx.translate(Math.floor(drone.x), Math.floor(drone.y));

  if (drone.hurtTimer > 0 && Math.floor(time * 30) % 2 === 0) {
    ctx.filter = 'brightness(3) sepia(1) hue-rotate(180deg)';
  }

  const hover = Math.sin(time * 5 + drone.id) * 3;
  const dy = hover;

  // Thruster glow exhaust
  ctx.fillStyle = '#38bdf8';
  ctx.globalAlpha = 0.6 + Math.sin(time * 15) * 0.3;
  ctx.fillRect(8, dy + 22, 6, 5);
  ctx.fillRect(18, dy + 22, 6, 5);
  ctx.globalAlpha = 1.0;

  // Mechanical spherical body (gunmetal grey & titanium)
  ctx.fillStyle = '#1e293b'; // Shadow rim
  ctx.beginPath();
  ctx.roundRect(4, dy + 2, 24, 20, 6);
  ctx.fill();

  ctx.fillStyle = '#475569'; // Mid plate
  ctx.beginPath();
  ctx.roundRect(5, dy + 3, 22, 18, 5);
  ctx.fill();

  ctx.fillStyle = '#94a3b8'; // Top highlight
  ctx.fillRect(8, dy + 4, 16, 4);

  // Side antenna / stabilizers
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, dy + 9, 5, 4);
  ctx.fillRect(27, dy + 9, 5, 4);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, dy + 10, 2, 2);
  ctx.fillRect(30, dy + 10, 2, 2);

  // Glowing Red Cyclops Visor Eye
  ctx.fillStyle = '#020617';
  ctx.fillRect(9, dy + 8, 14, 8); // Eye recess
  ctx.fillStyle = '#f43f5e'; // Red glowing lens
  ctx.fillRect(11, dy + 10, 10, 4);
  ctx.fillStyle = '#fda4af'; // Lens reflection
  ctx.fillRect(14, dy + 11, 3, 2);

  // Cyber rivets
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(6, dy + 5, 1, 1);
  ctx.fillRect(25, dy + 5, 1, 1);
  ctx.fillRect(6, dy + 18, 1, 1);
  ctx.fillRect(25, dy + 18, 1, 1);

  ctx.restore();
}

// Draw Giant Mechanical Sea-Serpent Boss (Frames 00:07 - 00:08)
export function drawGiantBoss(ctx: CanvasRenderingContext2D, boss: Boss, time: number) {
  ctx.save();
  ctx.translate(Math.floor(boss.x), Math.floor(boss.y));

  // Boss hit flash: entire leviathan turns glowing red/white when struck!
  const isHurt = boss.hurtTimer > 0;
  if (isHurt) {
    ctx.filter = 'brightness(1.8) sepia(1) hue-rotate(-50deg) saturate(6)';
  }

  const pulse = Math.sin(time * 4) * 3;

  // --- 1. SEGMENTED SERPENTINE CYBER BODY RISING FROM RIVER ---
  // Multiple massive armored coils beneath the water
  const bodySegments = [
    { x: -30, y: 110, w: 90, h: 45, angle: 0.1 },
    { x: -15, y: 75, w: 80, h: 42, angle: -0.05 },
    { x: 0, y: 40, w: 75, h: 40, angle: 0.05 },
    { x: 10, y: 10, w: 70, h: 38, angle: 0 },
  ];

  bodySegments.forEach((seg, idx) => {
    ctx.save();
    ctx.translate(seg.x, seg.y);
    ctx.rotate(seg.angle + Math.sin(time * 3 + idx) * 0.04);

    // Dark teal mechanical plates
    ctx.fillStyle = '#042f2e';
    ctx.beginPath();
    ctx.roundRect(-seg.w / 2, -seg.h / 2, seg.w, seg.h, 12);
    ctx.fill();

    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.roundRect(-seg.w / 2 + 4, -seg.h / 2 + 4, seg.w - 8, seg.h - 8, 8);
    ctx.fill();

    // Golden dorsal spines on body
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-seg.w / 2 + 8, -seg.h / 2 - 8, 8, 10);
    ctx.fillRect(-seg.w / 2 + 22, -seg.h / 2 - 12, 10, 14);

    // Armored rib plates & rivets
    ctx.fillStyle = '#14b8a6';
    ctx.fillRect(-seg.w / 2 + 12, -seg.h / 2 + 8, seg.w - 24, 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-seg.w / 2 + 10, -seg.h / 2 + 6, 3, 3);
    ctx.fillRect(seg.w / 2 - 14, -seg.h / 2 + 6, 3, 3);

    // Glowing cyan cyber power conduit line
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-seg.w / 2 + 18, 0, seg.w - 36, 2);

    ctx.restore();
  });

  // --- 2. GIANT MECHANICAL HEAD & ARMORED JAW ---
  const headX = 25;
  const headY = -35 + pulse;

  // Golden dorsal crest / razor horns on head
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.moveTo(headX - 35, headY - 10);
  ctx.lineTo(headX - 10, headY - 45);
  ctx.lineTo(headX + 5, headY - 20);
  ctx.lineTo(headX + 25, headY - 50);
  ctx.lineTo(headX + 40, headY - 20);
  ctx.lineTo(headX + 60, headY - 42);
  ctx.lineTo(headX + 65, headY - 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#facc15'; // Horn highlights
  ctx.fillRect(headX - 8, headY - 40, 4, 18);
  ctx.fillRect(headX + 26, headY - 45, 4, 20);

  // Main Cranium / Head Plate
  ctx.fillStyle = '#042f2e'; // Dark outer shell
  ctx.beginPath();
  ctx.roundRect(headX - 32, headY - 22, 85, 55, 14);
  ctx.fill();

  ctx.fillStyle = '#0f766e'; // Mid armor
  ctx.beginPath();
  ctx.roundRect(headX - 28, headY - 18, 77, 47, 10);
  ctx.fill();

  ctx.fillStyle = '#14b8a6'; // Plate highlight
  ctx.fillRect(headX - 22, headY - 15, 65, 8);

  // Glowing Ruby/Pink Forehead Gem (Matches Frame 00:07)
  ctx.save();
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(headX + 10, headY - 12, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(headX + 8, headY - 14, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Piercing Pink/Magenta Robotic Eyes
  ctx.fillStyle = '#020617';
  ctx.fillRect(headX - 12, headY + 2, 14, 8);
  ctx.fillRect(headX + 18, headY + 2, 14, 8);

  ctx.fillStyle = '#ec4899';
  ctx.fillRect(headX - 10, headY + 4, 10, 4);
  ctx.fillRect(headX + 20, headY + 4, 10, 4);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(headX - 8, headY + 4, 3, 2);
  ctx.fillRect(headX + 22, headY + 4, 3, 2);

  // Heavy Segmented Cyber Jaw & Mouth (Weak Point!)
  const jawDrop = boss.state === 'attack_plasma' ? 12 : (Math.sin(time * 3) > 0 ? 4 : 0);
  
  // Upper Teeth
  ctx.fillStyle = '#e2e8f0';
  for (let tx = headX - 20; tx < headX + 38; tx += 9) {
    ctx.fillRect(tx, headY + 22, 5, 6);
  }

  // Lower Jaw Plate
  ctx.fillStyle = '#042f2e';
  ctx.beginPath();
  ctx.roundRect(headX - 24, headY + 26 + jawDrop, 72, 22, 8);
  ctx.fill();
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(headX - 20, headY + 28 + jawDrop, 64, 16);

  // Lower Teeth
  ctx.fillStyle = '#e2e8f0';
  for (let tx = headX - 16; tx < headX + 36; tx += 9) {
    ctx.fillRect(tx, headY + 22 + jawDrop, 5, 5);
  }

  // Long cyber-tongue (Frame 00:07)
  const tongueWave = Math.sin(time * 12) * 5;
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.moveTo(headX + 5, headY + 26 + jawDrop);
  ctx.quadraticCurveTo(headX - 10, headY + 40 + jawDrop, headX - 20 + tongueWave, headY + 54 + jawDrop);
  ctx.lineTo(headX - 16 + tongueWave, headY + 54 + jawDrop);
  ctx.quadraticCurveTo(headX - 6, headY + 38 + jawDrop, headX + 12, headY + 26 + jawDrop);
  ctx.closePath();
  ctx.fill();

  // --- 3. ARTICULATED ROBOTIC ARMS & CLAWS (Frame 00:07) ---
  // Left Claw
  drawRoboticClaw(ctx, boss.claws.left.x, boss.claws.left.y, -1, time);
  // Right Claw
  drawRoboticClaw(ctx, boss.claws.right.x, boss.claws.right.y, 1, time);

  // Water surges at base of boss
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.8;
  const splashWave = Math.sin(time * 10) * 4;
  ctx.beginPath();
  ctx.ellipse(headX, 125, 75 + splashWave, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  ctx.restore();
}

// Draw Segmented Articulated Robotic Claw
function drawRoboticClaw(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);
  if (side === -1) ctx.scale(-1, 1);

  // Hydraulic Arm Upper Segment
  ctx.fillStyle = '#334155';
  ctx.fillRect(-6, -20, 12, 22);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-4, -18, 8, 18);

  // Circular Joint Pivot
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-2, 0, 4, 4);

  // Mechanical 3-Pronged Claws
  ctx.fillStyle = '#94a3b8';
  // Thumb claw
  ctx.beginPath();
  ctx.moveTo(-6, 6);
  ctx.lineTo(-18, 16);
  ctx.lineTo(-12, 20);
  ctx.lineTo(-2, 8);
  ctx.closePath();
  ctx.fill();

  // Main grasping claws
  ctx.beginPath();
  ctx.moveTo(2, 6);
  ctx.lineTo(14, 24);
  ctx.lineTo(8, 26);
  ctx.lineTo(0, 10);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.lineTo(24, 18);
  ctx.lineTo(20, 22);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Draw Spinning Golden Pixel Key Item
export function drawKeyItem(ctx: CanvasRenderingContext2D, item: KeyItem, time: number) {
  ctx.save();
  ctx.translate(Math.floor(item.x), Math.floor(item.y));

  const bob = Math.sin(time * 5 + item.timer) * 2;
  const spinScale = Math.cos(time * 6 + item.timer);

  ctx.scale(spinScale, 1);

  // Golden glow
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 8;

  // Key bow (circle)
  ctx.fillRect(-6, -10 + bob, 12, 10);
  ctx.fillStyle = '#78350f'; // hole
  ctx.fillRect(-2, -8 + bob, 4, 6);

  // Key shaft & bit
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-2, 0 + bob, 4, 12);
  ctx.fillRect(2, 4 + bob, 4, 3);
  ctx.fillRect(2, 9 + bob, 5, 3);

  // Shimmer sparkle
  if (Math.sin(time * 10) > 0.5) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, -9 + bob, 2, 2);
  }

  ctx.restore();
}

// Draw Retro HUD in Top-Left and Top-Right (Frames 00:02 - 00:06)
export function drawHUD(
  ctx: CanvasRenderingContext2D,
  player: Player,
  soundMuted: boolean,
  isPaused: boolean,
  canvasW: number,
  levelNumber: number = 1,
  levelLabel: string = 'LVL 1 [EASY]'
) {
  ctx.save();

  const startX = 16;
  const startY = 16;

  // --- HEALTH BAR CLUSTER ---
  // Red Heart Icon
  drawHeartIcon(ctx, startX, startY + 2);

  // Health Meter Container
  const barW = 86;
  const barH = 11;
  const hpPercent = Math.max(0, Math.min(1, player.health / player.maxHealth));

  // Dark frame with white border
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(startX + 18, startY + 2, barW + 4, barH + 4);
  ctx.fillStyle = '#334155';
  ctx.fillRect(startX + 20, startY + 4, barW, barH);

  // Red health gradient fill
  if (hpPercent > 0) {
    const hpGrad = ctx.createLinearGradient(startX + 20, startY + 4, startX + 20, startY + 4 + barH);
    hpGrad.addColorStop(0, '#f87171');
    hpGrad.addColorStop(0.5, '#ef4444');
    hpGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(startX + 20, startY + 4, Math.floor(barW * hpPercent), barH);

    // Segment divider lines for retro aesthetic
    ctx.fillStyle = '#7f1d1d';
    for (let s = 18; s < barW; s += 18) {
      if (s < barW * hpPercent) {
        ctx.fillRect(startX + 20 + s, startY + 4, 1, barH);
      }
    }
  }

  // --- ENERGY BAR CLUSTER ---
  const nrgY = startY + 20;
  // Blue Lightning Icon
  drawLightningIcon(ctx, startX, nrgY + 2);

  const nrgPercent = Math.max(0, Math.min(1, player.energy / player.maxEnergy));
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(startX + 18, nrgY + 2, barW + 4, barH + 4);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(startX + 20, nrgY + 4, barW, barH);

  if (nrgPercent > 0) {
    const nrgGrad = ctx.createLinearGradient(startX + 20, nrgY + 4, startX + 20, nrgY + 4 + barH);
    nrgGrad.addColorStop(0, '#7dd3fc');
    nrgGrad.addColorStop(0.5, '#0ea5e9');
    nrgGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = nrgGrad;
    ctx.fillRect(startX + 20, nrgY + 4, Math.floor(barW * nrgPercent), barH);
  }

  // --- GOLD KEY COUNTER (Starting at 0, goes to 10) ---
  const keyY = startY + 40;
  drawKeyIcon(ctx, startX, keyY + 2);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${player.keys}`, startX + 22, keyY + 12);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillText('/10', startX + 42, keyY + 12);

  // --- LEVEL BADGE IN TOP CENTER ---
  const badgeX = canvasW / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#020617';
  ctx.fillRect(badgeX - 54, startY + 1, 108, 17);
  // Badge background color per level
  const badgeColors = ['#047857', '#6d28d9', '#b91c1c'];
  ctx.fillStyle = badgeColors[Math.min(2, Math.max(0, levelNumber - 1))];
  ctx.fillRect(badgeX - 52, startY + 3, 104, 13);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 7px "Press Start 2P", monospace';
  ctx.fillText(levelLabel, badgeX, startY + 12);
  ctx.restore();

  // --- TOP-RIGHT PAUSE & AUDIO/CLOSE ICONS (Frame 00:05) ---
  const rightX = canvasW - 24;

  // Sound / Mute toggle button (speaker / ✕)
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(soundMuted ? '✕' : '🔊', rightX - 26, startY + 12);

  // Pause Icon (❚❚)
  ctx.font = 'bold 12px "Press Start 2P", monospace';
  ctx.fillText(isPaused ? '▶' : '❚❚', rightX, startY + 12);

  ctx.restore();
}

// Draw Heart Icon
function drawHeartIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(x + 7, y + 13);
  ctx.bezierCurveTo(x, y + 8, x - 2, y + 2, x + 4, y);
  ctx.bezierCurveTo(x + 7, y, x + 7, y + 3, x + 7, y + 3);
  ctx.bezierCurveTo(x + 7, y + 3, x + 7, y, x + 10, y);
  ctx.bezierCurveTo(x + 16, y + 2, x + 14, y + 8, x + 7, y + 13);
  ctx.fill();
}

// Draw Lightning Icon
function drawLightningIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(x + 9, y);
  ctx.lineTo(x + 3, y + 7);
  ctx.lineTo(x + 7, y + 7);
  ctx.lineTo(x + 5, y + 14);
  ctx.lineTo(x + 12, y + 6);
  ctx.lineTo(x + 8, y + 6);
  ctx.closePath();
  ctx.fill();
}

// Draw Key Icon
function drawKeyIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x + 2, y + 1, 8, 8);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 4, y + 3, 4, 4);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x + 9, y + 4, 8, 2);
  ctx.fillRect(x + 13, y + 6, 2, 3);
  ctx.fillRect(x + 16, y + 6, 2, 3);
}

// Draw Boss Health Bar at Bottom of Screen (Frames 00:07 - 00:08)
export function drawBossHUD(ctx: CanvasRenderingContext2D, boss: Boss, canvasW: number, canvasH: number) {
  ctx.save();
  const hudY = canvasH - 36;
  const barW = canvasW - 90;
  const barH = 14;
  const startX = 64;

  // Boss Icon on the Left
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(16, hudY - 6, 36, 36);
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(18, hudY - 4, 32, 32);

  // Tiny Boss Serpent Head Graphic in icon box
  ctx.fillStyle = '#facc15';
  ctx.fillRect(20, hudY - 1, 6, 8);
  ctx.fillRect(28, hudY - 2, 6, 9);
  ctx.fillStyle = '#042f2e';
  ctx.fillRect(22, hudY + 4, 24, 18);
  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(24, hudY + 6, 20, 14);
  ctx.fillStyle = '#f43f5e'; // Pink gem & eye
  ctx.fillRect(32, hudY + 7, 4, 4);
  ctx.fillRect(26, hudY + 12, 4, 3);
  ctx.fillRect(38, hudY + 12, 4, 3);

  // Label "BOSS"
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('BOSS', startX, hudY - 4);

  // Health Meter Container
  ctx.fillStyle = '#020617';
  ctx.fillRect(startX, hudY + 2, barW + 4, barH + 4);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(startX + 2, hudY + 4, barW, barH);

  // Pink / Magenta health bar fill
  const hpRatio = Math.max(0, Math.min(1, boss.health / boss.maxHealth));
  if (hpRatio > 0) {
    const bossGrad = ctx.createLinearGradient(startX + 2, hudY + 4, startX + 2, hudY + 4 + barH);
    bossGrad.addColorStop(0, '#fda4af');
    bossGrad.addColorStop(0.5, '#f43f5e');
    bossGrad.addColorStop(1, '#9f1239');
    ctx.fillStyle = bossGrad;
    ctx.fillRect(startX + 2, hudY + 4, Math.floor(barW * hpRatio), barH);

    // Segment lines
    ctx.fillStyle = '#881337';
    for (let s = 25; s < barW; s += 25) {
      if (s < barW * hpRatio) {
        ctx.fillRect(startX + 2 + s, hudY + 4, 2, barH);
      }
    }
  }

  ctx.restore();
}

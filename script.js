/**
 * SAFEZONE 360 — Advanced 60FPS Kinetic Traffic Simulation Engine
 * Real physics, vehicle kinetics, particle brake lights, pedestrian flocking,
 * weather adaptation, audio synthesizer, risk audit calculator, & SOS alarms.
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initCursorGlow();
  initNavigation();
  initAudioFeedback();
  initHeroPerspectiveCanvas();
  initInteractiveSimulator();
  initAtmosphericMatrix();
  initRiskAuditCalculator();
  initEmergencyDemo();
});

/* ==========================================================================
   1. Scroll Progress & Cursor Glow
   ========================================================================== */
function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

function initCursorGlow() {
  const cursorGlow = document.getElementById('cursorGlow');
  if (!cursorGlow || window.matchMedia('(hover: none)').matches) return;

  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
  });
}

/* ==========================================================================
   2. Navigation & Tactical Audio Synth
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobileMenuBtn');
  const navLinksMenu = document.getElementById('navLinks');
  const btnFooterTop = document.getElementById('btnFooterTop');
  const thermalToggle = document.getElementById('thermalToggle');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) link.classList.add('active');
    });
  }, { passive: true });

  if (mobileToggle && navLinksMenu) {
    mobileToggle.addEventListener('click', () => navLinksMenu.classList.toggle('mobile-open'));
    navLinks.forEach(l => l.addEventListener('click', () => navLinksMenu.classList.remove('mobile-open')));
  }

  if (btnFooterTop) {
    btnFooterTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  if (thermalToggle) {
    thermalToggle.addEventListener('click', () => {
      document.body.classList.toggle('thermal-mode');
      playTone(680, 'sawtooth', 0.08);
    });
  }
}

function initAudioFeedback() {
  const soundToggle = document.getElementById('soundToggle');
  const soundIconOn = document.getElementById('soundIconOn');
  const soundIconOff = document.getElementById('soundIconOff');

  if (!soundToggle) return;

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled && !audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }

    if (soundEnabled) {
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
      playTone(520, 'sine', 0.1);
    } else {
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
    }
  });

  document.querySelectorAll('button, .switch-box, .weather-selector-card, input[type=range], select').forEach(el => {
    el.addEventListener('click', () => {
      if (soundEnabled) playTone(440, 'triangle', 0.04);
    });
  });
}

function playTone(freq, type = 'sine', duration = 0.08) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

/* ==========================================================================
   3. Real 60FPS Hero Road Perspective Canvas
   ========================================================================== */
function initHeroPerspectiveCanvas() {
  const canvas = document.getElementById('heroPerspectiveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  class HeroCar {
    constructor(lane, dir) {
      this.lane = lane;
      this.dir = dir;
      this.reset();
    }
    reset() {
      this.w = 72;
      this.h = 32;
      this.speed = this.lane === 0 ? 3.4 : 3.8;
      this.x = this.dir === 1 ? -100 - Math.random() * 300 : width + 100 + Math.random() * 300;
      this.y = this.lane === 0 ? 215 : 295;
      this.color = ['#00E5FF', '#34D399', '#FFB547', '#38BDF8'][Math.floor(Math.random() * 4)];
      this.braking = false;
    }
    update(zebraOccupied) {
      if (this.dir === 1) {
        if (this.x > 450 && this.x < 550 && zebraOccupied) {
          this.speed = Math.max(0, this.speed - 0.2);
          this.braking = true;
        } else {
          this.speed = Math.min(3.4, this.speed + 0.1);
          this.braking = false;
        }
        this.x += this.speed;
        if (this.x > width + 120) this.reset();
      } else {
        if (this.x < 780 && this.x > 700 && zebraOccupied) {
          this.speed = Math.max(0, this.speed - 0.2);
          this.braking = true;
        } else {
          this.speed = Math.min(3.8, this.speed + 0.1);
          this.braking = false;
        }
        this.x -= this.speed;
        if (this.x < -120) this.reset();
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Chassis
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.roundRect(0, 0, this.w, this.h, 6);
      ctx.fill();

      // Cabin
      ctx.fillStyle = '#07111F';
      ctx.beginPath();
      ctx.roundRect(this.dir === 1 ? 20 : 12, 4, 32, 24, 3);
      ctx.fill();

      // Lights
      if (this.dir === 1) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.w - 2, 4, 3, 5);
        ctx.fillRect(this.w - 2, this.h - 9, 3, 5);

        ctx.fillStyle = this.braking ? '#FF2244' : '#AA1122';
        if (this.braking) {
          ctx.shadowColor = '#FF2244';
          ctx.shadowBlur = 15;
        }
        ctx.fillRect(0, 4, 3, 5);
        ctx.fillRect(0, this.h - 9, 3, 5);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 4, 3, 5);
        ctx.fillRect(0, this.h - 9, 3, 5);

        ctx.fillStyle = this.braking ? '#FF2244' : '#AA1122';
        if (this.braking) {
          ctx.shadowColor = '#FF2244';
          ctx.shadowBlur = 15;
        }
        ctx.fillRect(this.w - 2, 4, 3, 5);
        ctx.fillRect(this.w - 2, this.h - 9, 3, 5);
      }
      ctx.restore();
    }
  }

  const heroCars = [
    new HeroCar(0, 1),
    new HeroCar(0, 1),
    new HeroCar(1, -1),
    new HeroCar(1, -1)
  ];
  heroCars[1].x -= 300;
  heroCars[3].x += 350;

  let studentY = 200;
  let studentDirection = 1;

  function renderHero() {
    ctx.clearRect(0, 0, width, height);

    // Road Surface
    ctx.fillStyle = '#081324';
    ctx.fillRect(0, 180, width, 180);

    // Sidewalks
    ctx.fillStyle = '#0e223d';
    ctx.fillRect(0, 140, width, 40);
    ctx.fillRect(0, 360, width, 50);

    // School Compound North
    ctx.strokeStyle = '#1e3a63';
    ctx.lineWidth = 2;
    ctx.strokeRect(300, 20, 680, 110);
    ctx.fillStyle = '#102746';
    ctx.fillRect(300, 20, 680, 110);

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 13px "Space Grotesk"';
    ctx.fillText('PCCOE CAMPUS ACCESS GATE &bull; ZERO HAZARD ZONE', 420, 65);

    // Center road dash
    ctx.strokeStyle = '#FFB547';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, 270);
    ctx.lineTo(width, 270);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zebra Sanctuary (X: 580 to 700)
    ctx.fillStyle = '#060f1c';
    ctx.fillRect(580, 180, 120, 180);

    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 8;
    for (let y = 195; y <= 345; y += 26) {
      ctx.fillRect(595, y, 90, 13);
    }
    ctx.shadowBlur = 0;

    // Student Walk
    studentY += 0.8 * studentDirection;
    if (studentY > 340) studentDirection = -1;
    if (studentY < 195) studentDirection = 1;
    const zebraOccupied = studentY > 195 && studentY < 345;

    // Draw Walking Students
    ctx.save();
    ctx.translate(640, studentY);
    ctx.fillStyle = '#00E5FF';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FFB547';
    ctx.beginPath();
    ctx.arc(14, 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    heroCars.forEach(car => {
      car.update(zebraOccupied);
      car.draw(ctx);
    });

    const approachSpeedEl = document.getElementById('heroLiveApproachSpeed');
    if (approachSpeedEl) {
      approachSpeedEl.textContent = zebraOccupied ? '12 km/h' : '19 km/h';
    }

    requestAnimationFrame(renderHero);
  }

  renderHero();
}

/* ==========================================================================
   4. High-Octane 60FPS Interactive Simulator Canvas
   ========================================================================== */
function initInteractiveSimulator() {
  const canvas = document.getElementById('interactiveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Controls
  const toggleSpeed = document.getElementById('toggleSpeedGovernor');
  const toggleCrossing = document.getElementById('toggleZebraSignal');
  const togglePickup = document.getElementById('togglePickupBay');
  const toggleSigns = document.getElementById('toggleWarningMasts');
  const toggleLaser = document.getElementById('toggleLaserCurtain');

  const carSlider = document.getElementById('sliderCarDensity');
  const carLabel = document.getElementById('labelCarDensity');
  const pedSlider = document.getElementById('sliderPedRate');
  const pedLabel = document.getElementById('labelPedRate');

  const btnRush = document.getElementById('btnScenarioRush');
  const btnSafe = document.getElementById('btnScenarioSafe');
  const btnSpawn = document.getElementById('btnSpawnStudent');
  const btnReset = document.getElementById('btnResetSim');

  const liveCarsEl = document.getElementById('simLiveCars');
  const liveYieldEl = document.getElementById('simLiveYield');
  const liveRiskEl = document.getElementById('simLiveRisk');
  const alarmBanner = document.getElementById('simAlarmBanner');

  let state = {
    speedGovernor: true,
    crossingSignal: true,
    pickupBay: true,
    warningMasts: true,
    laserCurtain: true,
    carCount: 5,
    pedRate: 3
  };

  class KineticVehicle {
    constructor(lane) {
      this.lane = lane;
      this.w = 62;
      this.h = 28;
      this.color = ['#00E5FF', '#34D399', '#FBBF24', '#F43F5E', '#A78BFA', '#38BDF8'][Math.floor(Math.random() * 6)];
      this.x = lane === 0 ? -Math.random() * 600 - 80 : width + Math.random() * 600 + 80;
      this.y = lane === 0 ? 215 : 295;
      this.vx = lane === 0 ? 3.2 : -3.2;
      this.braking = false;
    }

    update(pedestrians, allVehicles) {
      const isEast = this.lane === 0;
      let targetSpeed = state.speedGovernor ? (isEast ? 2.3 : -2.3) : (isEast ? 5.8 : -5.8);

      allVehicles.forEach(other => {
        if (other !== this && other.lane === this.lane) {
          const dist = isEast ? (other.x - this.x) : (this.x - other.x);
          if (dist > 0 && dist < 110) {
            targetSpeed = isEast ? Math.min(targetSpeed, other.vx * 0.8) : Math.max(targetSpeed, other.vx * 0.8);
          }
        }
      });

      const zebraActive = state.crossingSignal && pedestrians.some(p => p.crossing && Math.abs(p.y - this.y) < 60);

      if (zebraActive) {
        if (isEast && this.x > 310 && this.x < 420) {
          targetSpeed = 0;
          this.braking = true;
        } else if (!isEast && this.x < 620 && this.x > 510) {
          targetSpeed = 0;
          this.braking = true;
        } else {
          this.braking = false;
        }
      } else {
        this.braking = false;
      }

      if (!state.pickupBay && isEast && this.x > 120 && this.x < 280) {
        targetSpeed *= 0.35;
      }

      this.vx += (targetSpeed - this.vx) * 0.08;
      this.x += this.vx;

      if (isEast && this.x > width + 100) this.x = -80;
      if (!isEast && this.x < -100) this.x = width + 80;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.roundRect(0, 0, this.w, this.h, 5);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#07111F';
      const isEast = this.lane === 0;
      ctx.beginPath();
      ctx.roundRect(isEast ? 16 : 10, 4, 28, 20, 2);
      ctx.fill();

      if (isEast) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.w - 2, 4, 3, 5);
        ctx.fillRect(this.w - 2, this.h - 9, 3, 5);

        ctx.fillStyle = this.braking ? '#FF2244' : '#771122';
        if (this.braking) {
          ctx.shadowColor = '#FF2244';
          ctx.shadowBlur = 12;
        }
        ctx.fillRect(0, 4, 3, 5);
        ctx.fillRect(0, this.h - 9, 3, 5);
      } else {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 4, 3, 5);
        ctx.fillRect(0, this.h - 9, 3, 5);

        ctx.fillStyle = this.braking ? '#FF2244' : '#771122';
        if (this.braking) {
          ctx.shadowColor = '#FF2244';
          ctx.shadowBlur = 12;
        }
        ctx.fillRect(this.w - 2, 4, 3, 5);
        ctx.fillRect(this.w - 2, this.h - 9, 3, 5);
      }

      ctx.restore();
    }
  }

  class Pedestrian {
    constructor(x, y) {
      this.x = x || (440 + Math.random() * 50);
      this.y = y || 140;
      this.targetY = 380;
      this.speed = 1.1 + Math.random() * 0.4;
      this.crossing = true;
      this.color = Math.random() > 0.5 ? '#00E5FF' : '#FFB547';
    }
    update() {
      if (this.crossing) {
        this.y += this.speed;
        if (this.y > 380) this.crossing = false;
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = state.crossingSignal ? '#34D399' : '#FF5D73';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  let vehicles = [];
  function rebuildVehicles() {
    vehicles = [];
    for (let i = 0; i < state.carCount; i++) {
      vehicles.push(new KineticVehicle(i % 2));
    }
    if (liveCarsEl) liveCarsEl.textContent = state.carCount;
  }
  rebuildVehicles();

  let pedestrians = [
    new Pedestrian(450, 180),
    new Pedestrian(475, 220)
  ];

  setInterval(() => {
    if (pedestrians.length < state.pedRate * 2) {
      pedestrians.push(new Pedestrian(440 + Math.random() * 55, 140));
    }
    pedestrians = pedestrians.filter(p => p.y < 380);
  }, 2200);

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * width;
    pedestrians.push(new Pedestrian(clickX, 140));
    playTone(720, 'sine', 0.05);
  });

  function renderSimulator() {
    ctx.clearRect(0, 0, width, height);

    // Floor Grid
    ctx.strokeStyle = '#12233c';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // School North
    ctx.fillStyle = '#091931';
    ctx.fillRect(40, 20, width - 80, 110);
    ctx.strokeStyle = '#1d3c67';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 20, width - 80, 110);

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 12px "Space Grotesk"';
    ctx.fillText('PCCOE MAIN ENTRANCE — SCHOOL ZONE DEFENSE CORRIDOR', 280, 50);

    // Drop-off bay
    ctx.strokeStyle = state.pickupBay ? '#34D399' : '#FF5D73';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(60, 130, 260, 40);
    ctx.setLineDash([]);
    ctx.fillStyle = state.pickupBay ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 93, 115, 0.15)';
    ctx.fillRect(60, 130, 260, 40);

    ctx.fillStyle = state.pickupBay ? '#34D399' : '#FF5D73';
    ctx.font = 'bold 9px "JetBrains Mono"';
    ctx.fillText(state.pickupBay ? 'ORGANIZED SINGLE-BAY DROP-OFF' : 'HAZARDOUS DOUBLE PARKING BOTTLENECK', 70, 155);

    // Laser Curtain
    if (state.laserCurtain) {
      ctx.strokeStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 175);
      ctx.lineTo(410, 175);
      ctx.moveTo(530, 175);
      ctx.lineTo(width - 60, 175);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Road
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 175, width, 190);

    ctx.strokeStyle = '#FFB547';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([20, 14]);
    ctx.beginPath();
    ctx.moveTo(0, 270);
    ctx.lineTo(width, 270);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zebra
    ctx.fillStyle = '#060f1e';
    ctx.fillRect(420, 175, 100, 190);

    ctx.fillStyle = state.crossingSignal ? '#FFFFFF' : '#888888';
    if (state.crossingSignal) {
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 10;
    }
    for (let y = 185; y <= 350; y += 22) {
      ctx.fillRect(430, y, 80, 11);
    }
    ctx.shadowBlur = 0;

    // Stop lines
    ctx.strokeStyle = state.crossingSignal ? '#FF5D73' : '#555';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(405, 178); ctx.lineTo(405, 268);
    ctx.moveTo(535, 272); ctx.lineTo(535, 362);
    ctx.stroke();

    // Warning Masts
    if (state.warningMasts) {
      ctx.fillStyle = '#FFB547';
      ctx.beginPath();
      ctx.arc(200, 110, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#FFB547';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Speed Sign
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(720, 110, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = state.speedGovernor ? '#34D399' : '#FF5D73';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px "Space Grotesk"';
    ctx.fillText(state.speedGovernor ? '20' : '60', 712, 115);

    vehicles.forEach(v => {
      v.update(pedestrians, vehicles);
      v.draw(ctx);
    });

    pedestrians.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    // South buffer
    ctx.fillStyle = '#091931';
    ctx.fillRect(40, 390, width - 80, 110);
    ctx.strokeStyle = '#1d3c67';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 390, width - 80, 110);

    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 11px "Space Grotesk"';
    ctx.fillText('PEDESTRIAN SAFE HAVEN &bull; PCCOE BUFFER ZONE', 320, 435);

    // Hazard incursion
    let hazard = false;
    vehicles.forEach(v => {
      pedestrians.forEach(p => {
        if (Math.abs(v.x + 30 - p.x) < 35 && Math.abs(v.y + 14 - p.y) < 26) {
          hazard = true;
        }
      });
    });

    if (hazard) {
      if (alarmBanner) alarmBanner.classList.remove('hidden');
      if (liveRiskEl) {
        liveRiskEl.textContent = 'HIGH HAZARD';
        liveRiskEl.className = 'text-coral';
      }
      playTone(220, 'sawtooth', 0.1);
    } else {
      if (alarmBanner) alarmBanner.classList.add('hidden');
      if (liveRiskEl) {
        liveRiskEl.textContent = state.speedGovernor && state.crossingSignal ? '0.0%' : '14.2%';
        liveRiskEl.className = 'text-green';
      }
    }

    if (liveYieldEl) {
      liveYieldEl.textContent = state.crossingSignal ? '100%' : '38%';
    }

    requestAnimationFrame(renderSimulator);
  }

  renderSimulator();

  toggleSpeed.addEventListener('change', () => state.speedGovernor = toggleSpeed.checked);
  toggleCrossing.addEventListener('change', () => state.crossingSignal = toggleCrossing.checked);
  togglePickup.addEventListener('change', () => state.pickupBay = togglePickup.checked);
  toggleSigns.addEventListener('change', () => state.warningMasts = toggleSigns.checked);
  toggleLaser.addEventListener('change', () => state.laserCurtain = toggleLaser.checked);

  carSlider.addEventListener('input', (e) => {
    state.carCount = parseInt(e.target.value, 10);
    carLabel.textContent = `${state.carCount} Vehicles`;
    rebuildVehicles();
  });

  pedSlider.addEventListener('input', (e) => {
    state.pedRate = parseInt(e.target.value, 10);
    pedLabel.textContent = `Level ${state.pedRate}`;
  });

  btnRush.addEventListener('click', () => {
    btnRush.classList.add('active');
    btnSafe.classList.remove('active');
    toggleSpeed.checked = false; state.speedGovernor = false;
    toggleCrossing.checked = false; state.crossingSignal = false;
    togglePickup.checked = false; state.pickupBay = false;
    toggleSigns.checked = false; state.warningMasts = false;
    toggleLaser.checked = false; state.laserCurtain = false;
    carSlider.value = 8; state.carCount = 8;
    rebuildVehicles();
  });

  btnSafe.addEventListener('click', () => {
    btnSafe.classList.add('active');
    btnRush.classList.remove('active');
    toggleSpeed.checked = true; state.speedGovernor = true;
    toggleCrossing.checked = true; state.crossingSignal = true;
    togglePickup.checked = true; state.pickupBay = true;
    toggleSigns.checked = true; state.warningMasts = true;
    toggleLaser.checked = true; state.laserCurtain = true;
    carSlider.value = 5; state.carCount = 5;
    rebuildVehicles();
  });

  btnSpawn.addEventListener('click', () => {
    pedestrians.push(new Pedestrian(450 + Math.random() * 40, 140));
    playTone(600, 'sine', 0.08);
  });

  btnReset.addEventListener('click', () => {
    btnSafe.click();
    pedestrians = [new Pedestrian(450, 180)];
  });
}

/* ==========================================================================
   5. Atmospheric Weather Matrix
   ========================================================================== */
function initAtmosphericMatrix() {
  const cards = document.querySelectorAll('.weather-selector-card');
  const title = document.getElementById('weatherModeTitle');
  const desc = document.getElementById('weatherModeDesc');
  const braking = document.getElementById('weatherBrakingDist');
  const lumens = document.getElementById('weatherLumens');
  const speed = document.getElementById('weatherSpeedCap');
  const particleBox = document.getElementById('weatherParticleLayer');

  const presets = {
    daylight: {
      title: 'SYSTEM ADAPTATION: BRIGHT DAYLIGHT',
      desc: 'Standard optical and LiDAR scanning parameters active. Full 20 km/h baseline speed ceiling enforced.',
      braking: '4.2 Meters',
      lumens: '8,000 lm',
      speed: '20 km/h Max',
      style: ''
    },
    monsoon: {
      title: 'SYSTEM ADAPTATION: MONSOON RAIN DEFENSE',
      desc: 'In-road grip coefficient drops by 35%. Speed limit automatically dialed back to 15 km/h. Zebra beacon LEDs boost luminance by 200%.',
      braking: '7.8 Meters (Calibrated)',
      lumens: '16,000 lm',
      speed: '15 km/h Max',
      style: 'rain'
    },
    fog: {
      title: 'SYSTEM ADAPTATION: DENSE FOG PENETRATION',
      desc: 'Ground-level green lasers project high-visibility walking corridors onto the road surface through 100m haze. Ultrasonic collision chirps active.',
      braking: '5.5 Meters',
      lumens: '24,000 lm (Strobe)',
      speed: '15 km/h Max',
      style: 'fog'
    },
    thermal: {
      title: 'SYSTEM ADAPTATION: INFRARED THERMAL NIGHT MODE',
      desc: 'Infrared tracking cameras detect human body heat 180 meters out. Dynamic overhead spot-lamps illuminate individual crossing children.',
      braking: '4.4 Meters',
      lumens: '18,000 lm (Tracked)',
      speed: '20 km/h Max',
      style: 'thermal'
    }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const mode = card.getAttribute('data-weather');
      const data = presets[mode];
      if (!data) return;

      title.textContent = data.title;
      desc.textContent = data.desc;
      braking.textContent = data.braking;
      lumens.textContent = data.lumens;
      speed.textContent = data.speed;

      if (particleBox) {
        if (data.style === 'rain') {
          particleBox.style.background = 'repeating-linear-gradient(transparent, transparent 10px, rgba(0, 229, 255, 0.25) 10px, rgba(0, 229, 255, 0.25) 12px)';
        } else if (data.style === 'fog') {
          particleBox.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(7, 17, 31, 0.8) 100%)';
        } else {
          particleBox.style.background = 'none';
        }
      }

      playTone(500, 'sine', 0.05);
    });
  });
}

/* ==========================================================================
   6. Interactive Zone Risk Calculator
   ========================================================================== */
function initRiskAuditCalculator() {
  const calcSpeed = document.getElementById('inputAvgSpeed');
  const calcSpeedVal = document.getElementById('displaySpeedVal');
  const calcCrossing = document.getElementById('selectCrossingType');
  const calcDropoff = document.getElementById('selectDropoffType');
  const calcPolice = document.getElementById('selectPolicePresence');

  const riskNumber = document.getElementById('riskScoreNumber');
  const riskRating = document.getElementById('riskRatingTag');
  const gaugeCircle = document.getElementById('riskGaugeCircle');
  const recsList = document.getElementById('calcRecommendationsList');
  const applyBtn = document.getElementById('btnTransferToSim');

  function calculateRisk() {
    const speed = parseInt(calcSpeed.value, 10);
    calcSpeedVal.textContent = `${speed} km/h`;

    let score = Math.round(((speed - 20) / 50) * 45);

    if (calcCrossing.value === 'none') score += 30;
    else if (calcCrossing.value === 'standard') score += 18;
    else if (calcCrossing.value === 'illuminated') score += 8;
    else if (calcCrossing.value === 'safezone') score += 0;

    if (calcDropoff.value === 'chaotic') score += 20;
    else if (calcDropoff.value === 'semi') score += 10;
    else if (calcDropoff.value === 'dedicated') score += 0;

    if (calcPolice.value === 'none') score += 15;
    else if (calcPolice.value === 'intermittent') score += 8;
    else if (calcPolice.value === 'continuous') score += 0;

    score = Math.max(5, Math.min(98, score));
    riskNumber.textContent = score;

    let color = '#34D399';
    let text = 'LOW HAZARD &bull; SAFE ZONE';
    const recs = [];

    if (score > 65) {
      color = '#FF5D73';
      text = 'CRITICAL HAZARD &bull; IMMEDIATE ACTION';
      recs.push('Deploy 20 km/h LiDAR Radar Speed Governor immediately.');
      recs.push('Upgrade crosswalk with In-Road LED pulsating pavers.');
      recs.push('Enforce segregated drop-off bay to eradicate double parking.');
    } else if (score > 35) {
      color = '#FFB547';
      text = 'MODERATE HAZARD &bull; ACTION RECOMMENDED';
      recs.push('Synchronize school bell signals with approach beacons.');
      recs.push('Install high-contrast zebra pavers with illuminated push-buttons.');
      recs.push('Channel pickup queues into designated drop-off lanes.');
    } else {
      color = '#34D399';
      text = 'OPTIMAL COMPLIANCE &bull; ZERO DEFICIT';
      recs.push('SafeZone 360 standards met. Maintain preventive sensors.');
      recs.push('Continue community parent and driver awareness broadcasts.');
    }

    riskRating.innerHTML = text;
    riskRating.style.color = color;
    gaugeCircle.style.background = `conic-gradient(${color} 0% ${score}%, rgba(255, 255, 255, 0.1) ${score}% 100%)`;
    gaugeCircle.style.boxShadow = `0 0 25px ${color}`;

    if (recsList) {
      recsList.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
    }
  }

  [calcSpeed, calcCrossing, calcDropoff, calcPolice].forEach(input => {
    if (input) input.addEventListener('input', calculateRisk);
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      window.location.hash = '#interactive-simulator';
      playTone(660, 'sine', 0.1);
    });
  }

  calculateRisk();
}

/* ==========================================================================
   7. Emergency Hazard Incident Trigger Demo
   ========================================================================== */
function initEmergencyDemo() {
  const triggerBtn = document.getElementById('heroTriggerHazard');
  const alarmBanner = document.getElementById('simAlarmBanner');

  if (!triggerBtn) return;

  triggerBtn.addEventListener('click', () => {
    window.location.hash = '#interactive-simulator';
    if (alarmBanner) {
      alarmBanner.classList.remove('hidden');
      setTimeout(() => alarmBanner.classList.add('hidden'), 4000);
    }
    playTone(280, 'sawtooth', 0.2);
  });
}

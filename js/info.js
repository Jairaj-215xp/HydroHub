document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Molecule Canvas Simulation (Production Grade) ---
    const canvas = document.getElementById('molecule-canvas');
    const ctx = canvas.getContext('2d');
    const tempSlider = document.getElementById('temp-slider');
    const tempReadout = document.getElementById('temp-readout');
    
    // Set canvas dimensions
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth - 40; // minus padding
        canvas.height = 400;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let molecules = [];
    const numMolecules = 60;

    class Molecule {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
            this.radius = 5;
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.2;
        }

        draw(color, glow) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            ctx.shadowBlur = glow ? 15 : 0;
            ctx.shadowColor = color;
            ctx.fillStyle = color;

            ctx.beginPath();
            ctx.arc(-4, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(4, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }

        update(tempFactor) {
            let speedMultiplier = 0.1 + (tempFactor * 8);
            let gravity = tempFactor < 0.2 ? (0.2 - tempFactor) * 2 : 0;
            
            this.vy += gravity;
            
            this.x += this.vx * speedMultiplier;
            this.y += this.vy * speedMultiplier;
            this.angle += this.spin * speedMultiplier;

            let bounce = tempFactor < 0.2 ? -0.5 : -1;
            
            if (this.x < this.radius) { this.x = this.radius; this.vx *= bounce; }
            if (this.x > canvas.width - this.radius) { this.x = canvas.width - this.radius; this.vx *= bounce; }
            if (this.y < this.radius) { this.y = this.radius; this.vy *= bounce; }
            if (this.y > canvas.height - this.radius) { 
                this.y = canvas.height - this.radius; 
                this.vy *= bounce; 
                if (tempFactor < 0.2) this.vx *= 0.9;
            }
        }
    }

    for (let i = 0; i < numMolecules; i++) {
        molecules.push(new Molecule());
    }

    function animateMolecules() {
        ctx.fillStyle = 'rgba(10, 15, 20, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const tempValue = tempSlider.value;
        const tempFactor = tempValue / 100;
        
        let mColor = 'rgba(0, 240, 255, 0.8)';
        let mGlow = true;

        if (tempValue < 20) {
            tempReadout.innerText = "State: Liquid (Cryogenic)";
            tempReadout.style.color = "#4488ff";
            mColor = 'rgba(68, 136, 255, 0.9)';
            mGlow = false;
        } else if (tempValue < 80) {
            tempReadout.innerText = "State: Gas (Ambient)";
            tempReadout.style.color = "var(--accent-cyan)";
            mColor = 'rgba(0, 240, 255, 0.8)';
        } else {
            tempReadout.innerText = "State: Plasma (High Energy)";
            tempReadout.style.color = "#ff4444";
            mColor = 'rgba(255, 68, 68, 0.9)';
            molecules.forEach(m => { m.vx += (Math.random()-0.5)*0.5; m.vy += (Math.random()-0.5)*0.5; });
        }

        for(let i=0; i<molecules.length; i++) {
            for(let j=i+1; j<molecules.length; j++) {
                let dx = molecules[i].x - molecules[j].x;
                let dy = molecules[i].y - molecules[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 12) {
                    let tempVx = molecules[i].vx;
                    let tempVy = molecules[i].vy;
                    molecules[i].vx = molecules[j].vx;
                    molecules[i].vy = molecules[j].vy;
                    molecules[j].vx = tempVx;
                    molecules[j].vy = tempVy;
                    
                    molecules[i].x += dx * 0.1;
                    molecules[i].y += dy * 0.1;
                }
            }
        }

        molecules.forEach(m => {
            m.update(tempFactor);
            m.draw(mColor, mGlow);
        });
        
        requestAnimationFrame(animateMolecules);
    }
    animateMolecules();

    // --- 2. Production-Grade Fluid Electrolysis Simulation ---
    const btnElectrolysis = document.getElementById('btn-electrolysis');
    const electrolysisStatus = document.getElementById('electrolysis-status');
    const fluidWrapper = document.querySelector('.fluid-sim-wrapper');
    const fluidBody = document.getElementById('fluid-body');
    const cathodeBubbles = document.getElementById('fluid-cathode-bubbles');
    const anodeBubbles = document.getElementById('fluid-anode-bubbles');
    
    let fActive = false;
    let effervescenceInterval;
    let fluidLevel = 85; // Initial height %
    let levelInterval;

    btnElectrolysis.addEventListener('click', () => {
        fActive = !fActive;
        if (fActive) {
            btnElectrolysis.innerText = "Stop Power";
            btnElectrolysis.classList.replace('btn-primary', 'btn-secondary');
            electrolysisStatus.innerText = "Status: Splitting Fluid (High Output)";
            electrolysisStatus.style.color = "var(--accent-cyan)";
            fluidWrapper.classList.add('power-active');
            
            // Start Effervescence (Bubbling)
            effervescenceInterval = setInterval(() => {
                spawnFluidBubble(cathodeBubbles);
                // Spawn twice as much H2 as O2
                setTimeout(() => spawnFluidBubble(cathodeBubbles), 20); 
                spawnFluidBubble(anodeBubbles);
            }, 40);
            
            // Decrease fluid level over time (Sped up)
            levelInterval = setInterval(() => {
                if (fluidLevel > 30) {
                    fluidLevel -= 1.5; // Drain faster
                    fluidBody.style.height = fluidLevel + '%';
                }
            }, 150);

        } else {
            btnElectrolysis.innerText = "Apply Power (Split Fluid)";
            btnElectrolysis.classList.replace('btn-secondary', 'btn-primary');
            electrolysisStatus.innerText = "Status: Idle";
            electrolysisStatus.style.color = "var(--text-secondary)";
            fluidWrapper.classList.remove('power-active');
            
            clearInterval(effervescenceInterval);
            clearInterval(levelInterval);
            
            // Replenish fluid when idle
            let replenish = setInterval(() => {
                if (fluidLevel < 85 && !fActive) {
                    fluidLevel += 1;
                    fluidBody.style.height = fluidLevel + '%';
                } else {
                    clearInterval(replenish);
                }
            }, 200);
        }
    });

    function spawnFluidBubble(container) {
        const bubble = document.createElement('div');
        bubble.className = 'fluid-bubble';
        
        // Random horizontal position across the electrode width (with some spread)
        const left = Math.random() * 100; 
        bubble.style.left = left + '%';
        
        // Random start depth (bottom of rod to top)
        const bottom = Math.random() * 60;
        bubble.style.bottom = bottom + '%';
        
        // Random animation duration (faster = more energetic)
        const duration = 1.0 + Math.random() * 1.5;
        bubble.style.animationDuration = duration + 's';
        
        // Random size
        const size = 3 + Math.random() * 5;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        container.appendChild(bubble);
        
        // Remove after animation to prevent DOM bloat
        setTimeout(() => {
            if (container.contains(bubble)) {
                container.removeChild(bubble);
            }
        }, duration * 1000);
    }

    // --- 3. Hydrogen Color Spectrum (3D Cards) ---
    const spectrumData = [
        {
            color: "Green",
            hex: "#00ff88",
            desc: "Produced via electrolysis of water using renewable electricity. Zero carbon emissions.",
            tag: "Zero Carbon"
        },
        {
            color: "Blue",
            hex: "#00aaff",
            desc: "Produced from natural gas, but the carbon emissions are captured and stored (CCS).",
            tag: "Low Carbon"
        },
        {
            color: "Gray",
            hex: "#aaaaaa",
            desc: "Produced from natural gas without capturing carbon. Currently the most common method.",
            tag: "High Carbon"
        },
        {
            color: "Pink",
            hex: "#ff66cc",
            desc: "Produced via electrolysis powered by nuclear energy. Also known as purple or red hydrogen.",
            tag: "Zero Carbon"
        }
    ];

    const spectrumGrid = document.getElementById('spectrum-grid');

    spectrumData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'spectrum-card';
        card.innerHTML = `
            <h3 style="color: ${item.hex}">${item.color} Hydrogen</h3>
            <p>${item.desc}</p>
            <span class="tag" style="background: ${item.hex}33; color: ${item.hex}; border: 1px solid ${item.hex}">${item.tag}</span>
        `;
        spectrumGrid.appendChild(card);
        
        // 3D Hover Effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg tilt
            const rotateY = ((x - centerX) / centerX) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            card.style.boxShadow = `0 20px 40px rgba(0,0,0,0.5)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.boxShadow = `0 10px 30px rgba(0,0,0,0.3)`;
        });
    });

});

    // --- ENCYCLOPEDIA MODULES ---

    // Module 1: Isotopes
    const isoNucleus = document.getElementById('iso-nucleus');
    const btnProtium = document.getElementById('btn-protium');
    const btnDeuterium = document.getElementById('btn-deuterium');
    const btnTritium = document.getElementById('btn-tritium');

    function setIsotope(neutrons) {
        isoNucleus.innerHTML = '<div class="nucleon proton">p&#8314;</div>'; // Always 1 proton
        for(let i=0; i<neutrons; i++) {
            isoNucleus.innerHTML += '<div class="nucleon neutron">n&#8304;</div>';
        }
        
        btnProtium.classList.replace('btn-primary', 'btn-outline');
        btnDeuterium.classList.replace('btn-primary', 'btn-outline');
        btnTritium.classList.replace('btn-primary', 'btn-outline');
        
        if(neutrons === 0) btnProtium.classList.replace('btn-outline', 'btn-primary');
        if(neutrons === 1) btnDeuterium.classList.replace('btn-outline', 'btn-primary');
        if(neutrons === 2) btnTritium.classList.replace('btn-outline', 'btn-primary');
    }
    btnProtium.addEventListener('click', () => setIsotope(0));
    btnDeuterium.addEventListener('click', () => setIsotope(1));
    btnTritium.addEventListener('click', () => setIsotope(2));
    setIsotope(0); // Initial state

    // Module 2: Energy Density
    const panRight = document.getElementById('pan-right');
    const scaleBeam = document.getElementById('scale-beam');
    const btnGas = document.getElementById('btn-balance-gas');
    const btnBatt = document.getElementById('btn-balance-batt');

    function balanceScale(type) {
        panRight.innerHTML = '';
        let count = type === 'gas' ? 3 : 20; // 3 gallons gas, or 20 battery blocks
        let html = '';
        for(let i=0; i<count; i++) {
            html += type === 'gas' ? '<div class="weight gas-weight"></div>' : '<div class="weight batt-weight"></div>';
        }
        panRight.innerHTML = html;
        
        // Animate balance
        scaleBeam.style.transform = 'rotate(10deg)'; // Tip right
        document.querySelector('.pan-left').style.transform = 'translateX(-50%) translateY(-15px)';
        panRight.style.transform = 'translateX(50%) translateY(15px)';
        
        setTimeout(() => {
            // Balance out
            scaleBeam.style.transform = 'rotate(0deg)';
            document.querySelector('.pan-left').style.transform = 'translateX(-50%) translateY(0)';
            panRight.style.transform = 'translateX(50%) translateY(0)';
        }, 600);
        
        btnGas.classList.replace('btn-primary', 'btn-outline');
        btnBatt.classList.replace('btn-primary', 'btn-outline');
        if(type === 'gas') btnGas.classList.replace('btn-outline', 'btn-primary');
        if(type === 'batt') btnBatt.classList.replace('btn-outline', 'btn-primary');
    }
    btnGas.addEventListener('click', () => balanceScale('gas'));
    btnBatt.addEventListener('click', () => balanceScale('batt'));

    // Module 3: Fuel Cell
    const btnFcev = document.getElementById('btn-drive-fcev');
    const simFcev = document.getElementById('sim-fcev');
    let fcevActive = false;

    btnFcev.addEventListener('click', () => {
        fcevActive = !fcevActive;
        if(fcevActive) {
            simFcev.classList.add('fcev-active');
            btnFcev.innerText = 'Stop Engine';
            btnFcev.classList.replace('btn-primary', 'btn-secondary');
        } else {
            simFcev.classList.remove('fcev-active');
            btnFcev.innerText = 'Inject Fuel (Drive)';
            btnFcev.classList.replace('btn-secondary', 'btn-primary');
        }
    });

    // Module 4: Storage
    const sliderPressure = document.getElementById('slider-pressure');
    const pressureReadout = document.getElementById('pressure-readout');
    const gasVolume = document.getElementById('gas-volume');

    sliderPressure.addEventListener('input', (e) => {
        const val = e.target.value;
        pressureReadout.innerText = val + ' Bar';
        
        // Scale down as pressure goes up (Boyles Law approximation for visual)
        // 1 bar = scale(1). 700 bar = scale(0.2)
        const scale = Math.max(0.2, 1 - (val / 800));
        gasVolume.style.transform = 'scale(' + scale + ')';
        
        // Color gets denser
        const opacity = Math.min(1.0, 0.2 + (val / 700));
        gasVolume.style.background = 'rgba(0, 240, 255, ' + opacity + ')';
        gasVolume.style.color = val > 300 ? '#000' : '#00f0ff';
    });


    // Module 5: Gas Leak
    const btnPropane = document.getElementById('btn-leak-propane');
    const btnH2 = document.getElementById('btn-leak-h2');
    const leakSim = document.getElementById('sim-leak');

    function triggerLeak(type) {
        leakSim.classList.remove('leak-active-propane', 'leak-active-h2');
        // Force reflow
        void leakSim.offsetWidth;
        if(type === 'propane') leakSim.classList.add('leak-active-propane');
        if(type === 'h2') leakSim.classList.add('leak-active-h2');
    }
    btnPropane.addEventListener('click', () => triggerLeak('propane'));
    btnH2.addEventListener('click', () => triggerLeak('h2'));

    // Module 6: SMR
    const toggleCcs = document.getElementById('toggle-ccs');
    const simSmr = document.getElementById('sim-smr');
    const ccsLabel = document.getElementById('ccs-label');

    toggleCcs.addEventListener('change', (e) => {
        if(e.target.checked) {
            simSmr.classList.add('ccs-active');
            ccsLabel.innerText = 'Blue H2 (Carbon Captured)';
            ccsLabel.style.color = '#44ccff';
        } else {
            simSmr.classList.remove('ccs-active');
            ccsLabel.innerText = 'Gray H2 (Venting CO2)';
            ccsLabel.style.color = '#ff6666';
        }
    });

    // Module 7: Transport
    const btnShip = document.getElementById('btn-trans-ship');
    const btnPipe = document.getElementById('btn-trans-pipe');
    const vehicle = document.getElementById('transport-vehicle');

    function animateTransport(type) {
        vehicle.style.transition = 'none';
        vehicle.style.left = '0%';
        vehicle.innerHTML = type === 'ship' ? '&#128674;' : '&#128647;';
        
        // Force reflow
        void vehicle.offsetWidth;
        
        vehicle.style.transition = type === 'ship' ? 'left 3s ease-in-out' : 'left 1s linear';
        vehicle.style.left = '100%';
    }
    btnShip.addEventListener('click', () => animateTransport('ship'));
    btnPipe.addEventListener('click', () => animateTransport('pipe'));

    // Module 8: City
    const btnCity = document.getElementById('btn-decarbonize');
    const simCity = document.getElementById('sim-city');
    let cityClean = false;

    btnCity.addEventListener('click', () => {
        cityClean = !cityClean;
        if(cityClean) {
            simCity.classList.add('city-clean');
            btnCity.innerText = 'Revert to Fossil Fuels';
            btnCity.classList.replace('btn-primary', 'btn-secondary');
        } else {
            simCity.classList.remove('city-clean');
            btnCity.innerText = 'Decarbonize City (Inject H2)';
            btnCity.classList.replace('btn-secondary', 'btn-primary');
        }
    });


    // Module 9: Embrittlement
    const btnCh4 = document.getElementById('btn-inject-ch4');
    const btnTinyH2 = document.getElementById('btn-inject-h2');
    const simBrittle = document.getElementById('sim-brittle');

    function triggerBrittle(type) {
        simBrittle.classList.remove('brittle-active-ch4', 'brittle-active-h2');
        void simBrittle.offsetWidth; // reflow
        if(type === 'ch4') simBrittle.classList.add('brittle-active-ch4');
        if(type === 'h2') simBrittle.classList.add('brittle-active-h2');
    }
    btnCh4.addEventListener('click', () => triggerBrittle('ch4'));
    btnTinyH2.addEventListener('click', () => triggerBrittle('h2'));

    // Module 10: Invisible Flame
    const btnThermal = document.getElementById('btn-toggle-thermal');
    const simFlame = document.getElementById('sim-flame');
    let thermalOn = false;

    btnThermal.addEventListener('click', () => {
        thermalOn = !thermalOn;
        if(thermalOn) {
            simFlame.classList.add('thermal-active');
            btnThermal.innerText = 'Turn Off Thermal';
            btnThermal.classList.replace('btn-primary', 'btn-secondary');
        } else {
            simFlame.classList.remove('thermal-active');
            btnThermal.innerText = 'Toggle Thermal Camera';
            btnThermal.classList.replace('btn-secondary', 'btn-primary');
        }
    });

    // Module 11: Thermal Conductivity
    const btnCoolAir = document.getElementById('btn-cool-air');
    const btnCoolH2 = document.getElementById('btn-cool-h2');
    const genCore = document.getElementById('gen-core');
    const genMercury = document.getElementById('gen-mercury');

    function triggerCooling(type) {
        // Reset
        genCore.style.transition = 'none';
        genMercury.style.transition = 'none';
        genCore.style.background = 'radial-gradient(circle, #ff3333, #aa0000)';
        genCore.style.boxShadow = '0 0 20px #ff0000';
        genCore.innerHTML = '1000&#176;C';
        genMercury.style.height = '100%';
        void genCore.offsetWidth; // reflow
        
        // Animate
        const duration = type === 'air' ? '10s' : '1s';
        genCore.style.transition = 'background ' + duration + ', box-shadow ' + duration;
        genMercury.style.transition = 'height ' + duration;
        
        genCore.style.background = 'radial-gradient(circle, #33ccff, #005588)';
        genCore.style.boxShadow = '0 0 10px #33ccff';
        genCore.innerHTML = '40&#176;C';
        genMercury.style.height = '20%';
    }
    btnCoolAir.addEventListener('click', () => triggerCooling('air'));
    btnCoolH2.addEventListener('click', () => triggerCooling('h2'));

    // Module 12: Spin States
    const btnCatalyst = document.getElementById('btn-catalyst');
    const simSpin = document.getElementById('sim-spin');
    const spinStatus = document.getElementById('spin-status');
    let isPara = false;

    btnCatalyst.addEventListener('click', () => {
        isPara = !isPara;
        if(isPara) {
            simSpin.classList.add('para-state');
            spinStatus.innerText = 'State: Para (Stable Liquid)';
            spinStatus.style.color = '#00f0ff';
            btnCatalyst.innerText = 'Remove Catalyst';
            btnCatalyst.classList.replace('btn-primary', 'btn-secondary');
        } else {
            simSpin.classList.remove('para-state');
            spinStatus.innerText = 'State: Ortho (Heat Generating)';
            spinStatus.style.color = '#ff6666';
            btnCatalyst.innerText = 'Inject Catalyst (Para State)';
            btnCatalyst.classList.replace('btn-secondary', 'btn-primary');
        }
    });


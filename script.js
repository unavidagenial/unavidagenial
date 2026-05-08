// =============================================
// 1. EFECTO LINTERNA suavizado
// =============================================
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;

document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
});

function animateFlashlight() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    document.body.style.setProperty('--cursor-x', Math.round(currentX) + 'px');
    document.body.style.setProperty('--cursor-y', Math.round(currentY) + 'px');
    requestAnimationFrame(animateFlashlight);
}
animateFlashlight();


// =============================================
// 2. PARTÍCULAS (gestión de inicio/parada)
// =============================================
function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return { stop: () => {} };

    const ctx = canvas.getContext('2d');
    const particles = [];
    const COUNT = 60;
    let animId;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(true); }

        reset(random = false) {
            this.x    = Math.random() * canvas.width;
            this.y    = random ? Math.random() * canvas.height : canvas.height + 10;
            this.size = Math.random() * 1.8 + 0.3;
            this.speedY = -(Math.random() * 0.5 + 0.2);
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.6 + 0.1;
            this.life    = 0;
            this.maxLife = Math.random() * 200 + 100;
            this.color   = Math.random() > 0.8 ? '#ff3e3e' : '#00ff88';
        }

        update() {
            this.y    += this.speedY;
            this.x    += this.speedX;
            this.life += 1;
            this.opacity = Math.sin((this.life / this.maxLife) * Math.PI) * 0.5 + 0.1;
            if (this.life >= this.maxLife || this.y < -10) this.reset();
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.shadowColor = this.color;
            ctx.shadowBlur  = 6;
            ctx.fillStyle   = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(loop);
    }
    loop();

    return {
        stop: () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        }
    };
}

// Iniciar partículas del login (guardamos para detenerlas después)
const loginParticles = initParticles('login-particles');


// =============================================
// 3. MATRIX RAIN (optimizada con requestAnimationFrame)
// =============================================
function initMatrixRain(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: absolute; inset: 0; width: 100%; height: 100%;
        pointer-events: none; opacity: 0.07; z-index: 0;
    `;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]<>?/\\|~`';
    const fontSize = 13;
    let cols, drops;
    let lastTimestamp = 0;
    const interval = 45; // ms (~22 fps)

    function resize() {
        canvas.width  = container.offsetWidth;
        canvas.height = container.offsetHeight;
        cols  = Math.floor(canvas.width / fontSize);
        drops = Array(cols).fill(1).map(() => Math.random() * -50);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        ctx.fillStyle = 'rgba(5, 5, 8, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff88';
        ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i] += 0.5;
        }
    }

    function animate(timestamp) {
        requestAnimationFrame(animate);
        if (timestamp - lastTimestamp >= interval) {
            lastTimestamp = timestamp;
            draw();
        }
    }
    requestAnimationFrame(animate);
}


// =============================================
// 4. VALIDACIÓN DE LOGIN
// =============================================
function validarLogin() {
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value.trim();
    const card = document.querySelector('.login-card');

    if (u === 'admin' && p === '1234') {
        card.style.boxShadow = '0 0 60px #00ff88, inset 0 0 30px rgba(0,255,136,0.1)';
        card.style.transition = 'all 0.3s';

        setTimeout(() => {
            // Detener partículas del login
            loginParticles.stop();

            document.getElementById('login-screen').style.display = 'none';
            const main = document.getElementById('main-content');
            main.style.display = 'block';

            // Iniciar partículas del main y lluvia Matrix
            initParticles('bg-particles');
            const heroSection = document.getElementById('inicio');
            if (heroSection) initMatrixRain(heroSection);
        }, 400);

    } else {
        card.classList.add('shake');
        card.style.borderColor = '#ff3e3e';
        card.style.boxShadow = '0 0 30px #ff3e3e, inset 0 0 20px rgba(255,62,62,0.1)';
        setTimeout(() => {
            card.classList.remove('shake');
            card.style.borderColor = '';
            card.style.boxShadow = '';
        }, 600);

        const hint = document.querySelector('.login-hint');
        hint.style.color = '#ff3e3e';
        hint.textContent = '// ACCESO DENEGADO — credenciales inválidas';
        setTimeout(() => {
            hint.style.color = '';
            hint.textContent = 'admin / 1234';
        }, 2000);
    }
}

// Animación shake inyectada
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0) scale(1); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
    20%, 40%, 60%, 80%      { transform: translateX(8px); }
}
.shake { animation: shake 0.5s ease; }
`;
document.head.appendChild(shakeStyle);

// Enter para login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') {
        validarLogin();
    }
});


// =============================================
// 5. ACTUALIZAR NOMBRE EN TIEMPO REAL
// =============================================
function actualizarNombre() {
    const val  = document.getElementById('input-name').value;
    const name = document.getElementById('brand-name');
    const text = val || 'Sergio G. Villalobo';
    name.innerText = text;
    name.dataset.text = text;   // sincroniza el glitch
}


// =============================================
// 6. MENÚ DESPLEGABLE
// =============================================
function toggleInfo() {
    const content = document.getElementById('info-extra');
    const arrow   = document.querySelector('.arrow-icon');
    const isOpen  = content.style.display === 'block';

    if (isOpen) {
        content.style.animation = 'none';
        content.style.display   = 'none';
        arrow.classList.remove('open');
    } else {
        content.style.display   = 'block';
        content.style.animation = 'slideDown 0.4s ease forwards';
        arrow.classList.add('open');
    }
}


// =============================================
// 7. CAMBIAR AVATAR
// =============================================
function cambiarImagen() {
    const img  = document.getElementById('profile-img');
    const seed = Math.floor(Math.random() * 9999);

    img.style.transition = 'opacity 0.3s, filter 0.3s';
    img.style.opacity    = '0';
    img.style.filter     = 'brightness(3)';

    setTimeout(() => {
        img.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
        img.style.opacity = '1';
        img.style.filter  = '';
    }, 300);
}


// =============================================
// 8. TOGGLE LINTERNA (mediante clase en body)
// =============================================
function toggleLinterna() {
    document.body.classList.toggle('flashlight-off');
    const btn = document.getElementById('btn-linterna');

    if (document.body.classList.contains('flashlight-off')) {
        btn.textContent = '🔦 LINTERNA';
        btn.classList.add('active');
    } else {
        btn.textContent = '💡 ILUMINAR';
        btn.classList.remove('active');
    }
}


// =============================================
// 9. CAMBIAR MODO (oscuro/claro)
// =============================================
function cambiarModo() {
    document.body.classList.toggle('light-theme');
}


// =============================================
// 10. MODIFICAR COLOR ACENTO
// =============================================
const accentColors = [
    { color: '#00ff88', glow: '0 0 8px #00ff88, 0 0 20px #00ff8855' },
    { color: '#ff3e3e', glow: '0 0 8px #ff3e3e, 0 0 20px #ff3e3e55' },
    { color: '#ff9a00', glow: '0 0 8px #ff9a00, 0 0 20px #ff9a0055' },
    { color: '#b300ff', glow: '0 0 8px #b300ff, 0 0 20px #b300ff55' },
    { color: '#00eeff', glow: '0 0 8px #00eeff, 0 0 20px #00eeff55' },
];
let accentIndex = 0;

function modificarDOM() {
    accentIndex = (accentIndex + 1) % accentColors.length;
    const { color } = accentColors[accentIndex];
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--border', color);
    document.documentElement.style.setProperty('--text', color);
    document.documentElement.style.setProperty(
        '--glow',
        `0 0 8px ${color}, 0 0 20px ${color}55, 0 0 40px ${color}22`
    );
}


// =============================================
// 11. AGREGAR PROYECTOS DINÁMICOS
// =============================================
function agregarElemento() {
    const input = document.getElementById('new-task');
    const val   = input.value.trim();
    if (!val) return;

    const li = document.createElement('li');
    li.innerHTML = `
        <span>⚡ ${val}</span>
        <button onclick="this.parentElement.style.animation='itemExit 0.3s ease forwards'; setTimeout(()=>this.parentElement.remove(),280)">✕ ELIMINAR</button>
    `;

    // Inyectar keyframe de salida si no existe
    if (!document.getElementById('item-exit-style')) {
        const s = document.createElement('style');
        s.id = 'item-exit-style';
        s.textContent = `
        @keyframes itemExit {
            from { opacity:1; transform: translateX(0); }
            to   { opacity:0; transform: translateX(30px); }
        }`;
        document.head.appendChild(s);
    }

    document.getElementById('dynamic-list').appendChild(li);
    input.value = '';
    input.focus();
}

// Enter para agregar elemento
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement?.id === 'new-task') {
        agregarElemento();
    }
});


// =============================================
// 12. VALIDAR FORMULARIO DE CONTACTO
// =============================================
function validarForm(event) {
    event.preventDefault();
    const feedbackEl = document.getElementById('feedback-msg');
    const message    = '// SISTEMA: Mensaje enviado con éxito. Contactaremos con su negocio pronto.';

    feedbackEl.style.display = 'block';
    feedbackEl.innerText     = '';

    let i = 0;
    function typeChar() {
        if (i < message.length) {
            feedbackEl.innerText += message[i];
            i++;
            setTimeout(typeChar, 28);
        }
    }
    typeChar();

    document.getElementById('contact-form').reset();

    setTimeout(() => {
        feedbackEl.style.animation = 'none';
        feedbackEl.style.opacity   = '0';
        feedbackEl.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            feedbackEl.style.display = 'none';
            feedbackEl.style.opacity = '1';
        }, 500);
    }, 6000);
}

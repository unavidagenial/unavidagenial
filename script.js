// =============================================
// 1. EFECTO LINTERNA — sigue el cursor con suavidad
//    Ahora con interpolación para movimiento más fluido
// =============================================
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;

document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
});

// Animación de suavizado (lerp) para la linterna
function animateFlashlight() {
    // Interpolación lineal: sigue al cursor con pequeño delay
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    document.body.style.setProperty('--cursor-x', Math.round(currentX) + 'px');
    document.body.style.setProperty('--cursor-y', Math.round(currentY) + 'px');
    requestAnimationFrame(animateFlashlight);
}
animateFlashlight();


// =============================================
// 2. PARTÍCULAS — Canvas de fondo del main
//    Simula chispas/polvo flotante Halloween
// =============================================
function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const COUNT = 60;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Clase partícula — punto brillante flotando
    class Particle {
        constructor() { this.reset(true); }

        reset(random = false) {
            this.x    = Math.random() * canvas.width;
            this.y    = random ? Math.random() * canvas.height : canvas.height + 10;
            this.size = Math.random() * 1.8 + 0.3;
            this.speedY = -(Math.random() * 0.5 + 0.2);  // sube despacio
            this.speedX = (Math.random() - 0.5) * 0.4;   // deriva lateral
            this.opacity = Math.random() * 0.6 + 0.1;
            this.life    = 0;
            this.maxLife = Math.random() * 200 + 100;
            // Color: verde accent o rojo para variedad Halloween
            this.color   = Math.random() > 0.8 ? '#ff3e3e' : '#00ff88';
        }

        update() {
            this.y    += this.speedY;
            this.x    += this.speedX;
            this.life += 1;
            // Parpadeo suave
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
        requestAnimationFrame(loop);
    }
    loop();
}

// Iniciar partículas al cargar login y main
initParticles('login-particles');


// =============================================
// 3. MATRIX RAIN — lluvia de caracteres en el hero
//    Canvas de código cayendo, efecto semitransparente
// =============================================
function initMatrixRain(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: absolute; inset: 0; width: 100%; height: 100%;
        pointer-events: none; opacity: 0.07; z-index: 0;
    `;
    container.appendChild(canvas);

    const ctx   = canvas.getContext('2d');
    const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]<>?/\\|~`';
    const fontSize = 13;
    let cols, drops;

    function resize() {
        canvas.width  = container.offsetWidth;
        canvas.height = container.offsetHeight;
        cols  = Math.floor(canvas.width / fontSize);
        drops = Array(cols).fill(1).map(() => Math.random() * -50);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        // Rastro desvanecido (trail effect)
        ctx.fillStyle = 'rgba(5, 5, 8, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff88';
        ctx.font      = `${fontSize}px 'Share Tech Mono', monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            // Reinicia la columna aleatoriamente al llegar al final
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i] += 0.5;
        }
    }

    setInterval(draw, 50);
}


// =============================================
// 4. VALIDACIÓN DE LOGIN
//    Con animación de sacudida en error
// =============================================
function validarLogin() {
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value.trim();
    const card = document.querySelector('.login-card');

    if (u === "admin" && p === "1234") {
        // Efecto de flash verde en éxito
        card.style.boxShadow = '0 0 60px #00ff88, inset 0 0 30px rgba(0,255,136,0.1)';
        card.style.transition = 'all 0.3s';

        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            const main = document.getElementById('main-content');
            main.style.display = 'block';
            // Iniciar partículas del main y matrix rain
            initParticles('bg-particles');
            const heroSection = document.getElementById('inicio');
            if (heroSection) initMatrixRain(heroSection);
        }, 400);

    } else {
        // Animación de sacudida en error
        card.classList.add('shake');
        card.style.borderColor = '#ff3e3e';
        card.style.boxShadow   = '0 0 30px #ff3e3e, inset 0 0 20px rgba(255,62,62,0.1)';
        setTimeout(() => {
            card.classList.remove('shake');
            card.style.borderColor = '';
            card.style.boxShadow   = '';
        }, 600);

        // Mensaje sin alert nativo — más elegante
        const hint = document.querySelector('.login-hint');
        hint.style.color   = '#ff3e3e';
        hint.textContent   = '// ACCESO DENEGADO — credenciales inválidas';
        setTimeout(() => {
            hint.style.color  = '';
            hint.textContent  = 'admin / 1234';
        }, 2000);
    }
}

// Animación CSS de sacudida inyectada dinámicamente
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

// Enter para hacer login
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') {
        validarLogin();
    }
});


// =============================================
// 5. ACTUALIZAR NOMBRE EN TIEMPO REAL
//    Actualiza tanto el brand-name como su data-text (para el glitch)
// =============================================
function actualizarNombre() {
    const val  = document.getElementById('input-name').value;
    const name = document.getElementById('brand-name');
    const text = val || "Sergio Gomez Portafolio";
    name.innerText        = text;
    name.dataset.text     = text;  // sincroniza el pseudo-elemento ::before y ::after del glitch
}


// =============================================
// 6. MENÚ DESPLEGABLE con transición del ícono
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
// 7. CAMBIAR AVATAR — con animación de transición
// =============================================
function cambiarImagen() {
    const img  = document.getElementById('profile-img');
    const seed = Math.floor(Math.random() * 9999);

    // Fade out → cambia src → fade in
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
// 8b. TOGGLE LINTERNA — ilumina/apaga toda la página
//     Desactiva el overlay oscuro del flashlight
// =============================================
let linternaActiva = true; // arranca con linterna (oscuro)

function toggleLinterna() {
    linternaActiva = !linternaActiva;
    const fl  = document.getElementById('flashlight');
    const btn = document.getElementById('btn-linterna');

    if (!linternaActiva) {
        // ILUMINADO: quita el overlay oscuro completamente
        fl.style.transition = 'opacity 0.6s ease';
        fl.style.opacity    = '0';
        fl.style.pointerEvents = 'none';
        btn.textContent = '🔦 LINTERNA';
        btn.classList.add('active');
    } else {
        // LINTERNA: restaura el efecto oscuro
        fl.style.opacity    = '1';
        btn.textContent = '💡 ILUMINAR';
        btn.classList.remove('active');
    }
}


function cambiarModo() {
    document.body.classList.toggle('light-theme');
    // Actualizar placeholders en modo claro
    const isDark = !document.body.classList.contains('light-theme');
    document.documentElement.style.setProperty(
        '--flashlight-opacity', isDark ? '0.97' : '0.5'
    );
}


// =============================================
// 9. MODIFICAR COLOR ACENTO DEL DOM
//    Cicla entre paleta de colores Halloween
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
// 10. AGREGAR/ELIMINAR PROYECTOS DINÁMICOS
//     Con efecto de entrada animado por CSS
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
    input.value = "";
    input.focus();
}

// Enter para agregar elemento
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement?.id === 'new-task') {
        agregarElemento();
    }
});


// =============================================
// 11. VALIDAR FORMULARIO DE CONTACTO
//     Con efecto de tipeo en el mensaje de éxito
// =============================================
function validarForm(event) {
    event.preventDefault();
    const feedbackEl = document.getElementById('feedback-msg');
    const message    = "// SISTEMA: Mensaje enviado con éxito. Contactaremos con su negocio pronto.";

    feedbackEl.style.display = 'block';
    feedbackEl.innerText     = '';

    // Efecto typewriter en el mensaje de feedback
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

    // Ocultar el mensaje después de 6 segundos
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

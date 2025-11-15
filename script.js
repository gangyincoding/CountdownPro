// 全局变量
let countdownInterval;
let targetDateTime;
let currentTheme = 'blue';
let currentBgStyle = 'gradient';

// DOM 元素
const settingsPanel = document.getElementById('settingsPanel');
const countdownDisplay = document.getElementById('countdownDisplay');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const eventTitleInput = document.getElementById('eventTitle');
const targetDateInput = document.getElementById('targetDate');
const targetTimeInput = document.getElementById('targetTime');
const endMessageInput = document.getElementById('endMessage');
const bgStyleSelect = document.getElementById('bgStyle');
const displayTitle = document.getElementById('displayTitle');
const endMessageDisplay = document.getElementById('endMessageDisplay');
const particlesCanvas = document.getElementById('particlesCanvas');
const wavesContainer = document.getElementById('wavesContainer');

// 时间显示元素
const timeElements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    daysBack: document.getElementById('days-back'),
    hoursBack: document.getElementById('hours-back'),
    minutesBack: document.getElementById('minutes-back'),
    secondsBack: document.getElementById('seconds-back')
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    targetDateInput.value = tomorrow.toISOString().split('T')[0];

    // 主题选择
    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTheme = btn.dataset.theme;
            document.body.setAttribute('data-theme', currentTheme);
            updateTheme();
        });
    });

    // 默认选中第一个主题
    colorBtns[0].classList.add('active');

    // 背景样式选择
    bgStyleSelect.addEventListener('change', (e) => {
        currentBgStyle = e.target.value;
        updateBackground();
    });

    // 开始倒计时
    startBtn.addEventListener('click', startCountdown);

    // 返回设置
    backBtn.addEventListener('click', backToSettings);

    // 初始化背景
    updateBackground();
});

// 更新主题
function updateTheme() {
    const root = document.documentElement;
    const themes = {
        blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        purple: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    };

    root.style.setProperty('--primary-gradient', themes[currentTheme]);
    document.querySelector('.container').style.background = themes[currentTheme];
}

// 更新背景
function updateBackground() {
    particlesCanvas.style.display = 'none';
    wavesContainer.style.display = 'none';

    switch (currentBgStyle) {
        case 'gradient':
            // 仅显示渐变背景
            break;
        case 'particles':
            particlesCanvas.style.display = 'block';
            initParticles();
            break;
        case 'waves':
            wavesContainer.style.display = 'block';
            break;
    }
}

// 粒子动画
function initParticles() {
    const canvas = particlesCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // 绘制连接线
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 开始倒计时
function startCountdown() {
    const eventTitle = eventTitleInput.value || '活动开始';
    const targetDate = targetDateInput.value;
    const targetTime = targetTimeInput.value;
    const endMessage = endMessageInput.value || '🎉 活动已开始！';

    if (!targetDate) {
        alert('请选择目标日期！');
        return;
    }

    // 组合日期和时间
    targetDateTime = new Date(`${targetDate}T${targetTime}`);

    // 检查日期是否有效
    if (targetDateTime <= new Date()) {
        alert('目标时间必须在未来！');
        return;
    }

    // 显示倒计时界面
    settingsPanel.style.display = 'none';
    countdownDisplay.style.display = 'block';
    displayTitle.textContent = eventTitle;

    // 清除之前的倒计时
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // 初始更新
    updateCountdown(endMessage);

    // 每秒更新倒计时
    countdownInterval = setInterval(() => {
        updateCountdown(endMessage);
    }, 1000);
}

// 更新倒计时
function updateCountdown(endMessage) {
    const now = new Date().getTime();
    const distance = targetDateTime - now;

    if (distance < 0) {
        // 倒计时结束
        clearInterval(countdownInterval);
        document.querySelector('.countdown-container').style.display = 'none';
        endMessageDisplay.textContent = endMessage;
        endMessageDisplay.style.display = 'block';

        // 触发烟花效果
        createFireworks();
        return;
    }

    // 计算时间
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // 格式化数字
    const formattedTime = {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
    };

    // 更新显示并添加翻转动画
    updateTimeWithFlip('days', formattedTime.days);
    updateTimeWithFlip('hours', formattedTime.hours);
    updateTimeWithFlip('minutes', formattedTime.minutes);
    updateTimeWithFlip('seconds', formattedTime.seconds);
}

// 带翻转动画的时间更新
function updateTimeWithFlip(unit, newValue) {
    const element = timeElements[unit];
    const backElement = timeElements[`${unit}Back`];
    const currentValue = element.textContent;

    if (currentValue !== newValue) {
        // 设置背面的值
        backElement.textContent = newValue;

        // 触发翻转动画
        const flipCard = element.closest('.flip-card');
        flipCard.classList.add('flip');

        setTimeout(() => {
            // 更新正面的值
            element.textContent = newValue;
            // 移除翻转类
            flipCard.classList.remove('flip');
        }, 300);
    }
}

// 创建烟花效果
function createFireworks() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '100';
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const fireworks = [];
    const particles = [];

    class Firework {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetY = Math.random() * canvas.height * 0.5;
            this.speed = 5;
            this.hue = Math.random() * 360;
        }

        update() {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
                return false;
            }
            return true;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
            ctx.fill();
        }

        explode() {
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(this.x, this.y, this.hue));
            }
        }
    }

    class Particle {
        constructor(x, y, hue) {
            this.x = x;
            this.y = y;
            this.hue = hue;
            this.speed = Math.random() * 5 + 1;
            this.angle = Math.random() * Math.PI * 2;
            this.friction = 0.95;
            this.gravity = 0.3;
            this.opacity = 1;
            this.decay = Math.random() * 0.03 + 0.01;
        }

        update() {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.opacity -= this.decay;
            return this.opacity > 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.1) {
            fireworks.push(new Firework());
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
            if (!fireworks[i].update()) {
                fireworks.splice(i, 1);
            } else {
                fireworks[i].draw();
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            if (!particles[i].update()) {
                particles.splice(i, 1);
            } else {
                particles[i].draw();
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // 10秒后移除烟花画布
    setTimeout(() => {
        canvas.remove();
    }, 10000);
}

// 返回设置
function backToSettings() {
    clearInterval(countdownInterval);
    countdownDisplay.style.display = 'none';
    settingsPanel.style.display = 'block';
    endMessageDisplay.style.display = 'none';
    document.querySelector('.countdown-container').style.display = 'flex';
}

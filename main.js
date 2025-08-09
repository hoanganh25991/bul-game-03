// Game state và cấu hình
const gameState = {
    player: {
        x: 300,
        y: 200,
        level: 1,
        hp: 100,
        maxHp: 100,
        xp: 0,
        maxXp: 100,
        gold: 0,
        attack: 20,
        defense: 5,
        isAttacking: false,
        attackTimer: 0
    },
    enemies: [],
    energyBalls: [], // Danh sách quả cầu năng lượng
    inBattle: false,
    currentEnemy: null,
    gameLog: [],
    // Hệ thống wave
    wave: {
        current: 1,
        enemiesPerWave: 5,
        enemiesKilled: 0,
        isSpawning: false,
        spawnTimer: 0,
        spawnEffects: [] // Hiệu ứng spawn
    }
};

// Các loại quái vật
const enemyTypes = [
    {
        name: "👹 Yêu tinh",
        hp: 50,
        attack: 15,
        defense: 2,
        xpReward: 25,
        goldReward: 10,
        color: "#ff6b6b"
    },
    {
        name: "🐺 Sói hoang",
        hp: 40,
        attack: 18,
        defense: 1,
        xpReward: 20,
        goldReward: 8,
        color: "#4ecdc4"
    },
    {
        name: "🧟‍♂️ Thây ma",
        hp: 70,
        attack: 12,
        defense: 4,
        xpReward: 35,
        goldReward: 15,
        color: "#45b7d1"
    },
    {
        name: "🐉 Rồng nhỏ",
        hp: 120,
        attack: 25,
        defense: 8,
        xpReward: 80,
        goldReward: 50,
        color: "#f39c12"
    }
];

// Canvas và context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Khởi tạo game
function initGame() {
    updateUI();
    gameLoop();
    setupEventListeners();
    addToLog("Chào mừng bạn đến với Hành Trình Anh Hùng!");
    addToLog("Di chuyển bằng WASD hoặc phím mũi tên.");
    addToLog("Nhấn SPACE để tấn công quái vật gần bạn.");
    
    // Bắt đầu wave đầu tiên sau 2 giây
    setTimeout(() => {
        startNewWave();
    }, 2000);
}

// Hệ thống spawn wave mới
function startNewWave() {
    gameState.wave.isSpawning = true;
    gameState.wave.spawnTimer = 0;
    gameState.wave.enemiesKilled = 0;
    
    addToLog(`🌊 WAVE ${gameState.wave.current} BẮT ĐẦU! (${gameState.wave.enemiesPerWave} quái vật)`);
    
    // Tạo hiệu ứng cảnh báo
    for (let i = 0; i < gameState.wave.enemiesPerWave; i++) {
        setTimeout(() => {
            spawnSingleEnemy();
        }, i * 800); // Spawn mỗi 0.8 giây
    }
}

function spawnSingleEnemy() {
    // Tạo hiệu ứng spawn trước
    const spawnX = Math.random() * (canvas.width - 100) + 50;
    const spawnY = Math.random() * (canvas.height - 100) + 50;
    
    // Đảm bảo không spawn quá gần player
    const distanceToPlayer = Math.sqrt(
        Math.pow(spawnX - gameState.player.x, 2) + 
        Math.pow(spawnY - gameState.player.y, 2)
    );
    
    if (distanceToPlayer < 100) {
        // Thử lại với vị trí khác
        setTimeout(spawnSingleEnemy, 100);
        return;
    }
    
    // Tạo hiệu ứng spawn
    const spawnEffect = {
        x: spawnX,
        y: spawnY,
        timer: 60, // 1 giây
        maxTimer: 60,
        particles: []
    };
    
    // Tạo particles cho hiệu ứng
    for (let i = 0; i < 12; i++) {
        spawnEffect.particles.push({
            angle: (i * Math.PI * 2) / 12,
            radius: 0,
            speed: 2,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }
    
    gameState.wave.spawnEffects.push(spawnEffect);
    
    // Spawn quái vật sau hiệu ứng
    setTimeout(() => {
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemy = {
            ...enemyType,
            x: spawnX,
            y: spawnY,
            maxHp: enemyType.hp + (gameState.wave.current - 1) * 10, // Tăng HP theo wave
            hp: enemyType.hp + (gameState.wave.current - 1) * 10,
            attack: enemyType.attack + Math.floor((gameState.wave.current - 1) * 2), // Tăng attack
            id: Date.now() + Math.random(),
            justSpawned: true,
            spawnTimer: 30 // Hiệu ứng spawn 0.5 giây
        };
        
        gameState.enemies.push(enemy);
        addToLog(`${enemy.name} xuất hiện!`);
    }, 1000); // 1 giây sau hiệu ứng
}

function checkWaveComplete() {
    if (gameState.wave.enemiesKilled >= gameState.wave.enemiesPerWave && gameState.enemies.length === 0) {
        // Wave hoàn thành!
        gameState.wave.current++;
        gameState.wave.enemiesPerWave = Math.min(8, 5 + Math.floor(gameState.wave.current / 2)); // Tối đa 8 quái/wave
        
        addToLog(`🎉 WAVE ${gameState.wave.current - 1} HOÀN THÀNH!`);
        addToLog(`💰 Bonus: +${gameState.wave.current * 50} vàng, +${gameState.wave.current * 25} XP`);
        
        // Thưởng wave
        gameState.player.gold += gameState.wave.current * 50;
        gameState.player.xp += gameState.wave.current * 25;
        
        updateUI();
        checkLevelUp();
        
        // Bắt đầu wave mới sau 3 giây
        setTimeout(() => {
            startNewWave();
        }, 3000);
    }
}

// Vòng lặp game chính
function gameLoop() {
    if (!gameState.inBattle) {
        updatePlayerPosition();
        updateEnergyBalls();
        updateSpawnEffects();
        
        clearCanvas();
        drawPlayer();
        drawEnemies();
        drawEnergyBalls();
        drawSpawnEffects();
        drawUI();
    }
    requestAnimationFrame(gameLoop);
}

// Xóa canvas
function clearCanvas() {
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ lưới nền
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Vẽ người chơi
function drawPlayer() {
    const player = gameState.player;
    
    // Vẽ bóng
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + 15, 12, 6, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Vẽ gậy phép nếu đang tấn công
    if (player.isAttacking) {
        // Thân gậy
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(player.x + 20, player.y - 10);
        ctx.lineTo(player.x + 20, player.y + 20);
        ctx.stroke();
        
        // Đầu gậy phép (hình kim cương)
        ctx.fillStyle = '#9932CC';
        ctx.beginPath();
        ctx.moveTo(player.x + 20, player.y - 20);
        ctx.lineTo(player.x + 15, player.y - 10);
        ctx.lineTo(player.x + 20, player.y - 5);
        ctx.lineTo(player.x + 25, player.y - 10);
        ctx.closePath();
        ctx.fill();
        
        // Quả cầu năng lượng chính (lớn)
        const energyX = player.x + 20;
        const energyY = player.y - 12;
        const time = Date.now() * 0.01; // Tạo hiệu ứng động
        
        // Lớp ngoài - ánh sáng mờ
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(energyX, energyY, 12 + Math.sin(time) * 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Lớp giữa - năng lượng chính
        ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(energyX, energyY, 8 + Math.sin(time * 1.5) * 1, 0, 2 * Math.PI);
        ctx.fill();
        
        // Lõi năng lượng - sáng nhất
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(energyX, energyY, 4 + Math.sin(time * 2) * 0.5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Tia sáng xung quanh quả cầu
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4 + time * 0.5;
            const startX = energyX + Math.cos(angle) * 6;
            const startY = energyY + Math.sin(angle) * 6;
            const endX = energyX + Math.cos(angle) * (18 + Math.sin(time + i) * 3);
            const endY = energyY + Math.sin(angle) * (18 + Math.sin(time + i) * 3);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Các hạt năng lượng nhỏ bay xung quanh
        for (let i = 0; i < 6; i++) {
            const particleAngle = time * 2 + (i * Math.PI) / 3;
            const particleRadius = 25 + Math.sin(time + i) * 5;
            const particleX = energyX + Math.cos(particleAngle) * particleRadius;
            const particleY = energyY + Math.sin(particleAngle) * particleRadius;
            
            ctx.fillStyle = `rgba(0, 255, 255, ${0.8 - (i * 0.1)})`;
            ctx.beginPath();
            ctx.arc(particleX, particleY, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    // Vẽ người chơi
    ctx.fillStyle = '#4299e1';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Vẽ mắt
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x - 5, player.y - 3, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 5, player.y - 3, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x - 5, player.y - 3, 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 5, player.y - 3, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Vẽ thanh máu
    const barWidth = 30;
    const barHeight = 4;
    const hpPercent = player.hp / player.maxHp;
    
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x - barWidth/2, player.y - 25, barWidth, barHeight);
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x - barWidth/2, player.y - 25, barWidth * hpPercent, barHeight);
    
    // Viền thanh máu
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(player.x - barWidth/2, player.y - 25, barWidth, barHeight);
}

// Vẽ quái vật
function drawEnemies() {
    gameState.enemies.forEach(enemy => {
        // Cập nhật timer hit
        if (enemy.hitTimer > 0) {
            enemy.hitTimer--;
            if (enemy.hitTimer <= 0) {
                enemy.hit = false;
            }
        }
        
        // Cập nhật timer spawn
        if (enemy.spawnTimer > 0) {
            enemy.spawnTimer--;
            if (enemy.spawnTimer <= 0) {
                enemy.justSpawned = false;
            }
        }
        
        // Hiệu ứng spawn
        if (enemy.justSpawned) {
            const spawnProgress = 1 - (enemy.spawnTimer / 30);
            const glowRadius = 20 * spawnProgress;
            
            // Ánh sáng spawn
            ctx.fillStyle = `rgba(255, 255, 0, ${0.3 * (1 - spawnProgress)})`;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, glowRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Vẽ bóng
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y + 12, 10, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Vẽ quái vật (đỏ hơn khi bị hit, sáng hơn khi mới spawn)
        let enemyColor = enemy.color;
        if (enemy.hit) {
            enemyColor = '#ff4444';
        } else if (enemy.justSpawned) {
            enemyColor = '#ffff88';
        }
        
        ctx.fillStyle = enemyColor;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Vẽ mắt đỏ
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(enemy.x - 4, enemy.y - 2, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x + 4, enemy.y - 2, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Vẽ thanh máu
        const barWidth = 24;
        const barHeight = 3;
        const hpPercent = enemy.hp / enemy.maxHp;
        
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - 20, barWidth, barHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x - barWidth/2, enemy.y - 20, barWidth * hpPercent, barHeight);
        
        // Viền thanh máu
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x - barWidth/2, enemy.y - 20, barWidth, barHeight);
    });
}

// Vẽ quả cầu năng lượng
function drawEnergyBalls() {
    gameState.energyBalls.forEach(ball => {
        // Vẽ đuôi sáng
        for (let i = 0; i < ball.trail.length; i++) {
            const alpha = (i + 1) / ball.trail.length * 0.5;
            const size = (i + 1) / ball.trail.length * ball.size;
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(ball.trail[i].x, ball.trail[i].y, size, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Vẽ quả cầu chính
        const time = Date.now() * 0.02;
        
        // Lớp ngoài
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size + Math.sin(time) * 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Lớp giữa
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size * 0.7, 0, 2 * Math.PI);
        ctx.fill();
        
        // Lõi
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size * 0.3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Tia sáng xung quanh
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + time;
            const startX = ball.x + Math.cos(angle) * ball.size;
            const startY = ball.y + Math.sin(angle) * ball.size;
            const endX = ball.x + Math.cos(angle) * (ball.size + 8);
            const endY = ball.y + Math.sin(angle) * (ball.size + 8);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    });
}

// Cập nhật hiệu ứng spawn
function updateSpawnEffects() {
    for (let i = gameState.wave.spawnEffects.length - 1; i >= 0; i--) {
        const effect = gameState.wave.spawnEffects[i];
        effect.timer--;
        
        // Cập nhật particles
        effect.particles.forEach(particle => {
            particle.radius += particle.speed;
        });
        
        // Xóa hiệu ứng khi hết thời gian
        if (effect.timer <= 0) {
            gameState.wave.spawnEffects.splice(i, 1);
        }
    }
}

// Vẽ hiệu ứng spawn
function drawSpawnEffects() {
    gameState.wave.spawnEffects.forEach(effect => {
        const progress = 1 - (effect.timer / effect.maxTimer);
        
        // Vẽ vòng tròn cảnh báo
        ctx.strokeStyle = `rgba(255, 0, 0, ${1 - progress})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 30, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Vẽ particles xoay
        effect.particles.forEach(particle => {
            const x = effect.x + Math.cos(particle.angle + Date.now() * 0.01) * particle.radius;
            const y = effect.y + Math.sin(particle.angle + Date.now() * 0.01) * particle.radius;
            
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        

        
        // Hiệu ứng nổ khi spawn
        if (effect.timer < 10) {
            const explosionRadius = (10 - effect.timer) * 5;
            ctx.fillStyle = `rgba(255, 255, 255, ${effect.timer / 10})`;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, explosionRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

// Vẽ UI trên canvas
function drawUI() {
    // Vẽ mini-map
    const miniMapSize = 80;
    const miniMapX = canvas.width - miniMapSize - 10;
    const miniMapY = 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // Vẽ người chơi trên mini-map
    const playerMiniX = miniMapX + (gameState.player.x / canvas.width) * miniMapSize;
    const playerMiniY = miniMapY + (gameState.player.y / canvas.height) * miniMapSize;
    
    ctx.fillStyle = '#4299e1';
    ctx.beginPath();
    ctx.arc(playerMiniX, playerMiniY, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Vẽ quái vật trên mini-map
    gameState.enemies.forEach(enemy => {
        const enemyMiniX = miniMapX + (enemy.x / canvas.width) * miniMapSize;
        const enemyMiniY = miniMapY + (enemy.y / canvas.height) * miniMapSize;
        
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemyMiniX, enemyMiniY, 2, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Vẽ thông tin Wave
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 200, 60);
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 200, 60);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🌊 WAVE ${gameState.wave.current}`, 20, 30);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Quái vật: ${gameState.enemies.length}/${gameState.wave.enemiesPerWave}`, 20, 45);
    ctx.fillText(`Đã giết: ${gameState.wave.enemiesKilled}`, 20, 60);
}

// Xử lý di chuyển
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ' && !gameState.inBattle) {
        e.preventDefault();
        // Luôn hiển thị hiệu ứng gậy phép khi nhấn SPACE
        gameState.player.isAttacking = true;
        gameState.player.attackTimer = 30; // 30 frames = 0.5 giây
        console.log("Kích hoạt hiệu ứng tấn công!"); // Debug
        checkForNearbyEnemies();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Cập nhật vị trí người chơi
function updatePlayerPosition() {
    if (gameState.inBattle) return;
    
    // Cập nhật timer tấn công
    if (gameState.player.attackTimer > 0) {
        gameState.player.attackTimer--;
        if (gameState.player.attackTimer <= 0) {
            gameState.player.isAttacking = false;
        }
    }
    
    const speed = 3;
    let newX = gameState.player.x;
    let newY = gameState.player.y;
    
    if (keys['w'] || keys['arrowup']) newY -= speed;
    if (keys['s'] || keys['arrowdown']) newY += speed;
    if (keys['a'] || keys['arrowleft']) newX -= speed;
    if (keys['d'] || keys['arrowright']) newX += speed;
    
    // Giới hạn trong canvas
    newX = Math.max(20, Math.min(canvas.width - 20, newX));
    newY = Math.max(20, Math.min(canvas.height - 20, newY));
    
    gameState.player.x = newX;
    gameState.player.y = newY;
}

// Kiểm tra quái vật gần và tạo quả cầu năng lượng
function checkForNearbyEnemies() {
    const attackRange = 200; // Tăng tầm tấn công
    let nearestEnemy = null;
    let nearestDistance = attackRange;
    
    // Tìm quái vật gần nhất
    for (let enemy of gameState.enemies) {
        const distance = Math.sqrt(
            Math.pow(enemy.x - gameState.player.x, 2) + 
            Math.pow(enemy.y - gameState.player.y, 2)
        );
        
        if (distance <= attackRange && distance < nearestDistance) {
            nearestEnemy = enemy;
            nearestDistance = distance;
        }
    }
    
    if (nearestEnemy) {
        // Tạo quả cầu năng lượng sau 0.5 giây
        setTimeout(() => {
            createEnergyBall(nearestEnemy);
        }, 500);
        addToLog("Bắn quả cầu năng lượng về phía " + nearestEnemy.name + "!");
    } else {
        addToLog("Không có quái vật nào trong tầm tấn công!");
    }
}

// Tạo quả cầu năng lượng
function createEnergyBall(targetEnemy) {
    const energyBall = {
        x: gameState.player.x + 25,
        y: gameState.player.y - 20,
        targetX: targetEnemy.x,
        targetY: targetEnemy.y,
        target: targetEnemy,
        speed: 6,
        size: 12,
        trail: [],
        damage: gameState.player.attack
    };
    
    gameState.energyBalls.push(energyBall);
}

// Cập nhật quả cầu năng lượng
function updateEnergyBalls() {
    for (let i = gameState.energyBalls.length - 1; i >= 0; i--) {
        const ball = gameState.energyBalls[i];
        
        // Cập nhật vị trí mục tiêu (nếu quái vật di chuyển)
        if (ball.target) {
            ball.targetX = ball.target.x;
            ball.targetY = ball.target.y;
        }
        
        // Tính toán hướng bay
        const dx = ball.targetX - ball.x;
        const dy = ball.targetY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 25) {
            // Trúng mục tiêu!
            if (ball.target) {
                ball.target.hp -= ball.damage;
                ball.target.hit = true;
                ball.target.hitTimer = 30;
                
                addToLog(`Trúng ${ball.target.name}! Gây ${ball.damage} sát thương!`);
                
                // Kiểm tra quái vật chết
                if (ball.target.hp <= 0) {
                    defeatEnemy(ball.target);
                }
            }
            
            // Xóa quả cầu
            gameState.energyBalls.splice(i, 1);
        } else {
            // Di chuyển về phía mục tiêu
            ball.x += (dx / distance) * ball.speed;
            ball.y += (dy / distance) * ball.speed;
            
            // Thêm vào đuôi sáng
            ball.trail.push({x: ball.x, y: ball.y});
            if (ball.trail.length > 8) {
                ball.trail.shift();
            }
        }
    }
}

// Đánh bại quái vật
function defeatEnemy(enemy) {
    // Thêm kinh nghiệm và vàng
    gameState.player.xp += enemy.xpReward;
    gameState.player.gold += enemy.goldReward;
    
    addToLog(`Đánh bại ${enemy.name}! Nhận ${enemy.xpReward} XP và ${enemy.goldReward} vàng!`);
    
    // Xóa quái vật khỏi danh sách
    const index = gameState.enemies.indexOf(enemy);
    if (index > -1) {
        gameState.enemies.splice(index, 1);
    }
    
    // Tăng số quái vật đã giết trong wave
    gameState.wave.enemiesKilled++;
    
    // Kiểm tra lên cấp
    checkLevelUp();
    updateUI();
    
    // Kiểm tra wave hoàn thành
    checkWaveComplete();
}

// Bắt đầu chiến đấu
function startBattle(enemy) {
    gameState.inBattle = true;
    gameState.currentEnemy = enemy;
    
    // Cập nhật UI chiến đấu
    document.getElementById('enemy-name').textContent = enemy.name;
    document.getElementById('battle-player-hp').textContent = gameState.player.hp;
    document.getElementById('battle-player-attack').textContent = gameState.player.attack;
    document.getElementById('battle-enemy-hp').textContent = enemy.hp;
    document.getElementById('battle-enemy-attack').textContent = enemy.attack;
    
    // Hiển thị modal chiến đấu
    document.getElementById('battle-modal').classList.remove('hidden');
    
    // Xóa log chiến đấu
    document.getElementById('battle-log').innerHTML = '';
    
    addToBattleLog(`Bạn gặp ${enemy.name}! Chiến đấu bắt đầu!`);
}

// Kết thúc chiến đấu
function endBattle(victory = false) {
    gameState.inBattle = false;
    document.getElementById('battle-modal').classList.add('hidden');
    
    if (victory && gameState.currentEnemy) {
        const enemy = gameState.currentEnemy;
        
        // Thưởng kinh nghiệm và vàng
        gameState.player.xp += enemy.xpReward;
        gameState.player.gold += enemy.goldReward;
        
        addToLog(`Bạn đã đánh bại ${enemy.name}!`);
        addToLog(`Nhận được ${enemy.xpReward} kinh nghiệm và ${enemy.goldReward} vàng!`);
        
        // Xóa quái vật khỏi danh sách
        gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
        
        // Kiểm tra lên cấp
        checkLevelUp();
        
        // Spawn quái vật mới nếu cần
        if (gameState.enemies.length < 3) {
            spawnEnemies();
        }
    }
    
    gameState.currentEnemy = null;
    updateUI();
}

// Kiểm tra lên cấp
function checkLevelUp() {
    while (gameState.player.xp >= gameState.player.maxXp) {
        gameState.player.level++;
        gameState.player.xp -= gameState.player.maxXp;
        gameState.player.maxXp = Math.floor(gameState.player.maxXp * 1.5);
        
        // Tăng stats
        const hpIncrease = 20;
        const attackIncrease = 5;
        const defenseIncrease = 2;
        
        gameState.player.maxHp += hpIncrease;
        gameState.player.hp = gameState.player.maxHp; // Hồi đầy máu khi lên cấp
        gameState.player.attack += attackIncrease;
        gameState.player.defense += defenseIncrease;
        
        addToLog(`🎉 Chúc mừng! Bạn đã lên cấp ${gameState.player.level}!`);
        addToLog(`Máu tối đa +${hpIncrease}, Tấn công +${attackIncrease}, Phòng thủ +${defenseIncrease}`);
    }
}

// Tấn công trong chiến đấu
function playerAttack() {
    if (!gameState.currentEnemy) return;
    
    const enemy = gameState.currentEnemy;
    const damage = Math.max(1, gameState.player.attack - enemy.defense + Math.floor(Math.random() * 10) - 5);
    
    enemy.hp -= damage;
    addToBattleLog(`Bạn tấn công ${enemy.name} gây ${damage} sát thương!`);
    
    // Cập nhật UI
    document.getElementById('battle-enemy-hp').textContent = enemy.hp;
    
    if (enemy.hp <= 0) {
        addToBattleLog(`${enemy.name} đã bị đánh bại!`);
        setTimeout(() => endBattle(true), 1500);
        return;
    }
    
    // Quái vật phản công
    setTimeout(enemyAttack, 1000);
}

// Quái vật tấn công
function enemyAttack() {
    if (!gameState.currentEnemy) return;
    
    const enemy = gameState.currentEnemy;
    const damage = Math.max(1, enemy.attack - gameState.player.defense + Math.floor(Math.random() * 8) - 4);
    
    gameState.player.hp -= damage;
    addToBattleLog(`${enemy.name} tấn công bạn gây ${damage} sát thương!`);
    
    // Cập nhật UI
    document.getElementById('battle-player-hp').textContent = gameState.player.hp;
    updateUI();
    
    if (gameState.player.hp <= 0) {
        addToBattleLog("Bạn đã bị đánh bại! Game Over!");
        setTimeout(() => {
            alert("Game Over! Bạn sẽ được hồi sinh với 50% máu.");
            gameState.player.hp = Math.floor(gameState.player.maxHp * 0.5);
            endBattle(false);
        }, 1500);
    }
}

// Phòng thủ
function playerDefend() {
    addToBattleLog("Bạn đang phòng thủ, giảm 50% sát thương nhận vào!");
    
    // Quái vật tấn công với sát thương giảm
    setTimeout(() => {
        if (!gameState.currentEnemy) return;
        
        const enemy = gameState.currentEnemy;
        const damage = Math.max(1, Math.floor((enemy.attack - gameState.player.defense) * 0.5));
        
        gameState.player.hp -= damage;
        addToBattleLog(`${enemy.name} tấn công nhưng bạn đã phòng thủ! Chỉ nhận ${damage} sát thương!`);
        
        document.getElementById('battle-player-hp').textContent = gameState.player.hp;
        updateUI();
        
        if (gameState.player.hp <= 0) {
            addToBattleLog("Bạn đã bị đánh bại! Game Over!");
            setTimeout(() => {
                alert("Game Over! Bạn sẽ được hồi sinh với 50% máu.");
                gameState.player.hp = Math.floor(gameState.player.maxHp * 0.5);
                endBattle(false);
            }, 1500);
        }
    }, 1000);
}

// Chạy trốn
function playerRun() {
    const runChance = 0.7; // 70% cơ hội chạy trốn thành công
    
    if (Math.random() < runChance) {
        addToBattleLog("Bạn đã chạy trốn thành công!");
        setTimeout(() => endBattle(false), 1000);
    } else {
        addToBattleLog("Không thể chạy trốn! Quái vật đã chặn đường!");
        setTimeout(enemyAttack, 1000);
    }
}

// Hồi máu
function healPlayer() {
    const healCost = 10;
    const healAmount = Math.floor(gameState.player.maxHp * 0.3);
    
    if (gameState.player.gold < healCost) {
        addToLog("Không đủ vàng để mua thuốc hồi máu!");
        return;
    }
    
    if (gameState.player.hp >= gameState.player.maxHp) {
        addToLog("Máu của bạn đã đầy!");
        return;
    }
    
    gameState.player.gold -= healCost;
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmount);
    
    addToLog(`Bạn đã sử dụng thuốc hồi máu! Hồi ${healAmount} máu.`);
    updateUI();
}



// Cập nhật UI
function updateUI() {
    document.getElementById('player-level').textContent = gameState.player.level;
    document.getElementById('player-hp').textContent = gameState.player.hp;
    document.getElementById('player-max-hp').textContent = gameState.player.maxHp;
    document.getElementById('player-xp').textContent = gameState.player.xp;
    document.getElementById('player-max-xp').textContent = gameState.player.maxXp;
    document.getElementById('player-gold').textContent = gameState.player.gold;
}

// Thêm vào log game
function addToLog(message) {
    const log = document.getElementById('game-log');
    const p = document.createElement('p');
    p.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    
    // Giới hạn số dòng log
    while (log.children.length > 20) {
        log.removeChild(log.firstChild);
    }
}

// Thêm vào log chiến đấu
function addToBattleLog(message) {
    const log = document.getElementById('battle-log');
    const p = document.createElement('p');
    p.textContent = message;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

// Thiết lập event listeners
function setupEventListeners() {
    // Nút hành động
    document.getElementById('heal-btn').addEventListener('click', healPlayer);
    
    // Nút chiến đấu
    document.getElementById('attack-btn').addEventListener('click', playerAttack);
    document.getElementById('defend-btn').addEventListener('click', playerDefend);
    document.getElementById('run-btn').addEventListener('click', playerRun);
}

// Khởi tạo game khi trang web load
document.addEventListener('DOMContentLoaded', initGame);
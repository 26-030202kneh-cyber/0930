const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const scoreText =
    document.getElementById("score");

const livesText =
    document.getElementById("lives");

const levelText =
    document.getElementById("level");

const highScoreText =
    document.getElementById("highScore");

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");


/* =========================
   게임 변수
========================= */

let score = 0;

let lives = 3;

let level = 1;

let highScore =
    Number(
        localStorage.getItem(
            "brickHighScore"
        )
    ) || 0;

let gameRunning = false;

let paused = false;

let animationId;


/* =========================
   공
========================= */

const ball = {

    x: canvas.width / 2,

    y: canvas.height - 80,

    radius: 9,

    dx: 5,

    dy: -5
};


/* =========================
   패들
========================= */

const paddle = {

    width: 120,

    height: 15,

    x:
        canvas.width / 2 - 60,

    y:
        canvas.height - 35,

    speed: 8,

    dx: 0
};


/* =========================
   벽돌
========================= */

const brickSettings = {

    rows: 5,

    columns: 10,

    width: 70,

    height: 25,

    padding: 7,

    top: 60,

    left: 20
};

let bricks = [];


/* =========================
   초기 최고 점수
========================= */

highScoreText.textContent =
    highScore;


/* =========================
   벽돌 생성
========================= */

function createBricks() {

    bricks = [];

    for (
        let row = 0;
        row < brickSettings.rows;
        row++
    ) {

        bricks[row] = [];

        for (
            let col = 0;
            col < brickSettings.columns;
            col++
        ) {

            bricks[row][col] = {

                x:
                    brickSettings.left +
                    col *
                    (
                        brickSettings.width +
                        brickSettings.padding
                    ),

                y:
                    brickSettings.top +
                    row *
                    (
                        brickSettings.height +
                        brickSettings.padding
                    ),

                width:
                    brickSettings.width,

                height:
                    brickSettings.height,

                alive: true
            };
        }
    }
}


/* =========================
   배경
========================= */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#050816"
    );

    gradient.addColorStop(
        1,
        "#111827"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


/* =========================
   공
========================= */

function drawBall() {

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "#00e5ff";

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.closePath();
}


/* =========================
   패들
========================= */

function drawPaddle() {

    const gradient =
        ctx.createLinearGradient(
            paddle.x,
            paddle.y,
            paddle.x,
            paddle.y +
            paddle.height
        );

    gradient.addColorStop(
        0,
        "#ffffff"
    );

    gradient.addColorStop(
        0.3,
        "#00e5ff"
    );

    gradient.addColorStop(
        1,
        "#2563eb"
    );

    ctx.fillStyle =
        gradient;

    ctx.beginPath();

    ctx.roundRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height,
        8
    );

    ctx.fill();

    ctx.closePath();
}


/* =========================
   벽돌
========================= */

function drawBricks() {

    const colors = [
        "#ff595e",
        "#ff924c",
        "#ffca3a",
        "#8ac926",
        "#1982c4",
        "#6a4c93"
    ];

    for (
        let row = 0;
        row < bricks.length;
        row++
    ) {

        for (
            let col = 0;
            col < bricks[row].length;
            col++
        ) {

            const b =
                bricks[row][col];

            if (!b.alive) {
                continue;
            }

            ctx.fillStyle =
                colors[
                    row %
                    colors.length
                ];

            ctx.beginPath();

            ctx.roundRect(
                b.x,
                b.y,
                b.width,
                b.height,
                5
            );

            ctx.fill();

            ctx.closePath();
        }
    }
}


/* =========================
   화면
========================= */

function draw() {

    drawBackground();

    drawBricks();

    drawPaddle();

    drawBall();
}


/* =========================
   공 이동
========================= */

function moveBall() {

    ball.x += ball.dx;

    ball.y += ball.dy;


    /* 좌측 벽 */

    if (
        ball.x -
        ball.radius <= 0
    ) {

        ball.x =
            ball.radius;

        ball.dx =
            Math.abs(ball.dx);
    }


    /* 우측 벽 */

    if (
        ball.x +
        ball.radius >=
        canvas.width
    ) {

        ball.x =
            canvas.width -
            ball.radius;

        ball.dx =
            -Math.abs(ball.dx);
    }


    /* 위쪽 벽 */

    if (
        ball.y -
        ball.radius <= 0
    ) {

        ball.y =
            ball.radius;

        ball.dy =
            Math.abs(ball.dy);
    }


    /* 패들 */

    if (

        ball.y +
        ball.radius >=
        paddle.y &&

        ball.y -
        ball.radius <=
        paddle.y +
        paddle.height &&

        ball.x >=
        paddle.x &&

        ball.x <=
        paddle.x +
        paddle.width &&

        ball.dy > 0

    ) {

        const hit =
            (
                ball.x -
                (
                    paddle.x +
                    paddle.width / 2
                )
            )
            /
            (
                paddle.width / 2
            );

        const speed =
            Math.sqrt(
                ball.dx ** 2 +
                ball.dy ** 2
            );

        ball.dx =
            speed * hit;

        ball.dy =
            -Math.sqrt(
                speed ** 2 -
                ball.dx ** 2
            );

        ball.y =
            paddle.y -
            ball.radius;
    }


    /* 바닥 */

    if (
        ball.y -
        ball.radius >
        canvas.height
    ) {

        loseLife();
    }
}


/* =========================
   패들
========================= */

function movePaddle() {

    paddle.x += paddle.dx;

    if (paddle.x < 0) {

        paddle.x = 0;
    }

    if (
        paddle.x +
        paddle.width >
        canvas.width
    ) {

        paddle.x =
            canvas.width -
            paddle.width;
    }
}


/* =========================
   벽돌 충돌
========================= */

function collisionDetection() {

    for (
        let row = 0;
        row < bricks.length;
        row++
    ) {

        for (
            let col = 0;
            col < bricks[row].length;
            col++
        ) {

            const b =
                bricks[row][col];

            if (!b.alive) {
                continue;
            }

            if (

                ball.x +
                ball.radius >
                b.x &&

                ball.x -
                ball.radius <
                b.x +
                b.width &&

                ball.y +
                ball.radius >
                b.y &&

                ball.y -
                ball.radius <
                b.y +
                b.height

            ) {

                b.alive = false;

                ball.dy =
                    -ball.dy;

                score += 10;

                scoreText.textContent =
                    score;

                updateHighScore();

                checkLevel();

                return;
            }
        }
    }
}


/* =========================
   최고 점수
========================= */

function updateHighScore() {

    if (
        score > highScore
    ) {

        highScore =
            score;

        highScoreText.textContent =
            highScore;

        localStorage.setItem(
            "brickHighScore",
            highScore
        );
    }
}


/* =========================
   레벨
========================= */

function checkLevel() {

    let remaining = 0;

    for (
        let row = 0;
        row < bricks.length;
        row++
    ) {

        for (
            let col = 0;
            col < bricks[row].length;
            col++
        ) {

            if (
                bricks[row][col].alive
            ) {

                remaining++;
            }
        }
    }

    if (
        remaining === 0
    ) {

        level++;

        levelText.textContent =
            level;

        if (
            brickSettings.rows < 8
        ) {

            brickSettings.rows++;
        }

        resetBall();

        createBricks();
    }
}


/* =========================
   공 초기화
========================= */

function resetBall() {

    ball.x =
        canvas.width / 2;

    ball.y =
        canvas.height - 80;

    const speed =
        5 +
        (level - 1) * 0.5;

    ball.dx =
        speed *
        (
            Math.random() > 0.5
            ? 1
            : -1
        );

    ball.dy =
        -speed;
}


/* =========================
   목숨
========================= */

function loseLife() {

    lives--;

    livesText.textContent =
        lives;

    if (
        lives <= 0
    ) {

        gameOver();

    } else {

        resetBall();

        paddle.x =
            canvas.width / 2 -
            paddle.width / 2;
    }
}


/* =========================
   게임 시작
========================= */

function startGame() {

    score = 0;

    lives = 3;

    level = 1;

    brickSettings.rows = 5;

    scoreText.textContent =
        score;

    livesText.textContent =
        lives;

    levelText.textContent =
        level;

    paddle.x =
        canvas.width / 2 -
        paddle.width / 2;

    paddle.dx = 0;

    resetBall();

    createBricks();

    gameRunning = true;

    paused = false;

    pauseButton.textContent =
        "일시정지";

    startScreen.style.display =
        "none";

    cancelAnimationFrame(
        animationId
    );

    gameLoop();
}


/* =========================
   게임 오버
========================= */

function gameOver() {

    gameRunning = false;

    startScreen.style.display =
        "block";

    startScreen.innerHTML = `
        <h2>GAME OVER</h2>

        <p>
            최종 점수: ${score}
        </p>

        <p>
            도달 레벨: ${level}
        </p>

        <button id="restartButton">
            다시 시작
        </button>
    `;

    document
        .getElementById("restartButton")
        .onclick = startGame;
}


/* =========================
   일시정지
========================= */

function togglePause() {

    if (!gameRunning) {
        return;
    }

    paused =
        !paused;

    pauseButton.textContent =
        paused
        ? "계속하기"
        : "일시정지";
}


/* =========================
   게임 루프
========================= */

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    if (!paused) {

        movePaddle();

        moveBall();

        collisionDetection();
    }

    draw();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================
   키보드
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            paddle.dx =
                -paddle.speed;

            event.preventDefault();
        }

        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            paddle.dx =
                paddle.speed;

            event.preventDefault();
        }

        if (
            event.key === " "
        ) {

            togglePause();

            event.preventDefault();
        }
    }
);


document.addEventListener(
    "keyup",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "a" ||
            event.key.toLowerCase() === "d"
        ) {

            paddle.dx = 0;
        }
    }
);


/* =========================
   마우스
========================= */

canvas.addEventListener(
    "mousemove",
    function(event) {

        const rect =
            canvas.getBoundingClientRect();

        const mouseX =
            event.clientX -
            rect.left;

        const scaleX =
            canvas.width /
            rect.width;

        paddle.x =
            mouseX *
            scaleX -
            paddle.width / 2;

        if (paddle.x < 0) {
            paddle.x = 0;
        }

        if (
            paddle.x +
            paddle.width >
            canvas.width
        ) {

            paddle.x =
                canvas.width -
                paddle.width;
        }
    }
);


/* =========================
   터치 버튼
========================= */

leftButton.addEventListener(
    "mousedown",
    () => {
        paddle.dx =
            -paddle.speed;
    }
);

rightButton.addEventListener(
    "mousedown",
    () => {
        paddle.dx =
            paddle.speed;
    }
);

leftButton.addEventListener(
    "mouseup",
    () => {
        paddle.dx = 0;
    }
);

rightButton.addEventListener(
    "mouseup",
    () => {
        paddle.dx = 0;
    }
);

leftButton.addEventListener(
    "touchstart",
    (event) => {

        event.preventDefault();

        paddle.dx =
            -paddle.speed;
    }
);

rightButton.addEventListener(
    "touchstart",
    (event) => {

        event.preventDefault();

        paddle.dx =
            paddle.speed;
    }
);

leftButton.addEventListener(
    "touchend",
    () => {
        paddle.dx = 0;
    }
);

rightButton.addEventListener(
    "touchend",
    () => {
        paddle.dx = 0;
    }
);


/* =========================
   버튼
========================= */

startButton.onclick =
    startGame;

pauseButton.onclick =
    togglePause;


/* =========================
   초기 화면
========================= */

createBricks();

draw();

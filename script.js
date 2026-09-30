const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const levelText = document.getElementById("level");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");


// =========================
// 게임 설정
// =========================

let score = 0;
let lives = 3;
let level = 1;

let gameRunning = false;
let gamePaused = false;

let animationId;


// =========================
// 공
// =========================

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 70,

    radius: 9,

    dx: 5,
    dy: -5
};


// =========================
// 패들
// =========================

const paddle = {

    width: 120,
    height: 15,

    x: canvas.width / 2 - 60,
    y: canvas.height - 30,

    speed: 8,

    dx: 0
};


// =========================
// 벽돌 설정
// =========================

const brick = {

    rows: 5,
    columns: 10,

    width: 70,
    height: 25,

    padding: 7,

    top: 60,
    left: 20
};

let bricks = [];


// =========================
// 벽돌 생성
// =========================

function createBricks() {

    bricks = [];

    for (let row = 0; row < brick.rows; row++) {

        bricks[row] = [];

        for (let col = 0; col < brick.columns; col++) {

            bricks[row][col] = {

                x:
                    brick.left +
                    col *
                    (brick.width + brick.padding),

                y:
                    brick.top +
                    row *
                    (brick.height + brick.padding),

                width: brick.width,

                height: brick.height,

                alive: true
            };
        }
    }
}


// =========================
// 공 그리기
// =========================

function drawBall() {

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00e5ff";

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.closePath();
}


// =========================
// 패들 그리기
// =========================

function drawPaddle() {

    ctx.fillStyle = "#00e5ff";

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


// =========================
// 벽돌 그리기
// =========================

function drawBricks() {

    for (let row = 0; row < bricks.length; row++) {

        for (
            let col = 0;
            col < bricks[row].length;
            col++
        ) {

            const b = bricks[row][col];

            if (!b.alive) {
                continue;
            }

            const colors = [
                "#ff595e",
                "#ff924c",
                "#ffca3a",
                "#8ac926",
                "#1982c4"
            ];

            ctx.fillStyle =
                colors[row % colors.length];

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


// =========================
// 배경
// =========================

function drawBackground() {

    ctx.fillStyle = "#050816";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// =========================
// 화면 그리기
// =========================

function draw() {

    drawBackground();

    drawBricks();

    drawBall();

    drawPaddle();
}


// =========================
// 공 이동
// =========================

function moveBall() {

    ball.x += ball.dx;
    ball.y += ball.dy;


    // 왼쪽 벽

    if (
        ball.x - ball.radius <= 0
    ) {

        ball.x = ball.radius;

        ball.dx =
            Math.abs(ball.dx);
    }


    // 오른쪽 벽

    if (
        ball.x + ball.radius >=
        canvas.width
    ) {

        ball.x =
            canvas.width -
            ball.radius;

        ball.dx =
            -Math.abs(ball.dx);
    }


    // 위쪽 벽

    if (
        ball.y - ball.radius <= 0
    ) {

        ball.y =
            ball.radius;

        ball.dy =
            Math.abs(ball.dy);
    }


    // 패들과 충돌

    if (

        ball.y + ball.radius >=
        paddle.y &&

        ball.y - ball.radius <=
        paddle.y + paddle.height &&

        ball.x >= paddle.x &&

        ball.x <=
        paddle.x + paddle.width &&

        ball.dy > 0

    ) {

        const hitPoint =
            (
                ball.x -
                (
                    paddle.x +
                    paddle.width / 2
                )
            )
            /
            (paddle.width / 2);

        const speed =
            Math.sqrt(
                ball.dx * ball.dx +
                ball.dy * ball.dy
            );

        ball.dx =
            speed *
            hitPoint;

        ball.dy =
            -Math.sqrt(
                speed * speed -
                ball.dx * ball.dx
            );

        ball.y =
            paddle.y -
            ball.radius;
    }


    // 공이 바닥으로 떨어짐

    if (
        ball.y - ball.radius >
        canvas.height
    ) {

        loseLife();
    }
}


// =========================
// 패들 이동
// =========================

function movePaddle() {

    paddle.x += paddle.dx;

    if (paddle.x < 0) {

        paddle.x = 0;
    }

    if (
        paddle.x + paddle.width >
        canvas.width
    ) {

        paddle.x =
            canvas.width -
            paddle.width;
    }
}


// =========================
// 벽돌 충돌
// =========================

function collisionDetection() {

    for (let row = 0; row < bricks.length; row++) {

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

                ball.x + ball.radius > b.x &&

                ball.x - ball.radius <
                b.x + b.width &&

                ball.y + ball.radius > b.y &&

                ball.y - ball.radius <
                b.y + b.height

            ) {

                b.alive = false;

                ball.dy =
                    -ball.dy;

                score += 10;

                scoreText.textContent =
                    score;

                checkLevel();

                return;
            }
        }
    }
}


// =========================
// 레벨 확인
// =========================

function checkLevel() {

    let remaining = 0;

    for (let row = 0; row < bricks.length; row++) {

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

    if (remaining === 0) {

        level++;

        levelText.textContent =
            level;

        brick.rows++;

        resetBall();

        createBricks();
    }
}


// =========================
// 목숨 감소
// =========================

function loseLife() {

    lives--;

    livesText.textContent =
        lives;

    if (lives <= 0) {

        gameOver();

        return;
    }

    resetBall();

    paddle.x =
        canvas.width / 2 -
        paddle.width / 2;
}


// =========================
// 공 초기화
// =========================

function resetBall() {

    ball.x =
        canvas.width / 2;

    ball.y =
        canvas.height - 70;

    const speed =
        5 + (level - 1) * 0.5;

    ball.dx =
        speed *
        (Math.random() > 0.5 ? 1 : -1);

    ball.dy =
        -speed;
}


// =========================
// 게임 시작
// =========================

function startGame() {

    score = 0;
    lives = 3;
    level = 1;

    brick.rows = 5;

    scoreText.textContent = score;
    livesText.textContent = lives;
    levelText.textContent = level;

    paddle.x =
        canvas.width / 2 -
        paddle.width / 2;

    paddle.dx = 0;

    resetBall();

    createBricks();

    gameRunning = true;
    gamePaused = false;

    pauseBtn.textContent =
        "일시정지";

    cancelAnimationFrame(
        animationId
    );

    gameLoop();
}


// =========================
// 게임 오버
// =========================

function gameOver() {

    gameRunning = false;

    cancelAnimationFrame(
        animationId
    );

    setTimeout(() => {

        alert(
            "게임 오버!\n\n" +
            "점수: " + score +
            "\n레벨: " + level
        );

    }, 100);
}


// =========================
// 일시정지
// =========================

function togglePause() {

    if (!gameRunning) {
        return;
    }

    gamePaused =
        !gamePaused;

    if (gamePaused) {

        pauseBtn.textContent =
            "계속하기";

    } else {

        pauseBtn.textContent =
            "일시정지";
    }
}


// =========================
// 게임 루프
// =========================

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    if (!gamePaused) {

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


// =========================
// 키보드
// =========================

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

        if (event.key === " ") {

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


// =========================
// 버튼
// =========================

startBtn.addEventListener(
    "click",
    startGame
);

pauseBtn.addEventListener(
    "click",
    togglePause
);


// =========================
// 처음 화면
// =========================

createBricks();

draw();

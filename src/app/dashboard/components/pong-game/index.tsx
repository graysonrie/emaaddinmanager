"use client";
import { useEffect } from "react";

export default function PongGame() {
  useEffect(() => {
    const canvasMaybe = document.getElementById(
      "pong-canvas"
    ) as HTMLCanvasElement | null;
    if (!canvasMaybe) return;

    const ctxMaybe = canvasMaybe.getContext("2d");
    if (!ctxMaybe) return;

    // From here on, use non-nullable aliases for closures
    const canvas = canvasMaybe as HTMLCanvasElement;
    const ctx = ctxMaybe as CanvasRenderingContext2D;

    const DPR = window.devicePixelRatio || 1;
    const logicalWidth = 800;
    const logicalHeight = 500;

    function resizeCanvas() {
      const parent = canvas.parentElement;

      const maxWidth = parent ? parent.clientWidth : logicalWidth;
      const scale = Math.min(1, maxWidth / logicalWidth);
      const cssWidth = Math.floor(logicalWidth * scale);
      const cssHeight = Math.floor(logicalHeight * scale);

      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      canvas.width = Math.floor(cssWidth * DPR);
      canvas.height = Math.floor(cssHeight * DPR);
      ctx.setTransform(DPR * scale, 0, 0, DPR * scale, 0, 0);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Game constants (logical coordinate space)
    const paddleWidth = 12;
    const paddleHeight = 90;
    const paddleSpeed = 8;
    const ballRadius = 10;
    const ballSpeedInitial = 10;
    const aiMaxSpeed = 6;
    const wallOffset = 20;

    let playerY = logicalHeight / 2 - paddleHeight / 2;
    let aiY = playerY;
    let playerScore = 0;
    let aiScore = 0;

    let ballX = logicalWidth / 2;
    let ballY = logicalHeight / 2;
    let ballVelX = Math.random() < 0.5 ? -ballSpeedInitial : ballSpeedInitial;
    let ballVelY = (Math.random() * 2 - 1) * ballSpeedInitial * 0.6;

    let isPaused = false;
    let isMouseInsideCanvas = false;
    let animationId = 0;

    function resetBall(direction: number) {
      ballX = logicalWidth / 2;
      ballY = logicalHeight / 2;
      const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6; // -30..30 degrees
      const speed = ballSpeedInitial;
      ballVelX = Math.cos(angle) * speed * direction;
      ballVelY = Math.sin(angle) * speed;
    }

    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    function draw() {
      // Background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // Midline
      ctx.strokeStyle = "#2a2a2a";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(logicalWidth / 2, 0);
      ctx.lineTo(logicalWidth / 2, logicalHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Scores
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(playerScore), logicalWidth / 2 - 60, 40);
      ctx.fillText(String(aiScore), logicalWidth / 2 + 60, 40);

      // Paddles
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(wallOffset, playerY, paddleWidth, paddleHeight);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(
        logicalWidth - wallOffset - paddleWidth,
        aiY,
        paddleWidth,
        paddleHeight
      );

      // Ball
      ctx.fillStyle = "#e5e7eb";
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        ctx.fillStyle = "#e5e7eb";
        ctx.font =
          "20px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
        ctx.fillText(
          "Paused - press Space to resume",
          logicalWidth / 2,
          logicalHeight / 2
        );
      }
    }

    function update() {
      if (isPaused || !isMouseInsideCanvas) return;

      // Player Y is driven by mouse movement; clamped in the mouse handler

      // Simple AI: follow the ball with capped speed
      const targetY = ballY - paddleHeight / 2;
      const diff = targetY - aiY;
      const move = clamp(diff, -aiMaxSpeed, aiMaxSpeed);
      if (ballVelX > 0) {
        aiY += move; // more aggressive when ball is coming towards AI
      } else {
        aiY += move * 0.6; // ease off when ball is moving away
      }
      aiY = clamp(aiY, 0, logicalHeight - paddleHeight);

      // Ball physics
      ballX += ballVelX;
      ballY += ballVelY;

      // Top/bottom collisions
      if (ballY - ballRadius <= 0 && ballVelY < 0) {
        ballY = ballRadius;
        ballVelY *= -1;
      } else if (ballY + ballRadius >= logicalHeight && ballVelY > 0) {
        ballY = logicalHeight - ballRadius;
        ballVelY *= -1;
      }

      // Player paddle collision (AABB)
      if (
        ballX - ballRadius <= wallOffset + paddleWidth &&
        ballX - ballRadius >= wallOffset &&
        ballY >= playerY &&
        ballY <= playerY + paddleHeight &&
        ballVelX < 0
      ) {
        ballX = wallOffset + paddleWidth + ballRadius;
        const hitPos =
          (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2); // -1..1
        const speed = Math.hypot(ballVelX, ballVelY) * 1.04; // accelerate slightly
        const maxBounceAngle = (60 * Math.PI) / 180;
        const angle = hitPos * maxBounceAngle;
        ballVelX = Math.cos(angle) * speed;
        ballVelY = Math.sin(angle) * speed;
      }

      // AI paddle collision (AABB)
      if (
        ballX + ballRadius >= logicalWidth - wallOffset - paddleWidth &&
        ballX + ballRadius <= logicalWidth - wallOffset &&
        ballY >= aiY &&
        ballY <= aiY + paddleHeight &&
        ballVelX > 0
      ) {
        ballX = logicalWidth - wallOffset - paddleWidth - ballRadius;
        const hitPos = (ballY - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
        const speed = Math.hypot(ballVelX, ballVelY) * 1.04;
        const maxBounceAngle = (60 * Math.PI) / 180;
        const angle = hitPos * maxBounceAngle;
        ballVelX = -Math.cos(angle) * speed;
        ballVelY = Math.sin(angle) * speed;
      }

      // Scoring
      if (ballX < 0) {
        aiScore += 1;
        resetBall(1);
      } else if (ballX > logicalWidth) {
        playerScore += 1;
        resetBall(-1);
      }
    }

    function loop() {
      update();
      draw();
      animationId = window.requestAnimationFrame(loop);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        isPaused = !isPaused;
        if (!isPaused && !animationId) {
          loop();
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const relativeY = (e.clientY - rect.top) / rect.height; // 0..1
      const targetY = relativeY * logicalHeight - paddleHeight / 2;
      playerY = clamp(targetY, 0, logicalHeight - paddleHeight);
    }

    function onClick() {
      if (isPaused) isPaused = false;
    }

    function onMouseEnter() {
      isMouseInsideCanvas = true;
    }

    function onMouseLeave() {
      isMouseInsideCanvas = false;
    }

    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseenter", onMouseEnter);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // Start the game loop
    loop();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseenter", onMouseEnter);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full">
      <canvas id="pong-canvas" aria-label="Pong game" role="img" />
    </div>
  );
}

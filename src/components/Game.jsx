import { useEffect, useRef, useState } from 'react'

// Configurações básicas do "runner" 2D
const GRAVITY = 0.6
const JUMP_FORCE = -12
const GROUND_Y = 220 // posição do chão no canvas
const PLAYER = { w: 28, h: 32 }

function rectsCollide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  )
}

export default function Game() {
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let animationId
    let lastTime = 0

    // Estado do jogador
    const player = {
      x: 40,
      y: GROUND_Y - PLAYER.h,
      w: PLAYER.w,
      h: PLAYER.h,
      vy: 0,
      onGround: true,
    }

    // Obstáculos (goombas/blocos) gerados ao longo do tempo
    const obstacles = []

    // Moedas
    const coins = []

    // Parallax simples
    const bgHills = { x: 0 }

    function spawnObstacle() {
      const height = 24 + Math.random() * 24
      const type = Math.random() > 0.5 ? 'goomba' : 'block'
      obstacles.push({ x: canvas.width + 10, y: GROUND_Y - height, w: 26, h: height, type, passed: false })
    }

    function spawnCoin() {
      const y = 120 + Math.random() * 60
      coins.push({ x: canvas.width + 10, y, w: 12, h: 12, taken: false })
    }

    let obstacleTimer = 0
    let coinTimer = 0

    function handleInput(e) {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (player.onGround) {
          player.vy = JUMP_FORCE
          player.onGround = false
        }
        e.preventDefault()
      }
      if (e.code === 'Enter') {
        setRunning((r) => !r)
      }
    }

    window.addEventListener('keydown', handleInput)

    function update(dt) {
      // Física do jogador
      player.vy += GRAVITY
      player.y += player.vy
      if (player.y + player.h >= GROUND_Y) {
        player.y = GROUND_Y - player.h
        player.vy = 0
        player.onGround = true
      }

      // Andar do cenário
      const speed = 3 + Math.min(6, score / 100)
      bgHills.x -= speed * 0.2

      // Obstáculos
      obstacleTimer += dt
      if (obstacleTimer > 1500) {
        spawnObstacle()
        obstacleTimer = 0
      }
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i]
        o.x -= speed
        if (!o.passed && o.x + o.w < player.x) {
          o.passed = true
          setScore((s) => s + 1)
        }
        if (o.x + o.w < -20) obstacles.splice(i, 1)
        // colisão
        if (rectsCollide({ x: player.x, y: player.y, w: player.w, h: player.h }, o)) {
          gameOver()
        }
      }

      // Moedas
      coinTimer += dt
      if (coinTimer > 1000) {
        spawnCoin()
        coinTimer = 0
      }
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i]
        c.x -= speed
        if (!c.taken && rectsCollide({ x: player.x, y: player.y, w: player.w, h: player.h }, c)) {
          c.taken = true
          setScore((s) => s + 5)
          coins.splice(i, 1)
        }
        if (c.x + c.w < -20) coins.splice(i, 1)
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Céu
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height)
      g.addColorStop(0, '#87CEEB')
      g.addColorStop(1, '#E0F6FF')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Colinas ao fundo (parallax)
      ctx.fillStyle = '#89c15b'
      for (let i = -1; i < 5; i++) {
        const baseX = (bgHills.x + i * 200) % 200
        ctx.beginPath()
        ctx.arc(baseX + 100, 220, 120, Math.PI, 0)
        ctx.fill()
      }

      // Chão
      ctx.fillStyle = '#6B3E1D'
      ctx.fillRect(0, GROUND_Y, canvas.width, 4)
      // Grama
      ctx.fillStyle = '#7ED957'
      ctx.fillRect(0, GROUND_Y - 4, canvas.width, 4)

      // Jogador (inspirado no chapéu do Mario)
      ctx.fillStyle = '#e11d48'
      ctx.fillRect(player.x, player.y, player.w, player.h)
      ctx.fillStyle = '#111827'
      ctx.fillRect(player.x + 4, player.y + 8, 20, 8) // faixa

      // Obstáculos
      obstacles.forEach((o) => {
        if (o.type === 'goomba') {
          ctx.fillStyle = '#a16207'
          ctx.fillRect(o.x, o.y, o.w, o.h)
        } else {
          ctx.fillStyle = '#9ca3af'
          ctx.fillRect(o.x, o.y, o.w, o.h)
        }
      })

      // Moedas
      coins.forEach((c) => {
        ctx.fillStyle = '#f59e0b'
        ctx.beginPath()
        ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // UI
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 16px Inter, system-ui, sans-serif'
      ctx.fillText(`Pontuação: ${score}`, 12, 22)
      ctx.fillText('Barra de espaço/Seta para cima = pular', 12, 42)
      ctx.fillText('Enter = pausar/retomar', 12, 62)
    }

    function loop(timestamp) {
      const dt = timestamp - lastTime
      lastTime = timestamp

      if (running) update(dt)
      draw()
      animationId = requestAnimationFrame(loop)
    }

    function handleResize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = 260
    }

    function gameOver() {
      setRunning(false)
      // Mensagem simples de game over
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 28px Inter, system-ui, sans-serif'
      ctx.fillText('Game Over!', canvas.width / 2 - 80, canvas.height / 2)
      ctx.font = '16px Inter, system-ui, sans-serif'
      ctx.fillText('Pressione Enter para reiniciar', canvas.width / 2 - 120, canvas.height / 2 + 28)
    }

    function resetGame() {
      player.x = 40
      player.y = GROUND_Y - PLAYER.h
      player.vy = 0
      player.onGround = true
      obstacles.length = 0
      coins.length = 0
      setScore(0)
      setRunning(true)
    }

    function onKey(e) {
      if (e.code === 'Enter' && !running) {
        resetGame()
      }
    }

    window.addEventListener('keydown', onKey)

    handleResize()
    loop(0)

    window.addEventListener('resize', handleResize)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleInput)
      window.removeEventListener('keydown', onKey)
    }
  }, [running, score])

  return (
    <section id="jogo" className="py-12 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Mini Jogo</h2>
          <div className="text-sm text-gray-600">Use Espaço/Seta para pular • Enter para pausar</div>
        </div>
        <div className="rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
          <div className="p-3">
            <canvas ref={canvasRef} className="w-full block rounded-lg" height="260" />
          </div>
        </div>
      </div>
    </section>
  )
}

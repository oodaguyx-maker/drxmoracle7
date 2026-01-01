interface ParticleConfig {
  colors: string[]
  size: { min: number; max: number }
  speed: { min: number; max: number }
  glow: number
}

export class Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  life: number
  maxLife: number
  canvasWidth: number
  canvasHeight: number

  constructor(canvasWidth: number, canvasHeight: number, config: ParticleConfig) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight
    this.size = Math.random() * (config.size.max - config.size.min) + config.size.min
    this.speedX = (Math.random() - 0.5) * (config.speed.max - config.speed.min) + config.speed.min
    this.speedY = (Math.random() - 0.5) * (config.speed.max - config.speed.min) + config.speed.min
    this.color = config.colors[Math.floor(Math.random() * config.colors.length)]
    this.life = 0
    this.maxLife = Math.random() * 200 + 100
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.life++

    // Wrap around edges
    if (this.x < 0) this.x = this.canvasWidth
    if (this.x > this.canvasWidth) this.x = 0
    if (this.y < 0) this.y = this.canvasHeight
    if (this.y > this.canvasHeight) this.y = 0

    // Reset if life exceeded
    if (this.life > this.maxLife) {
      this.x = Math.random() * this.canvasWidth
      this.y = Math.random() * this.canvasHeight
      this.life = 0
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Calculate fade based on life
    const fadeIn = Math.min(this.life / 30, 1)
    const fadeOut = Math.min((this.maxLife - this.life) / 30, 1)
    const opacity = Math.min(fadeIn, fadeOut)

    ctx.save()
    ctx.globalAlpha = opacity

    // Draw particle
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

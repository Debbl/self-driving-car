import { Controls } from "./Controls";

class Car {
  x: number;
  y: number;
  width: number;
  height: number;

  speed: number = 0;
  acceleration: number = 0.2;
  maxSpeed: number = 3;
  friction: number = 0.05;
  angle: number = 0;

  controls: Controls;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.controls = new Controls();
  }

  update() {
    const { acceleration, maxSpeed, friction } = this;
    const { forward, reverse, left, right } = this.controls;

    if (forward) {
      this.speed += acceleration;
    }
    if (reverse) {
      this.speed -= acceleration;
    }

    if (this.speed > maxSpeed) {
      this.speed = maxSpeed;
    }
    if (this.speed < -maxSpeed / 2) {
      this.speed = -maxSpeed / 2;
    }

    this.speed -= Math.sign(this.speed) * friction;
    if (Math.abs(this.speed) < friction) {
      this.speed = 0;
    }

    if (this.speed !== 0) {
      const flip = Math.sign(this.speed);

      if (left) {
        this.angle += 0.03 * flip;
      }
      if (right) {
        this.angle -= 0.03 * flip;
      }
    }

    this.x -= this.speed * Math.sin(this.angle);
    this.y -= this.speed * Math.cos(this.angle);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height, angle } = this;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angle);

    ctx.beginPath();
    ctx.rect(-width / 2, -height / 2, width, height);
    ctx.fill();

    ctx.restore();
  }
}

export { Car };

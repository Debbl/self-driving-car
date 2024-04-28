import type { Line, Polygon } from "../types";
import { Controls } from "./Controls";
import { Sensor } from "./Sensor";
import { polysIntersect } from "~/utils";

class Car {
  x: number;
  y: number;
  width: number;
  height: number;
  polygon?: Polygon;

  speed = 0;
  acceleration = 0.2;
  maxSpeed = 3;
  friction = 0.05;
  angle = 0;
  damaged = false;

  controls = new Controls();
  sensor = new Sensor(this);

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  private move() {
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

  private assessDamage(roadBorders: Line[]) {
    if (!this.polygon) return false;

    for (const roadBorder of roadBorders) {
      if (polysIntersect(this.polygon, roadBorder)) {
        return true;
      }
    }
    return false;
  }

  private createPolygon() {
    const { x, y, width, height } = this;
    const points = [];
    const rad = Math.hypot(width, height) / 2;
    const alpha = Math.atan2(height, width);

    points.push({
      x: x - Math.sin(this.angle - alpha) * rad,
      y: y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: x - Math.sin(this.angle + alpha) * rad,
      y: y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: x - Math.sin(this.angle + Math.PI - alpha) * rad,
      y: y - Math.cos(this.angle + Math.PI - alpha) * rad,
    });
    points.push({
      x: x - Math.sin(this.angle - Math.PI + alpha) * rad,
      y: y - Math.cos(this.angle - Math.PI + alpha) * rad,
    });

    return points as Polygon;
  }

  update(roadBorders: Line[]) {
    if (!this.damaged) {
      this.move();
      this.polygon = this.createPolygon();
      this.damaged = this.assessDamage(roadBorders);
    }
    this.sensor.update(roadBorders);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height, angle, damaged } = this;

    ctx.save();
    if (damaged) {
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = "black";
    }

    ctx.translate(x, y);
    ctx.rotate(-angle);
    ctx.beginPath();
    ctx.rect(-width / 2, -height / 2, width, height);
    ctx.fill();

    ctx.restore();

    this.sensor.draw(ctx);
  }
}

export { Car };

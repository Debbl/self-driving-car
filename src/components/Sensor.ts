import { getIntersection, lerp } from "../utils";
import type { Line, Ray, Reading, Traffic } from "../types";
import type { Car } from "./Car";

class Sensor {
  car: Car;
  rayCount: number;
  rayLength: number;
  raySpread: number;
  rays: Ray[] = [];
  readings: (Reading | undefined)[] = [];

  constructor(car: Car) {
    this.car = car;
    this.rayCount = 5;
    this.rayLength = 150;
    this.raySpread = Math.PI / 2;

    this.rays = [];
    this.readings = [];
  }

  private castRays() {
    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1),
        ) + this.car.angle;

      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
    }
  }

  private getReading(
    ray: Ray,
    roadBorders: Line[],
    traffic: Traffic,
  ): Reading | undefined {
    const touches: Reading[] = [];

    for (const roadBorder of roadBorders) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorder[0],
        roadBorder[1],
      );

      if (touch) touches.push(touch);
    }

    for (const { polygon } of traffic) {
      for (const poly of polygon) {
        const value = getIntersection(
          ray[0],
          ray[1],
          poly,
          polygon[(polygon.indexOf(poly) + 1) % polygon.length],
        );

        if (value) touches.push(value);
      }
    }

    if (touches.length !== 0) {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);

      return touches.find((e) => e.offset === minOffset);
    }
  }

  update(roadBorders: Line[], traffic: Traffic) {
    this.castRays();

    this.readings = [];

    for (let i = 0; i < this.rays.length; i++) {
      const reading = this.getReading(this.rays[i], roadBorders, traffic);
      this.readings.push(reading);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i]) {
        end = this.readings[i]!;
      }

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export { Sensor };

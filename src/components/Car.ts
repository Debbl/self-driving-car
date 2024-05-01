import type { Line, Polygon, Traffic } from "../types";
import type { ControlType } from "./Controls";
import { Controls } from "./Controls";
import { NeuralNetwork } from "./Network";
import { Sensor } from "./Sensor";
import { polysIntersect } from "~/utils";

class Car {
  x: number;
  y: number;
  width: number;
  height: number;
  polygon: Polygon = [];

  speed = 0;
  acceleration = 0.2;
  friction = 0.05;
  maxSpeed: number;
  angle = 0;
  damaged = false;
  controlType: ControlType = "KEYS";

  controls: Controls;
  sensor?: Sensor;
  brain?: NeuralNetwork;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    controlType: ControlType = "KEYS",
    maxSpeed = 3,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.controlType = controlType;
    this.maxSpeed = maxSpeed;

    if (this.controlType === "KEYS" || this.controlType === "AI") {
      this.sensor = new Sensor(this);

      if (this.controlType === "AI") {
        this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
      }
    }
    this.controls = new Controls(controlType);
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

  private assessDamage(roadBorders: Line[], traffic: Traffic) {
    if (!this.polygon) return false;

    for (const roadBorder of roadBorders) {
      if (polysIntersect(this.polygon, roadBorder)) {
        return true;
      }
    }

    for (const car of traffic) {
      if (polysIntersect(this.polygon, car.polygon)) {
        return true;
      }
    }
    return false;
  }

  private createPolygon() {
    const { x, y, width, height, angle } = this;
    const points = [];
    const rad = Math.hypot(width, height) / 2;
    const alpha = Math.atan2(width, height);

    points.push({
      x: x - Math.sin(angle - alpha) * rad,
      y: y - Math.cos(angle - alpha) * rad,
    });
    points.push({
      x: x - Math.sin(angle + alpha) * rad,
      y: y - Math.cos(angle + alpha) * rad,
    });
    points.push({
      x: x - Math.sin(angle + Math.PI - alpha) * rad,
      y: y - Math.cos(angle + Math.PI - alpha) * rad,
    });
    points.push({
      x: x - Math.sin(angle + Math.PI + alpha) * rad,
      y: y - Math.cos(angle + Math.PI + alpha) * rad,
    });

    return points as Polygon;
  }

  update(roadBorders: Line[], traffic: Traffic) {
    if (!this.damaged) {
      this.move();
      this.polygon = this.createPolygon();
      this.damaged = this.assessDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);

      const offsets = this.sensor.readings.map((s) => (!s ? 0 : 1 - s.offset));

      if (this.brain) {
        const outputs = NeuralNetwork.feedForward(offsets, this.brain);
        this.controls.forward = !!outputs[0];
        this.controls.left = !!outputs[1];
        this.controls.right = !!outputs[2];
        this.controls.reverse = !!outputs[3];
      }
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    fillStyle: string = "black",
    drawSensor = true,
  ) {
    const { damaged, polygon } = this;

    if (damaged) {
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = fillStyle;
    }

    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (const poly of polygon.slice(1)) {
      ctx.lineTo(poly.x, poly.y);
    }
    ctx.fill();

    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
  }
}

export { Car };

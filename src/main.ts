import { Car } from "./Car";
import "./style.css";

const canvas = document.querySelector("#myCanvas") as HTMLCanvasElement;

canvas.width = 200;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d")!;

const car = new Car(10, 300, 30, 40);
car.draw(ctx);

animate();

function animate() {
  car.update();
  canvas.height = window.innerHeight;

  ctx.save();
  car.draw(ctx);
  ctx.restore();
  requestAnimationFrame(animate);
}

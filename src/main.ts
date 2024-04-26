import { Car } from "./Car";
import { Road } from "./Road";
import "./style.css";

const canvas = document.querySelector("#myCanvas") as HTMLCanvasElement;

canvas.width = 200;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d")!;

const car = new Car(10, 300, 30, 40);
const road = new Road(canvas.width / 2, canvas.width * 0.9);

animate();

function animate() {
  canvas.height = window.innerHeight;

  road.draw(ctx);

  car.update(road.borders);
  car.draw(ctx);

  requestAnimationFrame(animate);
}

import { useEffect, useRef } from "react";
import { Car } from "~/components/Car";
import { NeuralNetwork } from "~/components/Network";
import { Road } from "~/components/Road";
import { Visualizer } from "~/components/Visualizer";
import {
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsStopCircle,
  RiSave3Fill,
} from "~/icons";
import { getRandomColor } from "~/utils";

const N = 10;

function generateCars(N: number, road: Road) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }

  return cars;
}

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);
  const bestCar = useRef<Car>();
  const isRunning = useRef(true);

  function toggle() {
    isRunning.current = !isRunning.current;
  }

  function save() {
    if (bestCar.current)
      localStorage.setItem("bestBrain", JSON.stringify(bestCar.current.brain));
  }

  function discard() {
    localStorage.removeItem("bestBrain");
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const networkCanvas = networkCanvasRef.current!;

    canvas.width = 200;
    canvas.height = window.innerHeight;

    networkCanvas.width = 300;
    networkCanvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d")!;
    const networkCtx = networkCanvas.getContext("2d")!;

    const road = new Road(canvas.width / 2, canvas.width * 0.9);

    const traffic = Array.from(
      { length: 7 },
      (_, i) =>
        new Car(
          road.getLaneCenter(i % road.laneCount),
          -100 * (i + 1),
          30,
          50,
          "DUMMY",
          2,
          getRandomColor(),
        ),
    );

    const cars = generateCars(N, road);
    bestCar.current = cars[0];

    if (localStorage.getItem("bestBrain")) {
      for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain") as string);
        if (i !== 0) {
          NeuralNetwork.mutate(cars[i].brain!, 0.1);
        }
      }
    }

    animate();

    function animate(time = 0) {
      canvas.height = window.innerHeight;
      networkCanvas.height = window.innerHeight;

      traffic.forEach((car) => {
        if (isRunning.current) car.update(road.borders, []);
      });

      cars.forEach((car) => {
        if (isRunning.current) car.update(road.borders, traffic);
      });

      bestCar.current = cars.find(
        (c) => c.y === Math.min(...cars.map((c) => c.y)),
      )!;

      ctx.save();
      ctx.translate(0, -bestCar.current.y + canvas.height * 0.7);

      road.draw(ctx);

      traffic.forEach((car) => car.draw(ctx));

      ctx.globalAlpha = 0.2;
      cars.forEach((car) => car.draw(ctx, false));

      ctx.globalAlpha = 1;
      bestCar.current.draw(ctx, true);

      ctx.restore();

      networkCtx.lineDashOffset = -time / 50;
      Visualizer.drawNetwork(networkCtx, bestCar.current.brain!);
      requestAnimationFrame(animate);
    }
  }, []);

  return (
    <div className="flex size-full justify-center gap-x-4 bg-gray-100">
      <canvas ref={canvasRef} className="bg-gray-400" />
      <div className="flex flex-col justify-center gap-y-4">
        <button
          className="flex size-8 items-center justify-center rounded-md hover:bg-blue-300"
          onClick={() => toggle()}
        >
          <MaterialSymbolsStopCircle />
        </button>

        <button
          className="flex size-8 items-center justify-center rounded-md hover:bg-blue-300"
          onClick={() => save()}
        >
          <RiSave3Fill />
        </button>
        <button
          className="flex size-8 items-center justify-center rounded-md hover:bg-blue-300"
          onClick={() => discard()}
        >
          <MaterialSymbolsDeleteOutline />
        </button>
      </div>
      <canvas ref={networkCanvasRef} className="w-[300px] bg-gray-600" />
    </div>
  );
}

export default Index;

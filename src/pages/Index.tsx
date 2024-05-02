import { useRef } from "react";
import { Car } from "~/components/Car";
import { NeuralNetwork } from "~/components/Network";
import { Road } from "~/components/Road";
import { Visualizer } from "~/components/Visualizer";
import { BEST_NETWORK } from "~/constants";
import { useRequestAnimationFrame } from "~/hooks/useRequestAnimationFrame";
import {
  GravityUiCircles5Random,
  MaterialSymbolsDeleteOutline,
  MaterialSymbolsStopCircle,
  MdiGithub,
  RiSave3Fill,
  TablerBulbFilled,
} from "~/icons";
import { getRandomColor } from "~/utils";

const N = 100;

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
  const cars = useRef<Car[]>([]);
  const bestCar = useRef<Car>();
  const isRunning = useRef(true);

  function addBest() {
    localStorage.setItem("bestBrain", JSON.stringify(BEST_NETWORK));
    location.reload();
  }

  function mutate() {
    cars.current.forEach((car) => {
      const isBest = car === bestCar.current;
      if (!isBest) NeuralNetwork.mutate(car.brain!, 0.1);
    });
  }

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

  useRequestAnimationFrame(() => {
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
          -200 * (i + 1),
          30,
          50,
          "DUMMY",
          2,
          getRandomColor(),
        ),
    );

    cars.current = generateCars(N, road);
    bestCar.current = cars.current[0];

    if (localStorage.getItem("bestBrain")) {
      for (let i = 0; i < cars.current.length; i++) {
        cars.current[i].brain = JSON.parse(
          localStorage.getItem("bestBrain") as string,
        );
        if (i !== 0) {
          NeuralNetwork.mutate(cars.current[i].brain!, 0.1);
        }
      }
    }

    function animate(time = 0) {
      canvas.height = window.innerHeight;
      networkCanvas.height = window.innerHeight;

      traffic.forEach((car) => {
        if (isRunning.current) car.update(road.borders, []);
      });

      cars.current = cars.current.filter((car) => {
        if (car === bestCar.current) return true;
        return !car.damaged && Math.abs(car.y - bestCar.current!.y) < 500;
      });

      cars.current.forEach((car) => {
        if (isRunning.current) car.update(road.borders, traffic);
      });

      bestCar.current = cars.current.find(
        (c) => c.y === Math.min(...cars.current.map((c) => c.y)),
      )!;

      ctx.save();
      ctx.translate(0, -bestCar.current.y + canvas.height * 0.7);

      road.draw(ctx);

      traffic.forEach((car) => car.draw(ctx));

      ctx.globalAlpha = 0.2;
      cars.current.forEach((car) => car.draw(ctx, false));

      ctx.globalAlpha = 1;
      bestCar.current.draw(ctx, true);

      ctx.restore();

      networkCtx.lineDashOffset = -time / 50;
      Visualizer.drawNetwork(networkCtx, bestCar.current.brain!);
    }

    return animate;
  });

  return (
    <div className="flex size-full justify-center gap-x-4 bg-gray-100">
      <canvas ref={canvasRef} className="bg-gray-400" />
      <div className="flex flex-col justify-center gap-y-4">
        <a
          href="https://github.com/Debbl/self-driving-car"
          target="_blank"
          className="flex size-8 items-center justify-center rounded-md hover:bg-blue-300"
          rel="noreferrer"
        >
          <MdiGithub />
        </a>
        <button
          className="flex size-8 items-center justify-center rounded-md hover:bg-blue-300"
          onClick={() => addBest()}
        >
          <TablerBulbFilled />
        </button>
        <button
          className="flex size-8 items-center justify-center rounded-md hover:bg-blue-300"
          onClick={() => mutate()}
        >
          <GravityUiCircles5Random />
        </button>
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

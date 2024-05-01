import { useEffect, useRef } from "react";
import { Car } from "~/components/Car";
import { Road } from "~/components/Road";
import { Visualizer } from "~/components/Visualizer";

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);

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
    const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
    const traffic = [new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)];

    animate();

    function animate(time = 0) {
      traffic.forEach((car) => {
        car.update(road.borders, []);
      });

      car.update(road.borders, traffic);
      canvas.height = window.innerHeight;
      networkCanvas.height = window.innerHeight;

      ctx.save();
      ctx.translate(0, -car.y + canvas.height * 0.7);
      road.draw(ctx);
      traffic.forEach((car) => car.draw(ctx, "red"));
      car.draw(ctx);
      ctx.restore();

      networkCtx.lineDashOffset = -time / 50;
      Visualizer.drawNetwork(networkCtx, car.brain!);
      requestAnimationFrame(animate);
    }
  }, []);

  return (
    <div className="flex size-full justify-center gap-x-6 bg-gray-100">
      <canvas ref={canvasRef} className="bg-gray-400" />
      <canvas ref={networkCanvasRef} className="w-[300px] bg-gray-600" />
    </div>
  );
}

export default Index;

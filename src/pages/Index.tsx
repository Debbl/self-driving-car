import { useEffect, useRef } from "react";
import { Car } from "~/components/Car";
import { Road } from "~/components/Road";

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;

    canvas.width = 200;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d")!;

    const road = new Road(canvas.width / 2, canvas.width * 0.9);
    const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
    const traffic = [new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)];

    animate();

    function animate() {
      traffic.forEach((car) => {
        car.update(road.borders, []);
      });

      car.update(road.borders, traffic);
      canvas.height = window.innerHeight;

      ctx.save();
      ctx.translate(0, -car.y + canvas.height * 0.7);
      road.draw(ctx);
      traffic.forEach((car) => car.draw(ctx, "red"));
      car.draw(ctx);
      ctx.restore();

      requestAnimationFrame(animate);
    }
  }, []);

  return (
    <div className="flex size-full justify-center bg-gray-100">
      <canvas ref={canvasRef} className="bg-gray-400"></canvas>
    </div>
  );
}

export default Index;

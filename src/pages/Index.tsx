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
  }, []);

  return (
    <div className="flex size-full justify-center">
      <canvas ref={canvasRef} className="bg-gray-400"></canvas>
    </div>
  );
}

export default Index;

import { useEffect, useRef } from "react";

/**
 * execute callback with requestAnimationFrame onMounted
 * @param cb onMounted callback and need to return animation callback
 */
function useRequestAnimationFrame(cb: () => FrameRequestCallback) {
  const requestId = useRef<number | null>(null);

  useEffect(() => {
    const animation = cb();

    const loop: FrameRequestCallback = (time) => {
      animation(time);
      requestId.current = requestAnimationFrame(loop);
    };

    requestId.current = requestAnimationFrame(loop);

    return () => {
      if (requestId.current) {
        cancelAnimationFrame(requestId.current);
      }
    };
  }, []);
}

export { useRequestAnimationFrame };

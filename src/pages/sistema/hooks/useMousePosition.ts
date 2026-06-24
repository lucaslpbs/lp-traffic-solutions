import { useState, useCallback } from "react";

export function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    setMouse({
      x: ((e.clientX - innerWidth / 2) / innerWidth) * -16,
      y: ((e.clientY - innerHeight / 2) / innerHeight) * -16,
    });
  }, []);

  return { mouse, handleMouseMove };
}

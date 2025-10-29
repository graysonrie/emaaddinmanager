import { useEffect, useRef } from "react";

export default function useInterval(callback: any, delay: any) {
  const savedCallback = useRef<any>(null);

  // Remember the latest callback if it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return; // Allows pausing by passing null
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

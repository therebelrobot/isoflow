import { useEffect, useState, useCallback } from "react";

interface MouseCoords {
  x: number;
  y: number;
}

interface MousePosition {
  position: MouseCoords;
  delta: MouseCoords | null;
}

type _MouseEvent = (e: MousePosition) => void;

interface MouseEvents {
  onMouseMove: _MouseEvent;
  onMouseDown: _MouseEvent;
  onMouseUp: _MouseEvent;
  onMouseEnter: _MouseEvent;
  onMouseLeave: _MouseEvent;
}

const getOffset = (domEl?: HTMLElement) => {
  if (!domEl)
    return {
      top: 0,
      left: 0,
    };

  const box = domEl.getBoundingClientRect();

  const body = document.body;
  const docEl = document.documentElement;

  const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const clientLeft = docEl.clientLeft || body.clientLeft || 0;

  const top = box.top + scrollTop - clientTop;
  const left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left) };
};

export const useMouseInput = () => {
  const [domEl, setDomEl] = useState<HTMLDivElement>();
  const [callbacks, setCallbacks] = useState<MouseEvents>();

  const mouseEventToCoords = useCallback(
    (e: MouseEvent) => {
      const offset = getOffset(domEl);

      return {
        x: e.clientX - offset.left + window.scrollX,
        y: e.clientY - offset.top + window.scrollY,
      };
    },
    [domEl]
  );

  const parseMousePosition = useCallback(
    (e: MouseEvent, mousedown: MouseCoords | null) => {
      const current = mouseEventToCoords(e);
      const delta = mousedown
        ? {
            x: current.x - mousedown.x,
            y: current.y - mousedown.y,
          }
        : null;

      return {
        position: { x: current.x, y: current.y },
        delta,
      };
    },
    [mouseEventToCoords]
  );

  useEffect(() => {
    if (!callbacks || !domEl) return;

    let lastPosition: MouseCoords | null = null;

    const onMouseDown = (e: MouseEvent) => {
      callbacks.onMouseDown(parseMousePosition(e, lastPosition));
      lastPosition = mouseEventToCoords(e);
    };

    const onMouseUp = (e: MouseEvent) => {
      callbacks.onMouseUp(parseMousePosition(e, lastPosition));
      lastPosition = mouseEventToCoords(e);
    };

    const onMouseMove = (e: MouseEvent) => {
      callbacks.onMouseMove(parseMousePosition(e, lastPosition));
      lastPosition = mouseEventToCoords(e);
    };

    const onMouseEnter = (e: MouseEvent) => {
      callbacks.onMouseEnter(parseMousePosition(e, lastPosition));
      lastPosition = mouseEventToCoords(e);
    };

    const onMouseLeave = (e: MouseEvent) => {
      callbacks.onMouseLeave(parseMousePosition(e, lastPosition));
      lastPosition = mouseEventToCoords(e);
    };

    domEl.addEventListener("mousemove", onMouseMove);
    domEl.addEventListener("mousedown", onMouseDown);
    domEl.addEventListener("mouseup", onMouseUp);
    domEl.addEventListener("mouseenter", onMouseEnter);
    domEl.addEventListener("mouseleave", onMouseLeave);

    return () => {
      domEl.removeEventListener("mousemove", onMouseMove);
      domEl.removeEventListener("mousedown", onMouseDown);
      domEl.removeEventListener("mouseup", onMouseUp);
      domEl.removeEventListener("mouseenter", onMouseEnter);
      domEl.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [callbacks, domEl]);

  return { setCallbacks, setDomEl };
};

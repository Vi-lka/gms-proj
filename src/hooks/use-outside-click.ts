"use client"

import React from "react";

const useOutsideClick = (time: number, callback?: () => void, ) => {
  const [action, setAction] = React.useState<null | "click" | "longpress">(null);

  const ref = React.useRef<HTMLDivElement>(null);

  const timerRef = React.useRef<NodeJS.Timeout>(null);
  const isLongPress = React.useRef(false);

  React.useEffect(() => {
    function startPressTimer() {
      isLongPress.current = false;
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        setAction('longpress');
      }, time)
    }

    const handleClick = (event: Event) => {
      if (!isLongPress.current && callback && !ref.current?.contains(event.target as Node)) {
        callback();
      }
      setAction('click')
    }
    
    const handleOnMouseDown = () => {
      startPressTimer();
    }
    
    function handleOnMouseUp() {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    
    function handleOnTouchStart() {
      startPressTimer();
    }
    
    function handleOnTouchEnd(event: Event) {
      if (!isLongPress.current && callback && !ref.current?.contains(event.target as Node)) {
        callback();
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mousedown', handleOnMouseDown, true);
    document.addEventListener('mouseup', handleOnMouseUp, true);
    document.addEventListener('touchstart', handleOnTouchStart, true);
    document.addEventListener('touchend', handleOnTouchEnd, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousedown', handleOnMouseDown, true);
      document.removeEventListener('mouseup', handleOnMouseUp, true);
      document.removeEventListener('touchstart', handleOnTouchStart, true);
      document.removeEventListener('touchend', handleOnTouchEnd, true);
    };
  }, [action, callback, ref, time]);

  return ref;
};

export default useOutsideClick;
import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from './utils';

const Timer = ({ onTimerComplete, timers, dynamicColor, onTimeUpdate }) => {
  const [seconds, setSeconds] = useState(timers);
  const timerIntervalRef = useRef();

  useEffect(() => {
    setSeconds(timers);
    // alert(timers);
  }, [timers]);

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevSeconds) => {
          const updatedSeconds = prevSeconds - 1;
          onTimeUpdate(updatedSeconds); // Pass the updated seconds to the parent
          return updatedSeconds;
        });
      }
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [seconds, onTimeUpdate]);

  useEffect(() => {
    if (seconds === 0) {
      console.log('Timer completed!');
      clearInterval(timerIntervalRef.current);
      onTimerComplete();
    }
  }, [seconds]);

  return (
    <>
      <div className="time-label">
        <b style={{ marginRight: '10px' }}>Time Left</b> 
        <span className="timer" style={{ backgroundColor: dynamicColor }}>
          {formatTime(seconds)} hrs
        </span>
      </div>
    </>
  );
};

export default Timer;

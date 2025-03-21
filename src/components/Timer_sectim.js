import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from './utils';

const Timer = ({ onTimerComplete, timers, dynamicColor, onTimeUpdate, totalSections, currentSection }) => {
  const [seconds, setSeconds] = useState(timers); // Timer state
  const timerIntervalRef = useRef();

  // Update the timer when `timers` prop changes
  useEffect(() => {
    setSeconds(timers);
  }, [timers]);

  // Timer countdown logic
  useEffect(() => {
    if (seconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          const updatedSeconds = prevSeconds - 1;
          onTimeUpdate(updatedSeconds); // Notify the parent
          return updatedSeconds;
        });
      }, 1000);
    }

    return () => clearInterval(timerIntervalRef.current); // Cleanup
  }, [seconds, onTimeUpdate]);

  // Handle timer completion
  useEffect(() => {
    if (seconds === 0) {
      clearInterval(timerIntervalRef.current);

      if (currentSection < totalSections+4) {
        onTimerComplete('next'); // Trigger next section
      } else {
        onTimerComplete('submit'); // Trigger submission
      }
    }
  }, [seconds, currentSection, totalSections, onTimerComplete]);

  return (
    <>
      <span className="time-label">
        <b style={{ marginRight: '10px' }}>Time Left</b>
        <span className="timer" style={{ backgroundColor: dynamicColor }}>
          {formatTime(seconds)} hrs
        </span>
      </span>
    </>
  );
};

export default Timer;

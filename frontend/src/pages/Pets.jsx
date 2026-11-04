import { useState, useRef, useEffect } from 'react';
import firstImage from '/temp_pet.gif';
import secondImage from '/temp_pet02.gif';
import thirdImage from '/temp_petsad.gif';


const gifDuration = 2000;
const gifDuration2 = 5000;

export default function Pets() {
  const [src, setSrc] = useState(firstImage);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Clean up pending timeouts on unmount
  useEffect(() => clearTimers, []);

  const handleClick = () => {
    // Cancel timers from any previous click so they don't override this one
    clearTimers();

    if (src === firstImage) {
      setSrc(secondImage);
      timers.current.push(setTimeout(() => setSrc(firstImage), gifDuration));
    } else {
      setSrc(firstImage);
    }

    timers.current.push(setTimeout(() => setSrc(thirdImage), gifDuration2));
  };

  return (
    <div>
      <h1>Pet</h1>
      <p>Click to Interact</p>
      <img
        src={src}
        alt="Click to play"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}

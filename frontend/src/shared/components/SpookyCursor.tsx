import { useEffect, useState } from 'react';
import './SpookyCursor.css';

const SpookyCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updatePosition);

    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  // Lag effect for the trailing skeleton
  useEffect(() => {
    let animationFrameId: number;

    const animateTrail = () => {
      setTrailPosition((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        
        // Adjust speed (0.1 is slow/heavy, 0.5 is fast)
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      animationFrameId = requestAnimationFrame(animateTrail);
    };

    animationFrameId = requestAnimationFrame(animateTrail);

    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  return (
    <>
      <div 
        className="spooky-cursor-main"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
      >
        {/* Main Cursor: Ghostly Hand */}
        👻
      </div>
      
      <div 
        className="spooky-cursor-trail"
        style={{ 
          left: `${trailPosition.x}px`, 
          top: `${trailPosition.y}px` 
        }}
      >
        {/* Trailing: Hanging Skeleton */}
        <div className="hanging-rope"></div>
        <div className="skeleton-icon">☠️</div>
      </div>
    </>
  );
};

export default SpookyCursor;

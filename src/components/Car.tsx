import { CarColor } from '../types/simulation';

interface CarProps {
  position: { x: number; y: number };
  direction: 'north' | 'south' | 'east' | 'west';
  color: CarColor;
}

const CAR_COLORS = [
  'bg-slate-400',  // Silver
  'bg-zinc-900',   // Black
  'bg-white',      // White
  'bg-red-600',    // Red
  'bg-blue-600',   // Blue
  'bg-gray-400',   // Gray
  'bg-emerald-600' // Green
] as const;

export function Car({ position, direction, color }: CarProps) {
  const rotation = {
    north: 'rotate-180',
    south: 'rotate-0',
    east: 'rotate-270',
    west: 'rotate-90'
  }[direction];

  return (
    <div 
      className={`absolute ${rotation} transition-all duration-300`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) ${rotation === 'rotate-0' ? '' : rotation === 'rotate-180' ? 'rotate(180deg)' : rotation === 'rotate-90' ? 'rotate(90deg)' : 'rotate(270deg)'}`
      }}
    >
      <div className="relative">
        {/* Car body */}
        <div className={`w-4 h-6 ${color} rounded-[2px] shadow-sm`}>
          {/* Windshield */}
          <div className="absolute top-[2px] left-[2px] right-[2px] h-[1px] bg-sky-200 opacity-50" />
          {/* Rear window */}
          <div className="absolute bottom-[2px] left-[2px] right-[2px] h-[1px] bg-sky-200 opacity-50" />
        </div>
        {/* Wheels */}
        <div className="absolute -left-[1px] top-[1px] w-[1px] h-[1px] bg-gray-900 rounded-full" />
        <div className="absolute -right-[1px] top-[1px] w-[1px] h-[1px] bg-gray-900 rounded-full" />
        <div className="absolute -left-[1px] bottom-[1px] w-[1px] h-[1px] bg-gray-900 rounded-full" />
        <div className="absolute -right-[1px] bottom-[1px] w-[1px] h-[1px] bg-gray-900 rounded-full" />
      </div>
    </div>
  );
}

export { CAR_COLORS }; 
type LightColor = 'red' | 'yellow' | 'green';

interface TrafficLightProps {
  color: LightColor;
  direction: 'north' | 'south' | 'east' | 'west';
}

export function TrafficLight({ color, direction }: TrafficLightProps) {
  const isHorizontal = direction === 'east' || direction === 'west';

  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center p-2`}>
      <div className={`text-sm ${isHorizontal ? 'mr-1' : 'mb-1'} text-gray-300`}>{direction}</div>
      <div className={`bg-gray-800 p-1 rounded-lg flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-1`}>
        <div className={`w-6 h-6 rounded-full ${color === 'red' ? 'bg-red-500' : 'bg-red-900'}`} />
        <div className={`w-6 h-6 rounded-full ${color === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-900'}`} />
        <div className={`w-6 h-6 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-green-900'}`} />
      </div>
    </div>
  );
} 
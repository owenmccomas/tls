export type Direction = 'north' | 'south' | 'east' | 'west';
export type LightColor = 'red' | 'yellow' | 'green';
export type CarColor = 
  | 'bg-slate-400'
  | 'bg-zinc-900'
  | 'bg-white'
  | 'bg-red-600'
  | 'bg-blue-600'
  | 'bg-gray-400'
  | 'bg-emerald-600';

export interface CarState {
  id: string;
  position: { x: number; y: number };
  direction: Direction;
  hasPassedIntersection: boolean;
  color: CarColor;
}

export interface IntersectionState {
  lights: Record<Direction, LightColor>;
  cars: CarState[];
}
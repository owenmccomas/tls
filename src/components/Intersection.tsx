import { useEffect, useState, useRef } from 'react';
import { TrafficLight } from './TrafficLight';
import { Car } from './Car';
import {
  Direction,
  LightColor,
  CarState,
  IntersectionState,
  CarColor,
} from '../types/simulation';
import { CAR_COLORS } from './Car';

const INTERSECTION_SIZE = 400;
const SPAWN_INTERVAL = 3000;
const CAR_SPEED = 2; // pixels per update
const GREEN_LIGHT_DURATION = 10000; // 10 seconds
const YELLOW_LIGHT_DURATION = 3000; // 3 seconds
const CAR_LENGTH = 24; // 6px height of car
const CAR_BOUNDARY = CAR_LENGTH * 1.5; // 1.5 car lengths for spacing
const SAFE_DISTANCE = (YELLOW_LIGHT_DURATION / 50) * CAR_SPEED; // 120 pixels

const STOP_LINES = {
  north: 240, // Aligned with the horizontal road's bottom edge
  south: 160, // Aligned with the horizontal road's top edge
  east: 240,  // Aligned with the vertical road's right edge
  west: 200,  // Aligned with the vertical road's left edge
};

export function Intersection() {
  const [state, setState] = useState<IntersectionState>({
    lights: {
      north: 'red',
      south: 'red',
      east: 'green',
      west: 'green',
    },
    cars: [],
  });

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const spawnCar = () => {
    const directions: Direction[] = ['north', 'south', 'east', 'west'];
    const direction =
      directions[Math.floor(Math.random() * directions.length)]!;
    const color =
      CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)] as CarColor;

    const spawnPosition = getSpawnPosition(direction);
    const isSpawnBlocked = stateRef.current.cars.some(car => {
      if (car.direction !== direction) return false;

      if (direction === 'north' || direction === 'south') {
        if (Math.abs(spawnPosition.x - car.position.x) > 1) return false;
        const distance = Math.abs(spawnPosition.y - car.position.y);
        return distance < CAR_BOUNDARY + CAR_LENGTH / 2;
      } else {
        if (Math.abs(spawnPosition.y - car.position.y) > 1) return false;
        const distance = Math.abs(spawnPosition.x - car.position.x);
        return distance < CAR_BOUNDARY + CAR_LENGTH / 2;
      }
    });

    if (isSpawnBlocked) return;

    const newCar: CarState = {
      id: Math.random().toString(36),
      direction,
      color,
      hasPassedIntersection: false,
      position: spawnPosition,
    };

    setState(prev => ({
      ...prev,
      cars: [...prev.cars, newCar],
    }));
  };

  const getSpawnPosition = (direction: Direction): { x: number; y: number } => {
    switch (direction) {
      case 'north':
        return { x: INTERSECTION_SIZE / 2 + 10, y: INTERSECTION_SIZE + 20 };
      case 'south':
        return { x: INTERSECTION_SIZE / 2 - 10, y: -20 };
      case 'east':
        return { x: INTERSECTION_SIZE + 20, y: INTERSECTION_SIZE / 2 + 10 };
      case 'west':
        return { x: -20, y: INTERSECTION_SIZE / 2 - 10 };
    }
  };

  const updateCarPositions = () => {
    setState(prev => ({
      ...prev,
      cars: prev.cars
        .map(car => {
          const canMove = shouldCarMove(car, prev.lights[car.direction]);
          if (!canMove) return car;

          const newPosition = getNewPosition(car);
          const isOutOfBounds = checkOutOfBounds(newPosition);

          if (isOutOfBounds) {
            return null;
          }

          if (isCarTooClose(car, newPosition)) {
            return car;
          }

          return {
            ...car,
            position: newPosition,
            hasPassedIntersection: hasPassedIntersection(
              car.direction,
              newPosition
            ),
          };
        })
        .filter((car): car is CarState => car !== null),
    }));
  };

  const shouldCarMove = (car: CarState, lightColor: LightColor): boolean => {
    const stopLine = STOP_LINES[car.direction];
    const carPos = car.position;

    switch (car.direction) {
      case 'north':
        if (lightColor === 'green') return true;
        if (lightColor === 'yellow') {
          const distance = carPos.y - CAR_LENGTH / 2 - stopLine;
          return distance > SAFE_DISTANCE;
        }
        return carPos.y - CAR_LENGTH / 2 > stopLine;
      case 'south':
        if (lightColor === 'green') return true;
        if (lightColor === 'yellow') {
          const distance = stopLine - (carPos.y + CAR_LENGTH / 2);
          return distance > SAFE_DISTANCE;
        }
        return carPos.y + CAR_LENGTH / 2 < stopLine;
      case 'east':
        if (lightColor === 'green') return true;
        if (lightColor === 'yellow') {
          const distance = stopLine - (carPos.x - CAR_LENGTH / 2);
          return distance > SAFE_DISTANCE;
        }
        return carPos.x - CAR_LENGTH / 2 > stopLine;
      case 'west':
        if (lightColor === 'green') return true;
        if (lightColor === 'yellow') {
          const distance = (carPos.x + CAR_LENGTH / 2) - stopLine;
          return distance > SAFE_DISTANCE;
        }
        return carPos.x + CAR_LENGTH / 2 < stopLine;
    }
  };

  const getNewPosition = (car: CarState): { x: number; y: number } => {
    let nextPos = { ...car.position };

    switch (car.direction) {
      case 'south':
        nextPos.y += CAR_SPEED;
        break;
      case 'north':
        nextPos.y -= CAR_SPEED;
        break;
      case 'east':
        nextPos.x -= CAR_SPEED;
        break;
      case 'west':
        nextPos.x += CAR_SPEED;
        break;
    }

    const stopLine = STOP_LINES[car.direction];
    const lightColor = stateRef.current.lights[car.direction];

    if (lightColor !== 'green') {
      switch (car.direction) {
        case 'south':
          if (nextPos.y + CAR_LENGTH / 2 > stopLine) {
            nextPos.y = stopLine - CAR_LENGTH / 2;
          }
          break;
        case 'north':
          if (nextPos.y - CAR_LENGTH / 2 < stopLine) {
            nextPos.y = stopLine + CAR_LENGTH / 2;
          }
          break;
        case 'east':
          if (nextPos.x - CAR_LENGTH / 2 < stopLine) {
            nextPos.x = stopLine + CAR_LENGTH / 2;
          }
          break;
        case 'west':
          if (nextPos.x + CAR_LENGTH / 2 > stopLine) {
            nextPos.x = stopLine - CAR_LENGTH / 2;
          }
          break;
      }
    }

    return nextPos;
  };

  const hasPassedIntersection = (
    direction: Direction,
    position: { x: number; y: number }
  ): boolean => {
    const center = INTERSECTION_SIZE / 2;
    switch (direction) {
      case 'north':
        return position.y < center;
      case 'south':
        return position.y > center;
      case 'east':
        return position.x < center;
      case 'west':
        return position.x > center;
    }
  };

  const checkOutOfBounds = (position: { x: number; y: number }): boolean => {
    const buffer = 50;
    return (
      position.x < -buffer ||
      position.x > INTERSECTION_SIZE + buffer ||
      position.y < -buffer ||
      position.y > INTERSECTION_SIZE + buffer
    );
  };

  const isCarTooClose = (
    car: CarState,
    newPosition: { x: number; y: number }
  ): boolean => {
    return stateRef.current.cars.some(otherCar => {
      if (car.id === otherCar.id) return false;
      if (car.direction !== otherCar.direction) return false;

      if (car.direction === 'north' || car.direction === 'south') {
        if (Math.abs(car.position.x - otherCar.position.x) > 1) return false;

        const distance = Math.abs(newPosition.y - otherCar.position.y);

        if (car.hasPassedIntersection && otherCar.hasPassedIntersection) {
          return distance < CAR_BOUNDARY + CAR_LENGTH / 2;
        }

        return distance < CAR_BOUNDARY;
      } else {
        if (Math.abs(car.position.y - otherCar.position.y) > 1) return false;

        const distance = Math.abs(newPosition.x - otherCar.position.x);

        if (car.hasPassedIntersection && otherCar.hasPassedIntersection) {
          return distance < CAR_BOUNDARY + CAR_LENGTH / 2;
        }

        return distance < CAR_BOUNDARY;
      }
    });
  };

  const changeLights = () => {
    setState(prev => ({
      ...prev,
      lights: Object.fromEntries(
        Object.entries(prev.lights).map(([direction, color]) => [
          direction,
          color === 'green' ? 'yellow' : color,
        ])
      ) as Record<Direction, LightColor>,
    }));

    setTimeout(() => {
      setState(prev => {
        const northSouthWasRed = prev.lights.north === 'red';
        return {
          ...prev,
          lights: {
            north: northSouthWasRed ? 'green' : 'red',
            south: northSouthWasRed ? 'green' : 'red',
            east: northSouthWasRed ? 'red' : 'green',
            west: northSouthWasRed ? 'red' : 'green',
          },
        };
      });
    }, YELLOW_LIGHT_DURATION);
  };

  useEffect(() => {
    const lightInterval = setInterval(() => {
      changeLights();
    }, GREEN_LIGHT_DURATION + YELLOW_LIGHT_DURATION);

    const spawnInterval = setInterval(spawnCar, SPAWN_INTERVAL);
    const moveInterval = setInterval(updateCarPositions, 50);

    return () => {
      clearInterval(lightInterval);
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, []);

  return (
    <div className="relative w-[400px] h-[400px] bg-gray-800">
      {/* Road markings */}
      <div className="absolute left-[180px] top-0 bottom-0 w-[40px] bg-gray-600" />
      <div className="absolute top-[180px] left-0 right-0 h-[40px] bg-gray-600" />

      {/* Road lines */}
      <div className="absolute left-[198px] top-0 bottom-0 w-[4px] bg-yellow-400 dashed-line" />
      <div className="absolute top-[198px] left-0 right-0 h-[4px] bg-yellow-400 dashed-line" />

      {/* Red stop lines */}
      {/* North Stop Line */}
      <div className="absolute left-[180px] top-[160px] w-[40px] h-[2px] bg-white" />
      {/* South Stop Line */}
      <div className="absolute left-[180px] bottom-[160px] w-[40px] h-[2px] bg-white" />
      {/* East Stop Line */}
      <div className="absolute left-[160px] top-[180px] h-[40px] w-[2px] bg-white" />
      {/* West Stop Line */}
      <div className="absolute right-[160px] top-[180px] h-[40px] w-[2px] bg-white" />

      {/* Traffic Lights */}
      <div className="absolute top-2 right-[140px]">
        <TrafficLight color={state.lights.north} direction="north" />
      </div>
      <div className="absolute bottom-2 left-[140px]">
        <TrafficLight color={state.lights.south} direction="south" />
      </div>
      <div className="absolute top-[140px] left-2">
        <TrafficLight color={state.lights.west} direction="west" />
      </div>
      <div className="absolute top-[220px] right-2">
        <TrafficLight color={state.lights.east} direction="east" />
      </div>

      {/* Cars */}
      {state.cars.map(car => (
        <Car
          key={car.id}
          position={car.position}
          direction={car.direction}
          color={car.color}
        />
      ))}
    </div>
  );
}
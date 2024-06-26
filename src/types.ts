import type { Car } from "./components/Car";

export interface Position {
  x: number;
  y: number;
}

export type Ray = [Position, Position];

export type Line = [Position, Position];

export interface Reading {
  x: number;
  y: number;
  offset: number;
}

export type Polygon = Position[];

export type Traffic = Car[];

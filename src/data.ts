import type { Unit, UnitStub } from "./types";
import unitList from "../data/term-1/units.json";

// Every data/term-N/unit-NN.json file is picked up automatically.
const files = import.meta.glob<Unit>("../data/term-*/unit-*.json", { eager: true, import: "default" });

const units = new Map<number, Unit>();
for (const u of Object.values(files)) units.set(u.unit, u);

export const allUnits: UnitStub[] = unitList;
export const getUnit = (n: number): Unit | undefined => units.get(n);
export const readyUnits = (): Unit[] => [...units.values()].sort((a, b) => a.unit - b.unit);

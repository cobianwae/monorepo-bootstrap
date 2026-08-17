import type { Prisma } from '../../generated/prisma/client.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function asNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

export type JsonObject = Prisma.JsonObject;
export type JsonArray = Prisma.JsonArray;
export type JsonValue = Prisma.JsonValue;
export type InputJsonValue = Prisma.InputJsonValue;

export function jsonValue(value: unknown): InputJsonValue {
  return value as InputJsonValue;
}
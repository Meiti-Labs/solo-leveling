import type { Table } from "dexie";
import type {
  CreateEntity,
  EntityId,
  TimestampedEntity,
  UpdateEntity,
} from "./types";

const createId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export function createCrudService<T extends TimestampedEntity>(
  table: Table<T, EntityId>,
) {
  return {
    async list(): Promise<T[]> {
      return table.orderBy("updatedAt").reverse().toArray();
    },

    async get(id: EntityId): Promise<T | undefined> {
      return table.get(id);
    },

    async create(input: CreateEntity<T>): Promise<T> {
      const timestamp = now();
      const entity = {
        ...input,
        id: input.id ?? createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
      } as T;

      await table.add(entity);
      return entity;
    },

    async upsert(input: CreateEntity<T>): Promise<T> {
      const existing = input.id ? await table.get(input.id) : undefined;
      const timestamp = now();
      const entity = {
        ...existing,
        ...input,
        id: input.id ?? existing?.id ?? createId(),
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      } as T;

      await table.put(entity);
      return entity;
    },

    async update(id: EntityId, patch: UpdateEntity<T>): Promise<T> {
      const existing = await table.get(id);

      if (!existing) {
        throw new Error(`Entity not found: ${id}`);
      }

      const entity = {
        ...existing,
        ...patch,
        id,
        createdAt: existing.createdAt,
        updatedAt: now(),
      } as T;

      await table.put(entity);
      return entity;
    },

    async delete(id: EntityId): Promise<void> {
      await table.delete(id);
    },

    async clear(): Promise<void> {
      await table.clear();
    },
  };
}

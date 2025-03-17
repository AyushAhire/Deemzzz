import { type Dream, type InsertDream } from "@shared/schema";

export interface IStorage {
  getDreams(): Promise<Dream[]>;
  getDream(id: number): Promise<Dream | undefined>;
  createDream(dream: InsertDream): Promise<Dream>;
  likeDream(id: number): Promise<Dream>;
  addEncouragement(id: number): Promise<Dream>;
  getDreamByEmail(email: string): Promise<Dream | undefined>;
}

export class MemStorage implements IStorage {
  private dreams: Map<number, Dream>;
  private currentId: number;

  constructor() {
    this.dreams = new Map();
    this.currentId = 1;
  }

  async getDreams(): Promise<Dream[]> {
    return Array.from(this.dreams.values());
  }

  async getDream(id: number): Promise<Dream | undefined> {
    return this.dreams.get(id);
  }

  async getDreamByEmail(email: string): Promise<Dream | undefined> {
    return Array.from(this.dreams.values()).find(
      (dream) => dream.email === email
    );
  }

  async createDream(insertDream: InsertDream): Promise<Dream> {
    const id = this.currentId++;
    const dream: Dream = {
      ...insertDream,
      id,
      likes: 0,
      encouragements: 0,
    };
    this.dreams.set(id, dream);
    return dream;
  }

  async likeDream(id: number): Promise<Dream> {
    const dream = this.dreams.get(id);
    if (!dream) throw new Error("Dream not found");
    
    const updated = { ...dream, likes: dream.likes + 1 };
    this.dreams.set(id, updated);
    return updated;
  }

  async addEncouragement(id: number): Promise<Dream> {
    const dream = this.dreams.get(id);
    if (!dream) throw new Error("Dream not found");
    
    const updated = { ...dream, encouragements: dream.encouragements + 1 };
    this.dreams.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

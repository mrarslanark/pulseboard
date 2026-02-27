import { PulseEvent } from "./types";

export class EventQueue {
  private queue: PulseEvent[] = [];
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  enqueue(event: PulseEvent): void {
    if (this.queue.length >= this.maxSize) {
      this.queue.shift();
    }

    this.queue.push(event);
  }

  dequeue(count: number): PulseEvent[] {
    return this.queue.splice(0, count);
  }

  get size(): number {
    return this.queue.length;
  }

  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  clear(): void {
    this.queue = [];
  }
}

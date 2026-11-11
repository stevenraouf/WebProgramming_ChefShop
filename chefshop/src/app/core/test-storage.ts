export class MemoryStorage {
  values = new Map<string, unknown>();
  warning = () => '';
  read<T>(key: string, fallback: T, session = false): T {
    return this.values.has((session ? 's:' : 'l:') + key)
      ? (structuredClone(this.values.get((session ? 's:' : 'l:') + key)) as T)
      : fallback;
  }
  write(key: string, value: unknown, session = false): void {
    this.values.set((session ? 's:' : 'l:') + key, structuredClone(value));
  }
  remove(key: string, session = false): void {
    this.values.delete((session ? 's:' : 'l:') + key);
  }
  cookie(): void {}
  readCookie(): string {
    return '';
  }
}

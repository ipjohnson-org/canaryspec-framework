export function createEnv() {
  return {
    get(name: string): string | undefined {
      return (globalThis as Record<string, unknown>).__env_get
        ? ((globalThis as Record<string, unknown>).__env_get as (n: string) => string | undefined)(name)
        : undefined;
    },

    require(name: string): string {
      const value = this.get(name);
      if (value === undefined) {
        throw new Error(`Required environment variable '${name}' is not set`);
      }
      return value;
    },
  };
}

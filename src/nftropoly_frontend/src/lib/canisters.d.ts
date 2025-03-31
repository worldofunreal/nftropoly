declare module '$lib/canisters' {
  export const backend: {
    greet: (name: string) => Promise<string>;
    // Add other backend methods as needed
  };
} 
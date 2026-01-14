export function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T) {
  return (...args: Parameters<T>) => callback(...args);
}

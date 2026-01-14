type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
type GetState<T> = () => T;

export default function create<T>() {
  return (initializer: (set: SetState<T>, get: GetState<T>, api: any) => T) => {
    const state = initializer(() => {}, () => state, {});
    const useStore = () => state;
    (useStore as any).getState = () => state;
    return useStore;
  };
}

const storage = new Map<string, string>();

globalThis.localStorage = {
  getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
  clear: () => {
    storage.clear();
  },
  key: (index: number) => Array.from(storage.keys())[index] ?? null,
  get length() {
    return storage.size;
  },
};

class MockMediaStream {}

globalThis.MediaStream = MockMediaStream as unknown as typeof MediaStream;

if (!HTMLCanvasElement.prototype.captureStream) {
  HTMLCanvasElement.prototype.captureStream = () => new MockMediaStream();
}

class MockMediaRecorder {
  public state: 'inactive' | 'recording' = 'inactive';
  public ondataavailable: ((event: { data: Blob }) => void) | null = null;
  public onstop: (() => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['test']) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }
}

globalThis.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;

if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = () => 'blob:mock';
}

if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = () => {};
}

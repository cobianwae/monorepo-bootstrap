class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

HTMLElement.prototype.scrollIntoView = () => undefined;

if (typeof globalThis.PointerEvent === 'undefined') {
  class MockPointerEvent extends MouseEvent {
    pointerId = 0;
    pointerType = 'mouse';
    isPrimary = true;
    width = 1;
    height = 1;
    pressure = 0.5;
    tiltX = 0;
    tiltY = 0;
    tangentialPressure = 0;
    twist = 0;

    constructor(type: string, params: MouseEventInit = {}) {
      super(type, params);
    }
  }
  globalThis.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;
}
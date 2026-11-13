type ScrollSubscriber = () => void;

const subscribers = new Set<ScrollSubscriber>();
let frame: number | null = null;

function notifySubscribers() {
  if (frame !== null) return;
  frame = window.requestAnimationFrame(() => {
    frame = null;
    for (const subscriber of subscribers) subscriber();
  });
}

export function subscribeToScroll(subscriber: ScrollSubscriber): () => void {
  subscribers.add(subscriber);
  if (subscribers.size === 1) {
    window.addEventListener("scroll", notifySubscribers, { passive: true });
    window.addEventListener("resize", notifySubscribers);
  }

  subscriber();

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) {
      window.removeEventListener("scroll", notifySubscribers);
      window.removeEventListener("resize", notifySubscribers);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    }
  };
}

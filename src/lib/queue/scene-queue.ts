// In-process generation queue keyed by scene ID.
// Works correctly on Railway (persistent Docker process).
// Jobs are lost on server restart — scenes remain PENDING and show as stalled in the UI.

const queue = new Map<string, Promise<void>>();

export function enqueueScene(sceneId: string, work: () => Promise<void>): void {
  const promise = work()
    .catch((err) => {
      console.error(`[scene-queue] scene=${sceneId} unhandled error:`, err);
    })
    .finally(() => {
      queue.delete(sceneId);
    });
  queue.set(sceneId, promise);
}

export function queueSize(): number {
  return queue.size;
}

export function isQueued(sceneId: string): boolean {
  return queue.has(sceneId);
}

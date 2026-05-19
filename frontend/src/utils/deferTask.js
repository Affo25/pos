/** Run after layout/paint — avoids ResizeObserver loop errors with Ant Design Modal + Select. */
export function deferTask(fn, delayMs = 50) {
  if (typeof fn !== 'function') return () => {};
  let id = null;
  id = window.setTimeout(() => {
    id = null;
    fn();
  }, delayMs);
  return () => {
    if (id != null) {
      window.clearTimeout(id);
      id = null;
    }
  };
}

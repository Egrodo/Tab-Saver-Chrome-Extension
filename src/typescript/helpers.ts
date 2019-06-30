export const debounce = (delay: number, fn: Function) => {
  let timerId;
  return (...args) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
};

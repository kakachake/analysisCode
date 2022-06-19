// 第六版 取消功能

const createAbortError = () => {
  const error = new Error("Delay aborted");
  error.name = "Abort Error";
  return error;
};

const createDelay =
  ({ willResolve }) =>
  (ms, { value, signal }) => {
    if (signal && signal.aborted) {
      return Promise.reject(createAbortError());
    }
    let timer, settle, rejectFn;

    const signalListener = () => {
      clearTimeout(timer);
      rejectFn(createAbortError());
    };

    // 移除监听器
    const cleanup = () => {
      if (signal) {
        signal.removeEventListener("abort", signalListener);
      }
    };

    const promise = new Promise((resolve, reject) => {
      settle = () => {
        cleanup();
        willResolve ? resolve(value) : reject(value);
      };
      timer = setTimeout(settle, ms);
      rejectFn = reject;
    });

    // 如果有signal，则添加监听
    if (signal) {
      signal.addEventListener("abort", signalListener, { once: true });
    }

    promise.clear = () => {
      clearTimeout(timer);
      timer = null;
      settle();
    };
    return promise;
  };

const delay = (() => {
  const delay = createDelay({ willResolve: true });
  delay.reject = createDelay({ willResolve: false });
  delay.range = (minNum, maxNum, options) =>
    delay(randomInteger(minNum, maxNum), options);
  return delay;
})();

// 使用
(async () => {
  const abortController = new AbortController();

  setTimeout(() => {
    abortController.abort();
  }, 500);

  try {
    await delay(1000, { signal: abortController.signal });
  } catch (error) {
    // 500 milliseconds later
    console.log(error.name);
    //=> 'AbortError'
  }
})();

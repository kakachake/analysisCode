// 第六版 取消功能

const createAbortError = () => {
  const error = new Error("Delay aborted");
  error.name = "Abort Error";
  return error;
};

const createDelay =
  ({ willResolve, clearTimeout: defaultClear, setTimeout: set }) =>
  (ms, { value, signal }) => {
    if (signal && signal.aborted) {
      return Promise.reject(createAbortError());
    }
    let timer, settle, rejectFn;

    const clear = defaultClear || clearTimeout;

    const signalListener = () => {
      clear(timer);
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
      timer = (set || setTimeout)(settle, ms);
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

const createWithTimers = (clearAndSet) => {
  const delay = createDelay({ ...clearAndSet, willResolve: true });
  delay.reject = createDelay({ ...clearAndSet, willResolve: false });
  delay.range = (minNum, maxNum, options) =>
    delay(randomInteger(minNum, maxNum), options);
  return delay;
};

//使用
const customDelay = createWithTimers({ clearTimeout, setTimeout });

(async () => {
  const result = await customDelay(100, { value: "最终版" });

  // Executed after 100 milliseconds
  console.log(result);
  // 最终版
})();

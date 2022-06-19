// 第一版
// 使用
(async () => {
  await delay1(1000);
  console.log("1秒后输出");
})();

// 实现
function delay1(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// 第二版 传递 value 参数作为结果
// 使用
(async () => {
  const result = await delay2(1000, { value: "这是第二版" });
  console.log("1秒后输出", result);
})();

function delay2(ms, { value }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}

// 第三版 willResolve 参数决定成功还是失败。
(async () => {
  try {
    const result = await delay3(1000, { value: "第三版", willResolve: false });
    console.log("不会输出这一句");
  } catch (error) {
    console.log("输出结果", error);
  }
})();

// 实现
function delay3(ms, { value, willResolve }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (willResolve ? resolve(value) : reject(value)), ms);
  });
}

// 第四版 一定时间范围内随机获得结果

const randomInteger = (minNum, maxNum) =>
  Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

const createDelay =
  ({ willResolve }) =>
  (ms, { value }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => (willResolve ? resolve(value) : reject(value)), ms);
    });
  };

const delay4 = (() => {
  const delay = createDelay({ willResolve: true });
  delay.reject = createDelay({ willResolve: false });
  delay.range = (minNum, maxNum, options) =>
    delay(randomInteger(minNum, maxNum), options);
  return delay;
})();

(async () => {
  try {
    const result = await delay4.reject(1000, {
      value: "第四版",
      willResolve: false,
    });
    console.log("永远不会输出这句");
  } catch (err) {
    console.log("输出结果", err);
  }
})();

(async () => {
  const result2 = await delay4.range(10, 2000, { value: "随机时间" });
  console.log("输出结果", result2);
})();

// 第五版 提前清除
// 使用

const createDelay5 =
  ({ willResolve }) =>
  (ms, { value }) => {
    let timer, settle;
    const promise = new Promise((resolve, reject) => {
      settle = () => (willResolve ? resolve(value) : reject(value));
      timer = setTimeout(settle, ms);
    });
    promise.clear = () => {
      clearTimeout(timer);
      timer = null;
      settle();
    };
    return promise;
  };

const delay5 = (() => {
  const delay = createDelay5({ willResolve: true });
  delay.reject = createDelay5({ willResolve: false });
  delay.range = (minNum, maxNum, options) =>
    delay(randomInteger(minNum, maxNum), options);
  return delay;
})();

(async () => {
  const delayedPromise = delay5(1000, { value: "我是若川" });

  setTimeout(() => {
    delayedPromise.clear();
  }, 300);

  // 300 milliseconds later
  console.log(await delayedPromise);
  //=> '我是若川'
})();

function CutePromise(executor) {
  // 记录异步任务成功的执行结果
  this.value = null;
  // 记录异步任务失败的失败原因
  this.reason = null;
  // 记录当前状态,初始值是pending
  this.status = 'pending';

  // 缓存两个队列，维护resolved和rejected各自对应的处理函数
  this.onResolvedQueue = [];
  this.onRejectedQueue = [];

  // 这里要使用闭包，先把this保存下来
  const self = this;
  // 定义resolve函数
  function resolve(value) {
    // 如果是pending状态，直接返回
    if (self.status !== 'pending') {
      return;
    }

    // 异步任务成功，把结果赋值给value
    self.value = value;
    // 当前状态变为fulfilled
    self.status = 'fulfilled';

    // 用setTimeout延迟队列的执行
    setTimeout(function() {
      // 批量执行resolved队列里的任务
      self.onResolvedQueue.forEach(resolved => {resolved(self.value)});
    })
  }

  // 定义reject函数
  function reject(reason) {
    // 如果是pending状态，直接返回
    if (self.status !== 'pending') {
      return;
    }

    // 异步任务失败时，把结果赋值给reason
    self.reason = reason;
    // 当前状态变为rejected
    self.status = 'rejected';

    // 用setTimeout延迟队列的执行
    setTimeout(function() {
      // 批量执行resolved队列里的任务
      self.onRejectedQueue.forEach(rejected => {rejected(self.value)});
    })
  }

  // 把resolve和reject能力赋予执行器
  executor(resolve, reject);
}

// then方法接收两个函数作为入参（可选）
CutePromise.prototype.then = function(onResolve, onReject) {
  // onResolve和onReject必须是函数，如果不是函数，此处用透传兜底
  if (typeof onResolve !== 'function') {
    onResolve = function(x) {
      return x;
    }
  }
  if (typeof onReject !== 'function') {
    onReject = function(e) {
      throw e;
    }
  }

  // 判断是否是fulfilled状态
  if (this.status === 'fulfilled') {
    onResolve(this.value);
  }
  if (this.status === 'rejected') {
      onReject(this.reason);
  }
  if (this.status === 'pending') {
    // 若是pending状态，则只对任务做入队处理
    this.onResolvedQueue.push(onResolved);
    this.onRejectedQueue.push(onRejected);
  }

  return this;
}

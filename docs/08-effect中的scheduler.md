# effect中的scheduler

 1. 通过effect第二个参数给定的一个scheduler的fn
 2. effect第一次执行 还会执行fn
 3. 当响应式对象 set update 不会执行fn 而是执行scheduler
 4. 如果当执行runner的时候，会再次执行fn

 ```js 

it('scheduler', () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
        run = runner
    })
    const obj = reactive({foo: 1})
    const runner = effect(
    () => {
        dummy = obj.foo
    },
    { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
});
 ```

 ## effect中的实现


 ```js
// 接收一个option参数，里面可能会含有scheduler
export function effect(fn, options: any = {}) {
    // 将scheduler 存储到当前的effect当中
    const _effect = new ReactiveEffect(fn, options.scheduler)    

    _effect.run()

    return _effect.run.bind(_effect)
}
 ```

```js
// 核心逻辑为，在trigger中判断是否有scheduler，如果有则不执行run，而是调用scheduler
for (const effect of dep) {
    if (effect.scheduler) {
        effect.scheduler()
    } else {
        effect.run()
    }
}
```
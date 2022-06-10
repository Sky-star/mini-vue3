# effect中的stop和onStop

## stop
stop功能既外部手动调用到stop函数后，响应式对象的值发生改变时，不会触发effect中的fn


```js
it('stop', () => {
    let dummy
    const obj = reactive({prop: 1})
    const runner = effect(() => {
        dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    // 由于当前的effec被删除了，所以响应式对象发生改变时不会再次出发这个effect
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)

    // 被stop的effect还是可以手动执行的
    runner()
    expect(dummy).toBe(3)
});
```
## 实现步骤

```js
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    
    extend(_effect, options)
    
    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    // 将当前的effect保存到runner当中
    runner.effect = _effect

    return runner
}
```

```js
class ReactiveEffect {
    private _fn: any
    // effect存储依赖列表
    deps = []
    // 防止外部多次调用stop时，重复删除
    active = true
    onStop?: () => void
    constructor(fn,public scheduler?) {
        this._fn = fn
    }
    
    run() {
        activeEffect = this
        return this._fn()
    }

    stop() {
        // 如果还没有被删除过则进入删除
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}


function cleanupEffect(effect) {
    // 遍历存储的所有依赖列表，将自身从列表中删除
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    });
}

// 读取响应式对象的属性时会走到track
export function track(target, key) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    // 为了保证在没有effect时不会发生错误
    if (!activeEffect) return
    
    dep.add(activeEffect)
    // 对当前dep进行反向收集，翻遍查找和删除
    activeEffect.deps.push(dep)
}
```

## onStop

onStop类似于scheduler,他相当于一个回调函数，在stop被执行后， onStop也会被执行一次

```js

it('onStop', () => {
    const obj = reactive({
        foo: 1
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(
        () => {
            dummy = obj.foo
        },
        {
            onStop
        }
    )

    stop(runner)
    expect(onStop).toBeCalledTimes(1)
});
```
```js

let activeEffect
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    // extend = Object.assign
    // 由于可能会有很多options，利用这个方法将所有的options保存在effect中
    extend(_effect, options)
    
    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}

// 核心逻辑
stop() {
    if (this.active) {
        cleanupEffect(this)
        // 在stop触发后，判断吃否传了onStop
        if (this.onStop) {
            // 执行onStop
            this.onStop()
        }
        this.active = false
    }
}

```
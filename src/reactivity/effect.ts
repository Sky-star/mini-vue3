class ReactiveEffect {
    private _fn: any
    // 将对应的依赖进行反向收集
    deps = []
    // 为了防止重复的进行停止监听，只进行一次就可以了
    active = true
    onStop?: () => void
    constructor(fn) {
        this._fn = fn
    }

    run() {
        // 第一次执行时需要将当前的effect保存下来
        activeEffect = this
        return this._fn()
    }

    stop() {
        if (this.active) {

            // 说是stop，实际就是将这个runner从dep中删除了
            this.deps.forEach((dep: any) => {
                dep.delete(this)
            })
            
            if (this.onStop) {
                this.onStop()
            }

            // 执行一次就可以了
            this.active = false
        }
    }
}

// 依赖收集工作，所谓的依赖收集就是将当前对应的target下的key中的effect保存起来
// 留着set被触发时再次执行
let activeEffect
const targetMap = new Map()
export function track(target, key) {
    // 构造一个存储target容器
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let map = depsMap.get(key)
    if (!map) {
        map = new Set()
        depsMap.set(key, map)
    }

    map.add(activeEffect)
    // 将当前的deps进行反向收集 方便日后删除使用
    activeEffect.deps.push(map)
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const map = depsMap.get(key)

    for (const effect of map) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

export function stop(runner) {
    runner.effect.stop()
}

export function effect(fn, options?) {

    // 创建一个effect对象
    const _effect = new ReactiveEffect(fn)

    // 将传进来的参数赋值给_effect
    Object.assign(_effect, options)

    // 执行一次fn方法
    _effect.run()

    // 如何将runner返回，将effect中run函数利用bind方法复制一份出来
    // bind() 方法创建一个新的函数，在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数的参数，供调用时使用
    const runner: any = _effect.run.bind(_effect)
    // 这是为了给stop使用的 将effect反向赋值给effect，从而能够不在监听
    runner.effect = _effect

    return runner
}
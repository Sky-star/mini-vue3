import { track, trigger } from "./effect"

export function reactive(obj) {
    // 响应式对象，用proxy执行代理，并在获取数据时做一些操作从而达到响应式的结果
    return new Proxy(obj, {
        // 这是一个捕捉器
        // Reflect基本能够匹配对象中对应的方法，并且不会存在this指向问题
        get(target,key) {
            // 返回对应的属性之后还能够进行一些其他操作
            const res = Reflect.get(target,key)
            // 这里进行依赖收集
            track(target,key)
            return res
        },
        set(target,key,value) {
            const res = Reflect.set(target,key,value)
            // 这里进行依赖触发
            trigger(target,key)
            return res
        } 
    })
}

export function readonly(obj) {
    return new Proxy(obj, {
        get(target,key) {
            const res = Reflect.get(target,key)
            return res
        },
        set(target,key,value) {
            return true
        } 
    })
}
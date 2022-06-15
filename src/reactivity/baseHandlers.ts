import { track, trigger } from "./effect"
import { ReactiveFlags } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }

        // 返回对应的属性之后还能够进行一些其他操作
        const res = Reflect.get(target, key)
        // 这里进行依赖收集
        if (!isReadonly) {
            track(target, key)
        }
        return res
    }
}

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        // 这里进行依赖触发
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = {
    get,
    set,
}


export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} can not set, because target is readonly`, target)
        return true
    },
}
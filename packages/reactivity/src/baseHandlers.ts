import { extend, isObject } from "@guide-mini-vue/shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }

        // 返回对应的属性之后还能够进行一些其他操作
        const res = Reflect.get(target, key)

        // 处理如果需要创建表层的响应式对象，不需要进行依赖收集
        if (shallow) {
            return res
        }

        // 处理嵌套对象能够保证子属性也是响应式的
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

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

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
})
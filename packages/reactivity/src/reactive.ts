import { isObject } from "../shared/index"
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}
export function reactive(obj) {
    // 响应式对象，用proxy执行代理，并在获取数据时做一些操作从而达到响应式的结果
    return createActiveObject(obj, mutableHandlers)
}

export function readonly(obj) {
    return createActiveObject(obj, readonlyHandlers)
}

export function shallowReadonly(obj) {
    return createActiveObject(obj, shallowReadonlyHandlers)
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value)
}

function createActiveObject(target: any, baseHandlers) {
    if (!isObject(target)) {
        console.warn("target ${target} 必须是一个对象");
        return target
    }
    return new Proxy(target, baseHandlers)
}

import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

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

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}

function createActiveObject(obj: any, baseHandlers) {
    return new Proxy(obj, baseHandlers)
}

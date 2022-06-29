import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // patch
    patch(vnode, container)
}

function patch(vnode, container) {
    // TODO 判断vnode 是不是一个element
    // 是 element 那么就应该处理element
    // processElement(vnode,container)
    // 去处理组件
    processComponent(vnode, container)
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}


function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)

    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container) {
    const subTree = instance.render()

    patch(subTree, container)
}


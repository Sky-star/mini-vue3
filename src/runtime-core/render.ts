import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container) {
    // patch
    patch(vnode, container)
}

function patch(vnode, container) {
    const { type, shapeFlag } = vnode
    switch (type) {
        case Fragment:
            processFragment(vnode, container)
            break;
        case Text:
            processText(vnode, container)
            break;
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container)
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                // 去处理组件
                processComponent(vnode, container)
            }
            break;
    }
}

function processText(vnode: any, container: any) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}

function processFragment(vnode: any, container: any) {
    // Implement
    mountChildren(vnode, container)
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = (vnode.el = document.createElement(vnode.type))

    const { children, props, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el)
    }

    for (const key in props) {
        const val = props[key]
        const isOn = (key: string) => /^on[A-Z]/.test(key)
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase()
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }
    }

    container.append(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container)
    });
}

function mountComponent(initialVNode: any, container) {
    const instance = createComponentInstance(initialVNode)

    setupComponent(instance)

    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance: any, initialVNode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)

    patch(subTree, container)

    // 在当前子节点挂载完毕之后将el赋值给组件的虚拟节点
    initialVNode.el = subTree.el
}



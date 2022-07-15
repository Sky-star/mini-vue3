import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container, parentComponent) {
    // patch
    patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent)
            break;
        case Text:
            processText(vnode, container)
            break;
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container, parentComponent)
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                // 去处理组件
                processComponent(vnode, container, parentComponent)
            }
            break;
    }
}

function processText(vnode: any, container: any) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}

function processFragment(vnode: any, container: any, parentComponent) {
    // Implement
    mountChildren(vnode, container, parentComponent)
}

function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
}

function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent)
}

function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = document.createElement(vnode.type))

    const { children, props, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el, parentComponent)
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

function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
        patch(v, container, parentComponent)
    });
}

function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)

    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance: any, initialVNode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)

    patch(subTree, container, instance)

    // 在当前子节点挂载完毕之后将el赋值给组件的虚拟节点
    initialVNode.el = subTree.el
}



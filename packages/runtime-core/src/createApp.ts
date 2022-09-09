import { createVNode } from "./vnode"

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // rootComponent -> vnode
                const vnode = createVNode(rootComponent)

                // 进行渲染操作
                render(vnode, rootContainer)
            }
        }
    }
}


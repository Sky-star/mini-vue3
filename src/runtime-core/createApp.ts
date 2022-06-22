import { render } from "./render"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先vnode
            // 所有的逻辑操作 都会基于 vnode做处理
            const vnode = createVnode(rootComponent)

            render(vnode, rootContainer)

        }
    }
}


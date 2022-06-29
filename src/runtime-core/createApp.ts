import { render } from "./render"
import { createVnode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // rootComponent -> vnode
            const vnode = createVnode(rootComponent)

            // 进行渲染操作
            render(vnode, rootContainer)
        }
    }
}


import { createVnode } from "./vnode"

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // rootComponent -> vnode
                const vnode = createVnode(rootComponent)

                // 进行渲染操作
                render(vnode, rootContainer)
            }
        }
    }
}


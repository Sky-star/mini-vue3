import { effect } from "@guide-mini-vue/reactivity"
import { EMPTY_OBJ } from "@guide-mini-vue/shared"
import { ShapeFlags } from "@guide-mini-vue/shared"
import { createComponentInstance, setupComponent } from "./component"
import { shouldUpdateComponent } from "./componentUpdateUtils"
import { createAppAPI } from "./createApp"
import { queueJobs } from "./scheduler"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {

    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText,
    } = options

    function render(vnode, container, parentComponent) {
        // patch
        patch(null, vnode, container, null, null)
    }

    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 去处理组件
                    processComponent(n1, n2, container, parentComponent, anchor)
                }
                break;
        }
    }

    function processText(n1, n2: any, container: any) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
        // Implement
        mountChildren(n2.children, container, parentComponent, anchor)
    }

    function processElement(n1, n2: any, container: any, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }

    function patchElement(n1: any, n2: any, container: any, parentComponent, anchor) {
        console.log("patchElement");
        console.log("n1", n1);
        console.log("n2", n2);
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = n2.el = n1.el

        patchChildren(n1, n2, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1, n2, container, parentComponent, anchor) {

        const prevShapeFlag = n1.shapeFlag
        const { shapeFlag } = n2
        const c1 = n1.children
        const c2 = n2.children

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 1.把老得children清空
                unmountChildren(n1.children)
                // 2.设置text
                hostSetElementText(container, c2)
            }

            if (c1 !== c2) {
                hostSetElementText(container, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, "")
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                // array diff array
                patchKeyedChldren(c1, c2, container, parentComponent, anchor)
            }

        }
    }

    function patchKeyedChldren(c1, c2, container, parentComponent, parentAnchor) {
        const l2 = c2.length
        let i = 0
        let e1 = c1.length - 1
        let e2 = l2 - 1

        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key
        }

        // 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }

            i++
        }

        // 右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }
            e1--
            e2--
        }

        // 新的比老得长
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            // 老的比新的多
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
            }
        } else {
            // 中间对比
            let s1 = i
            let s2 = i
            const toBePatched = e2 - s2 + 1
            let patched = 0
            const keyToNewIndexMap = new Map()
            const newIndexToOldIndexMap = new Array(toBePatched)
            let moved = false
            let maxNewIndexSoFar = 0
            for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

            // 建立映射表
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i]

                if (patched >= toBePatched) {
                    hostRemove(prevChild.el)
                    continue
                }

                let newIndex
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                } else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            newIndex = j
                            break
                        }
                    }
                }

                if (newIndex === undefined) {
                    hostRemove(prevChild.el)
                } else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else {
                        moved = true
                    }

                    newIndexToOldIndexMap[newIndex - s2] = i + 1
                    patch(prevChild, c2[newIndex], container, parentComponent, null)
                    patched++
                }
            }

            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            let j = increasingNewIndexSequence.length - 1

            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2
                const nextChild = c2[nextIndex]
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor)
                } else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor)
                    } else {
                        j--
                    }
                }
            }
        }


    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i];
            hostRemove(el)
        }
    }

    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]

                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }

            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }

        }
    }

    function processComponent(n1, n2: any, container: any, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor)
        } else {
            updateComponent(n1, n2)
        }
    }

    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component)
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2
            instance.update()
        } else {
            n2.el = n1.el
            instance.vnode = n2
        }
    }

    function mountElement(vnode: any, container: any, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type))

        const { children, props, shapeFlag } = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent, anchor)
        }

        for (const key in props) {
            const val = props[key]

            hostPatchProp(el, key, null, val)
        }

        hostInsert(el, container, anchor)
    }

    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor)
        });
    }

    function mountComponent(initialVNode: any, container, parentComponent, anchor) {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent))

        setupComponent(instance)

        setupRenderEffect(instance, initialVNode, container, anchor)
    }

    function setupRenderEffect(instance: any, initialVNode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {

                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy, proxy))

                patch(null, subTree, container, instance, anchor)

                // 在当前子节点挂载完毕之后将el赋值给组件的虚拟节点
                initialVNode.el = subTree.el

                instance.isMounted = true
            } else {

                const { next, vnode } = instance
                if (next) {
                    next.el = vnode.el

                    updateComponentPreRender(instance, next)
                }

                const { proxy } = instance
                const subTree = instance.render.call(proxy, proxy)
                const prevSubTree = instance.subTree

                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance, anchor)
            }
        }, {
            scheduler() {
                console.log("update-scheduler");
                queueJobs(instance.update)
            }
        })
    }

    return {
        createApp: createAppAPI(render)
    }

}

function updateComponentPreRender(instance: any, nextVNode: any) {
    instance.vnode = nextVNode
    instance.next = null
    instance.props = nextVNode.props
}

function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
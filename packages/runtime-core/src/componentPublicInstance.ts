import { hasOwn } from "../shared/index"

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
}


export const PublicInstanceHandlers = {

    get({ _: instance }, key) {
        //setupState
        const { setupState, props } = instance

        if (hasOwn(setupState, key)) {
            return setupState[key]
        } else if (hasOwn(props, key)) {
            return props[key]
        }

        // key -> $el
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
    }
}
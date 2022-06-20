import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
    private _value: any
    private _rawValue: any
    public dep
    constructor(value) {
        this._rawValue = value
        this._value = convert(value)

        this.dep = new Set()
    }

    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newValue) {

        // 如果相等则不会再次赋值以及出发effect
        if (hasChanged(this._rawValue, newValue)) {
            this._rawValue = newValue
            // 先修改value在执行trigger
            this._value = convert(newValue)
            triggerEffects(this.dep)
        }

    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}


function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}

export function ref(value) {
    return new RefImpl(value)
}
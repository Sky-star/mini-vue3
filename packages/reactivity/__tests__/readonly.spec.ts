import { isProxy, isReadonly, readonly } from "../reactive";

describe('readonly', () => {
    it('happy path', () => {
        // readonly 类似于reactive 但是不能被set
        const orginal = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(orginal)
        expect(wrapped).not.toBe(orginal)
        expect(wrapped.foo).toBe(1)
        expect(isReadonly(wrapped)).toBe(true)
        expect(isReadonly(orginal)).toBe(false)
        expect(isReadonly(wrapped.bar)).toBe(true)
        expect(isReadonly(orginal.bar)).toBe(false)
        expect(isProxy(wrapped)).toBe(true)
    });

    it('warn when call set', () => {
        console.warn = jest.fn()
        const user = readonly({ age: 10 })
        user.age = 11
        expect(console.warn)
    });
});
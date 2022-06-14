import { readonly } from "../reactive";

describe('readonly', () => {
    it('happy path', () => {
        // readonly 类似于reactive 但是不能被set
        const orginal = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(orginal)
        expect(wrapped).not.toBe(orginal)
        expect(wrapped.foo).toBe(1)
    });
});
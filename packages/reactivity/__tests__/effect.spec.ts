import { effect, stop } from "../src/effect";
import { reactive } from "../src/reactive";
import { vi } from "vitest"

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        })

        let nextAge
        effect(() => {
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)

        // update
        user.age++
        expect(nextAge).toBe(12)

    });

    it('should clean up effect when effect run', () => {
        const user = reactive({
            ok: true,
            text: 'test',
        })

        // 分支切换, 当user.ok = false时,user.text不论如何改变
        // 都不应该再次触发effect
        let count = 0
        effect(() => {
            const _ = user.ok ? user.text : 'not'
            count++
        })

        user.ok = false

        expect(count).toBe(2)

        user.text = 'test change'

        expect(count).toBe(2)

    });

    it('should support nest effect', () => {
        const obj = reactive({
            foo: 1,
            bar: 2,
        })

        let temp1, temp2

        effect(() => {
            console.log('effectFn 1');

            effect(() => {
                console.log('effectFn 2');
                temp2 = obj.bar
            })

            temp1 = obj.foo
        })

        obj.foo = 2
    });

    it('should return runner when call effect', () => {
        // 1. effect(fn) -> function(runner) -> fn -> return
        let foo = 10
        const runner = effect(() => {
            foo++
            return 'foo'
        })

        expect(foo).toBe(11)
        const r = runner()
        expect(foo).toBe(12)
        expect(r).toBe('foo')

    });

    it('scheduler', () => {
        // 1. 通过effect第二个参数给定的一个scheduler的fn
        // 2. effect第一次执行 还会执行fn
        // 3. 当响应式对象 set update 不会执行fn 而是执行scheduler
        // 4. 如果当执行runner的时候，会再次执行fn
        let dummy
        let run: any
        const scheduler = vi.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler }
        )
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        // should be called on first trigger
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        // should not run yet
        expect(dummy).toBe(1)
        // manually run
        run()
        // should have run
        expect(dummy).toBe(2)
    });

    it('stop', () => {
        let dummy
        const obj = reactive({ prop: 1 })
        const runner = effect(() => {
            dummy = obj.prop
        })
        obj.prop = 2
        expect(dummy).toBe(2)
        stop(runner)
        // obj.prop = 3
        // obj.prop ++ 测试不能通过的原因是再次触发了get，导致进行了依赖收集
        // 导致effect被再次执行，之前的stop就失效了
        obj.prop++
        expect(dummy).toBe(2)

        // stopped effect should still be manually callable
        runner()
        expect(dummy).toBe(3)
    });

    it('onStop', () => {
        const obj = reactive({
            foo: 1
        })
        const onStop = vi.fn()
        let dummy
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            {
                onStop
            }
        )

        stop(runner)
        expect(onStop).toBeCalledTimes(1)
    });
});
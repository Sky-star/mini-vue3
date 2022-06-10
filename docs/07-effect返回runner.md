# effect返回runner

effect返回runner能够实现手动调用以及接收到返回的值

```js

it('should return runner when call effect', () => {
    // 1. effect(fn) -> function(runner) -> fn -> return
    let foo = 10
    const runner = effect(() =>{
        foo++
        return 'foo'
    })

    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
});
```
## effect 中的具体实现

```js
export function effect(fn) {
    const _effect = new ReactiveEffect(fn)    

    _effect.run()
    // 通过bind创建一个新的函数，并将this指向_effect, 这样外部就能够手动调用
    return _effect.run.bind(_effect)
}
```

```js
class ReactiveEffect {
    private _fn: any
    constructor(fn) {
        this._fn = fn
    }
    
    run() {
        activeEffect = this
        // 将执行fn后的返回值返回出去，这样外部就能接收到了
        return this._fn()
    }
}
```

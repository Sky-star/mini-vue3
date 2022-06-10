# 为什么使用Reflect.get而不使用target.key

首先看下MDN中对Reflect中的说明

> receiver
如果target对象中指定了getter，receiver则为getter调用时的this值。

重点就在于receiver，接下来看下面的例子

```js
const people = {
    name: 'lalala',
    get value() {
        return this.name
    }
}

const proxy = new Proxy(people, {
    get(target, key, receiver) {
        return target[key]
    }
})

let man = { name: 'xixixi'}
man.__proto__ = proxy
console.log(man.name); // xixixi
console.log(man.value); // lalala

```

> 问题已经出现了，man.name = xixixi, 但是在man.value中却返回了lalala
原因: get value 中的 this 默认是people
结论：Proxy 中的get捕捉器不能使用target[key]进行返回，会导致this
指向的问题

**解决问题的方式就是receiver**

将上方的代码更改一下

```js
const people = {
    name: 'lalala',
    get value() {
        return this.name
    }
}

const proxy = new Proxy(people, {
    get(target, key, receiver) {
        // 使用Reflect进行返回，将this绑定为receiver
        return Reflect.get(target, key, receiver)
    }
})

let man = { name: 'xixixi'}
man.__proto__ = proxy
console.log(man.name); // xixixi
console.log(man.value); // xixixi

```

> 能够看出问题已经解决了，这就是使用Reflect而不适用target[key]的原因

#### 执行步骤
1. man.value 在自身中没有查寻到，向上查找到proxy
2. 触发get操作，被proxy拦截，get中的receiver指向调用者man
3. 调用Reflect.get，由于target中的value指定了getter，Reflect.get自动将调用的getter函数的this绑定到receiver，也就是man
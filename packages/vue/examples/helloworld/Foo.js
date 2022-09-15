import { h } from "../../dist/guide-mini-vue.esm.js"

export const Foo = {
	setup(props) {
		console.log(props)
	},
	render() {
		return h("div", {}, "foo: " + this.count)
	}
}

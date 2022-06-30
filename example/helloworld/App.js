import { h } from "../../lib/guide-mini-vue.esm.js"

export const App = {
	render() {
		window.self = this
		return h(
			"div",
			{
				id: "root",
				class: ["red", "hard"],
				onClick() {
					console.log("click")
				},
				onMousedown() {
					console.log("mouse down")
				}
			},
			"hi. " + this.msg
			// string
			// "hi, mini-vue"
			// [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
		)
	},

	setup() {
		return {
			msg: "mini-vue"
		}
	}
}

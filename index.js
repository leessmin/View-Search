// 搜索到的内容个数
let count;
// 下标
let index = 0;
// input输入的内容
let inputValue;
// 设置配置项
let setConfig = {
	// 是否开启大小写
	differentiate: false,
	// 是否开启全字匹配
	accuracy: false,
	// 是否开启正则表达式
	regular: false,
	// 是否开启选定内容中查找
	assignContent: false,
}
// 各配置项 处理 函数
let btnHandle = {
	// 区分大小写按钮
	differentiate() {
		setConfig.differentiate = (!setConfig.differentiate);
		options.caseSensitive = setConfig.differentiate;
		searchFun(inputValue, options, setConfig.regular, setConfig.assignContent);
	},
	// 全字匹配
	accuracy() {
		setConfig.accuracy = (!setConfig.accuracy);
		options.accuracy = setConfig.accuracy ? 'exactly' : 'partially'
		searchFun(inputValue, options, setConfig.regular, setConfig.assignContent);
	},
	// 正则表达式
	regular() {
		// 开启或关闭正则表达式
		setConfig.regular = (!setConfig.regular);
		// 调用搜索内容函数
		searchFun(inputValue, options, setConfig.regular, setConfig.assignContent);
	},
	// 在选定节点中查找
	assignContent() {
		// 开启或关闭选定节点中查找
		setConfig.assignContent = (!setConfig.assignContent);
		// 调用搜索内容函数
		searchFun(inputValue, options, setConfig.regular, setConfig.assignContent);
	}
}
// 定时器
let timer;
// 当前页面的信息
let currentTab = null

// 配置搜索配置项
let options = {
	"element": "mark",
	"className": "viewSearch-mark",
	"exclude": [],
	"separateWordSearch": true,
	// 精度    高exactly    低partially
	"accuracy": "partially",
	"diacritics": true,
	"synonyms": {},
	"iframes": false,
	"iframesTimeout": 5000,
	"acrossElements": false,
	"caseSensitive": false,
	"ignoreJoiners": false,
	"ignorePunctuation": [],
	"wildcards": "disabled",
	"each": function (node) {
		// node是标记的DOM元素
	},
	"filter": function (textNode, foundTerm, totalCounter, counter) {
		//textNode是包含找到的术语的文本节点
		//foundTerm是找到的搜索词
		//totalCounter是指示所有标记总数的计数器   在函数调用时
		// counter是指示已找到项的标记数的计数器
		return true; // 必须返回true或false
	},
	"noMatch": function (term) {
		// term是未找到的术语
	},
	done(counter) {
		// counter 是指示所有标记总数的计数器
		// 存储搜索到的个数
		count = counter;
		// return counter;
	},
	"debug": false,
	"log": window.console
};








// 搜索函数 注入的脚本
function searchScript(inputValue, options, regular, assign) {
	// 初始化mark插件
	let context;
	let instance;


	//初始化搜索内容
	context = document.querySelector("body");
	instance = new Mark(context)
	// 清除搜索的内容
	instance.unmark(options);


	// 判断是否开启选定节点中查找
	if (!assign) {
		// 未开启
		// 从页面中查找
		// console.log(assign);
		context = document.querySelector("body");
	} else {
		// 开启
		// 从用户选定的节点中查找
		context = window.getSelection().getRangeAt(0).commonAncestorContainer;
		// console.log(window.getSelection().getRangeAt(0).commonAncestorContainer);
	}

	instance = new Mark(context);

	// 用来接收 搜索到的内容个数
	let count = 0;

	// 配置options done方法  来接收count个数
	options.done = function (counter) {
		count = counter;
	}


	// 清除搜索的内容
	instance.unmark(options);

	// 判断是否开启正则表达式
	if (!regular) {
		// 未开启

		// 搜索内容
		instance.mark(inputValue, options);
	} else {
		// 开启

		// 利用正则表达式搜索内容
		instance.markRegExp(new RegExp(inputValue), options);
	}

	// 返回搜索到的个数
	return count;
}


// 定向内容 注入的脚本
function upAndDownScript(index) {
	let markBox = document.querySelectorAll('.viewSearch-mark');

	// 排他思想
	for (let i = 0; i < markBox.length; i++) {
		// 清空style
		markBox[i].removeAttribute('style');
	}

	// 更改样式
	markBox[index].style.backgroundColor = 'red';
	markBox[index].style.color = '#fff';



	// 获取元素相对body的位置 函数     解决：某些元素的位置为0的bug
	function getOffsetTopByBody(el) {
		let offsetTop = 0;
		while (el && el.tagName !== 'BODY') {
			offsetTop += el.offsetTop;
			el = el.offsetParent;
		}
		return offsetTop;
	}


	// 跟随元素的位置
	window.scrollTo(0, getOffsetTopByBody(markBox[index]) - 400);
}


// 定向内容
function upAndDown(index) {
	// 更新 第index项
	document.querySelector('.The-span').innerHTML = index;
	// 获取当前活动的页面
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		// console.log(tabs);
		let activeTab = tabs[0];
		// 向当前活动的页面注入脚本
		chrome.scripting.executeScript({
			target: { tabId: activeTab.id },
			func: upAndDownScript,
			args: [index - 1],
		})
	})
}


// 搜索内容函数
function searchFun(inputValue, options, regular, assign) {
	// 获取当前活动的页面
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		// console.log(tabs);
		let activeTab = tabs[0];
		// 向当前活动的页面注入脚本
		chrome.scripting.executeScript({
			target: { tabId: activeTab.id },
			func: searchScript,
			args: [inputValue, options, regular, assign],
		}, (injectionResults) => {

			// 执行完返回的结果
			for (const frameResult of injectionResults) {
				// 获取搜索到的个数
				count = frameResult.result;
			}

			// 判断是否找到内容
			if (count == 0) {
				// 没有找到东西
				// 显示 隐藏
				document.querySelector('#counter-span-box').style.display = 'none';
				document.querySelector('.not-found').style.display = 'block';
			} else {
				//#region
				// 找到内容
				// 将个数插入到页面
				//#endregion
				document.querySelector('.counter-span').innerHTML = count;
				// 下标清0
				index = 0;
				// 将总数插入页面
				document.querySelector('.The-span').innerHTML = index;
				// 显示 隐藏
				document.querySelector('.not-found').style.display = 'none'
				document.querySelector('#counter-span-box').style.display = 'block';
			}

		})
	})
}


window.addEventListener('DOMContentLoaded', () => {

	// 打开插件时注入mark插件和样式
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		// console.log(tabs);
		let activeTab = tabs[0];
		// 向当前活动的页面注入mark插件
		chrome.scripting.executeScript({
			target: { tabId: activeTab.id },
			files: ['./script/mark.min.js'],
		})
		// 向当前活动的页面注入样式
		chrome.scripting.insertCSS({
			target: { tabId: activeTab.id },
			files: ["./inject/inject.css"]
		});
	})



	// 打开插件后input输入框自动聚焦
	document.querySelector('input').focus();







	// 控制点击时的样式
	function controlStyle() {
		// 按钮点击 样式
		// 获取点击的按钮
		const btn = document.querySelectorAll('.btn');

		// 遍历按钮
		for (let i = 0; i < btn.length; i++) {
			// 依次绑定点击事件
			btn[i].addEventListener('click', function () {
				// 类名长度大于3 说明已经被点击 再次点击就取消点击
				if (this.classList.contains('btn-active')) {
					this.className = 'btn';
				} else {
					this.className = `${this.className} btn-active`;
				}

				CreateSearchStore().setBtnStatus()
			})
		}
	}
	controlStyle();








	// 存储仓库的节流
	let timerStore = null
	// 监听input的输入内容
	document.querySelector('input').addEventListener('input', function () {
		inputValue = this.value;
		// 清除定时器，节流
		clearTimeout(timer)
		clearTimeout(timerStore)
		timer = setTimeout(() => {
			// 调用搜索内容函数
			searchFun(inputValue, options, setConfig.regular, setConfig.assignContent);
		}, 500);

		// 延迟储存  节流
		timerStore = setTimeout(() => {

			// 判断是否存在内容  如果内容为空 不储存
			if (inputValue.length == 0) {
				return
			}

			// 储存数据
			CreateSearchStore().setItem(inputValue)
			// console.log("存储数据", inputValue);
		}, 3000)
	})



	// 选择上匹配项 的回调事件
	function upEvent() {
		// console.log(index);
		// 判断下标  禁止越界
		if (index <= 1) {
			index = count;
		} else {
			index--;
		}

		// 定向内容
		upAndDown(index);
	}

	// 选择下匹配项 的回调事件
	function downEvent() {
		// console.log(index);
		// 判断下标  禁止越界
		if (index >= count) {
			index = 1;
		} else {
			index++;
		}

		// 定向内容
		upAndDown(index);
	}

	// 监听上一个匹配项按钮
	document.querySelector('#up-btn').addEventListener("click", upEvent)

	// 监听下一个匹配项按钮
	document.querySelector('#down-btn').addEventListener("click", downEvent)


	// 监听键盘按键 达到快捷键效果
	window.addEventListener('keydown', function (event) {
		// 上按键
		if (event.code == 'ArrowUp') {
			// 调用上监听按钮回调事件
			upEvent();
		}

		// 下按键
		if (event.code == 'ArrowDown') {
			// 调用下监听按钮回调事件
			downEvent();
		}
	})







	// 监听区分大小写按钮
	document.querySelector('#differentiate').addEventListener('click', btnHandle.differentiate)



	// 监听全字匹配
	document.querySelector('#accuracy').addEventListener('click', btnHandle.accuracy)



	// 监听使用正则表达式
	document.querySelector('#regular').addEventListener('click', btnHandle.regular)



	// 监听使用在选定节点中查找
	document.querySelector('#assignContent').addEventListener('click', btnHandle.assignContent)



	// 监听关闭按钮
	document.querySelector('#clear').addEventListener('click', function () {
		// 关闭窗口
		window.close();
	})




	// 监听历史列表按钮
	document.querySelector("#historyList .history-list-btn").addEventListener('click', async function () {

		// 切换按钮的图标状态
		this.classList.toggle("history-list-btn-active")

		// 判断是否存在 history-list-btn-active 类名
		// 如果存在 类名 说明是需要展示历史数据
		if (this.classList.contains("history-list-btn-active")) {
			// 查询 历史列表记录
			let result = await CreateSearchStore().getItem()
			CreateHistoryListDom(result)
		} else {
			// 不存在 类名
			// 清空列表
			CreateHistoryListDom(null)
		}
	})
})




// 失去焦点 插件关闭，清空搜索内容
window.addEventListener('visibilitychange', function () {
	// 清空搜索
	searchFun('', options, setConfig.regular, setConfig.assignContent);
})



// 获取 tab
async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	// `tab` will either be a `tabs.Tab` instance or `undefined`.
	let [tab] = await chrome.tabs.query(queryOptions);
	currentTab = tab
	initSearchValue()
}

// 加载插件时 就 获取 标签页的信息
getCurrentTab()


// 初始化标签 获取历史内容
async function initSearchValue() {
	const result = await CreateSearchStore().getItem()

	// 判断历史内容是否存在,不存在则直接返回
	if (result.length === 0) {
		return
	}

	// 存在,将最新的内容存入搜索框
	document.querySelector("input").value = result[0];
	inputValue = result[0]

	// 获取按钮的状态
	CreateSearchStore().getBtnStatus()

	// 调用搜索内容函数
	searchFun(document.querySelector("input").value, options, setConfig.regular, setConfig.assignContent);
}


// 搜索内容仓库
class SearchStore {
	// 设置 仓库 key value
	async setItem(value) {
		// 获取仓库的数据
		const result = await this.getItem()

		// 即将储存的数据
		let data = []
		// 判断数据是否为空
		if (result != null) {
			// 数据不为空
			data = result
		}

		// 即将储存的数据是否大于10  如果大于10 第一个元素出栈
		if (data.length >= 10) {
			// 第最后一个元素出栈
			data.pop()
		}

		// 向数组追加数据
		data.unshift(value)

		// 储存数据
		localforage.setItem(currentTab.url, data)
		// 储存按钮状态
		this.setBtnStatus()
	}

	// 储存按钮状态 如：是否开启区分大小写等功能
	setBtnStatus() {
		// 拿到被点击的按钮
		const btns = document.querySelectorAll('.btn-active')
		// 储存按钮被点击的按钮 id
		const ids = []
		btns.forEach(v => {
			// 判断是否存在这个配置
			if (btnHandle.hasOwnProperty(v.getAttribute('id'))) {
				// 存在
				ids.push(v.getAttribute('id'))
			}
		})
		localforage.setItem(`${currentTab.url}-btn`, ids)
	}

	// 获取按钮的状态
	async getBtnStatus() {
		const result = await localforage.getItem(`${currentTab.url}-btn`)
		// 映射按钮状态
		result.forEach(v => {
			document.querySelector(`#${v}`).classList.add('btn-active')
			// 更新配置 并调用配置
			btnHandle[v]()
		})
	}

	// 获取仓库数据
	async getItem() {
		const result = await localforage.getItem(currentTab.url)
		return result
	}

}

// 实例化搜索内容仓库
let searchValueStore = null
// 初始化搜索内容仓库  单例模式
function CreateSearchStore() {
	if (searchValueStore == null) {
		searchValueStore = new SearchStore()
	}

	return searchValueStore

}



// 创建历史列表dom
function CreateHistoryListDom(arr) {
	// 获取历史列表 ul
	const historyUl = document.querySelector("#historyUl")

	// 清空所有类名
	historyUl.className = ""

	// 判断历史记录是否为空
	if (arr == null) {
		// 为空 直接退出

		// 隐藏 动画效果
		historyUl.classList.add("history-ul-hide")

		// 动画执行完毕 清空内容
		setTimeout(() => {
			// 清空子元素
			historyUl.innerHTML = ""
		}, 500);

		return
	} else {
		// 清空子元素
		historyUl.innerHTML = ""
	}


	arr.forEach(v => {
		// 创建 li>div
		const li = CreateHistoryLi(v)
		historyUl.appendChild(li)
	});

	// 显示 动画效果
	// historyUl.classList.add("history-ul-show")
	showHistoryList(historyUl)
}

// 创建历史列表的li
function CreateHistoryLi(v) {
	// 创建 li>div
	const li = document.createElement("li")
	const div = document.createElement("div")
	div.innerHTML = v
	li.appendChild(div)

	// 给历史记录的li添加点击事件
	li.onclick = function () {
		// 获取被点击的历史记录 文本
		const value = this.children[0].innerHTML
		// 给input输入框输入历史记录
		document.querySelector('input').value = value

		// input框聚焦
		document.querySelector('input').focus()

		// 调用搜索内容函数
		searchFun(value, options, setConfig.regular, setConfig.assignContent);
	}

	return li
}

// 显示历史列表
function showHistoryList(dom) {
	// 将高度自动响应元素
	dom.style.height = "auto"
	// 设置动画执行的高度
	document.documentElement.style.setProperty('--history-list-height', `${dom.clientHeight}px`)
	dom.style.height = `${dom.clientHeight}px`
	dom.classList.add("history-ul-show")
}

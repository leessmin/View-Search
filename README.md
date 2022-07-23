# 介绍
![View Search](images/get_started128.png)

这是一个Edge使用的插件。由于浏览器内置F3搜索的功能没有Firefox浏览器中的好用，不支持大小写或者正则表达式等精确的检索到想要的内容。这个插件就是用来解决上述问题的。支持大小写等精确检索功能。

（本来是很早就想做这件事情了，但是由于想要学习的技术太多就没有时间去把这个想法变成现实。没想到Microsoft Edge浏览器举行了 Microsoft Edge 浏览器开拓者大赛 借此机会我就把我曾经的想法拿过来参赛了）

# 浏览器兼容性
除了Edge理论上支持所有Chromium/Blink内核的浏览器（热心网友可以向我提交浏览器兼容的问题）

# 使用
在浏览器中打开开发人员模式后加载解压缩的扩展即可使用

或

前往[Edge 外接程序](https://microsoftedge.microsoft.com/addons/detail/view-search/hdofgdkocpemejihldallddbbkjnkpmc)下载使用

# 功能
- 区分大小写 &emsp;用来区分大小写 &emsp;例如：输入a 只会查找到a 而不会查找到大写A
- 全字匹配 &emsp;用来精准搜索英文单词 &emsp;例如：输入the 只会查找到the 而不会查找they them theme 等单词
- 使用正则表达式 &emsp;输入正则表达式则会匹配到符合正则表达式的内容 &emsp;例如：输入^[0-9]*$  就会找到所有的数字
- 在选定节点中寻找 &emsp;需要先用鼠标选择要搜索的节点然后再打开此功能进行查找 &emsp;注：目前没有api可以做到在Edge中插件失去焦点保持打开的方法，所以可能使用起来有点难受，后期如果有相关的api或者方法我也会加入其中。

# 感谢
本插件使用了mark.js,感谢[Julian Kühnel](https://github.com/julmot)提供的[mark.js](https://github.com/julmot/mark.js)

# 问题
如有任何的bug或疑问请联系1442772970@qq.com

# License
[MPL-2.0](https://opensource.org/licenses/MPL-2.0)

Copyright (c) 2022-present, Leessmin(李思敏)

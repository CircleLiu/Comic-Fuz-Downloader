# Comic Fuz Downloader

用于从Comic Fuz阅读器，将漫画打包为zip下载。

（只能下载免费、已购买的，能看到多少页就能下多少页，看不了的同样下不了

## 安装方法

1. 安装扩展程序（如果已经安装请跳过）
    * Chrome 浏览器需要安装 [TamperMonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) 扩展程序。
    * Firefox 浏览器需要安装 [GreaseMonkey](https://addons.mozilla.org/zh-CN/firefox/addon/greasemonkey/) 附加组件。
    * Opera 浏览器需要安装 [TamperMonkey Beta](https://addons.opera.com/zh-cn/extensions/details/tampermonkey-beta/) 扩展。
    * Safari 浏览器需要安装 [TamperMonkey](http://tampermonkey.net/index.php?ext=dhdg&browser=safari) 扩展。


2. [点击这里安装脚本](https://circleliu.github.io/Comic-Fuz-Downloader/comic-fuz-downloader.user.js).

## 使用方法

1. 打开Comic Fuz漫画阅读器

2. 点击插件在阅读器菜单左上角中加入的下载按钮

    ![Download Button](https://circleliu.github.io/Comic-Fuz-Downloader/imgs/download.png)

3. 等待加载打包（如果页数较多会耗时较长，但因为是异步的所以你可以边看边等）

4. 打包完成后会弹出下载窗口



## 变更日志

### 0.2.1 (2021/6/19)

#### Features

- 加入了打包ZIP阶段的进度百分比显示



### 0.2.0 (2021/6/19)

#### Features

- 加入了进度显示

#### Improvements

- 优化了下载打包逻辑



### 0.1.2 (2021/6/17)

#### Features

- 去掉了下载图片中的黑边（原图就有黑边，所以不是BUG

#### Improvements

- 换用了more efficient的图片打包方式（理论上能快点


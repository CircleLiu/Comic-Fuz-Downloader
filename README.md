# Comic Fuz Downloader
# 现已支持新版UI！

用于从Comic Fuz阅读器，将漫画打包为zip下载。

（只能下载免费、已购买的，能看到多少页就能下多少页，看不了的同样下不了

## 安装地址

- GreasyFork: [Comic Fuz Downloader](https://greasyfork.org/scripts/428281)

## 使用方法

1. 打开Comic Fuz漫画阅读器

2. 点击插件在阅读器菜单左下角中加入的下载按钮

    ![Download Button](https://circleliu.github.io/Comic-Fuz-Downloader/imgs/download.png)

3. 等待加载打包（如果页数较多会耗时较长，但因为是异步的所以你可以边看边等）

4. 打包完成后会弹出下载窗口



## 变更日志

### 0.3.0 (2021/11/14)

#### Features

- 对Comic Fuz新版UI和加密方式支持

### 0.2.2 (2021/6/21)

#### Features

- 文件名改为Content Title

#### BUG

- 修复了ComicInfo中的Content Title为空的问题



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


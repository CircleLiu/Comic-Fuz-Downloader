[English](./README_en.md)

# Comic Fuz Downloader

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


### 0.4.4 (2022/08/09)

#### Bugfix

- Fix Download misplaced/disappered due to footer layout change.

### 0.4.3 (2022/07/25)

#### Enhancement

- Pads filename with '0' when index less than 100

### 0.4.2 (2022/02/24)

#### Bugfix

- Move downloader to the right place
- Fix the issue that the downloader will disappear when click table of content

### 0.4.1 (2022/01/24)

#### Enhancement

- Add debounce for range input

#### Bugfix

- Throw incorrect range while range is correct

### 0.4.0 (2022/01/04)

#### Feature

- Select download page range
- Refactor new initialization logic

### 0.3.4 (2021/12/27)

#### Enhancement

- Handle errors to make sure it can download when some pages failed to load
- Change the way of locating footer in case changes of unique class id

### 0.3.3 (2021/12/23)

#### Bugfix

- 修复因元素class变动导致无法加载的问题

### 0.3.2 (2021/11/20)

#### Enhancement

- 添加鼠标指针提示

#### Bugfix

- Error Handling

### 0.3.1 (2021/11/14)

#### Bugfix

- 修复页码乱序问题
- 去掉文件名多余空格

### 0.3.0 (2021/11/14)

#### Features

- 对Comic Fuz新版UI和加密方式支持
- 按GreasyFork规范更新引用

### 0.2.2 (2021/6/21)

#### Features

- 文件名改为Content Title

#### Bugfix

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

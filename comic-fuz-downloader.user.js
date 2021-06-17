// ==UserScript==
// @name              Comic Fuz Downloader
// @namespace         http://circleliu.cn
// @version           0.1.2
// @description       Userscript for download comics on Comic Fuz
// @author            Circle

// @match             https://comic-fuz.com/viewer.html*
// @run-at            document-start
// @grant             none

// @require           https://unpkg.com/ajax-hook@2.0.3/dist/ajaxhook.min.js
// @require           https://unpkg.com/jszip@3.6.0/dist/jszip.min.js
// @require           https://unpkg.com/jszip-utils@0.1.0/dist/jszip-utils.min.js
// @require           https://unpkg.com/jszip@3.6.0/vendor/FileSaver.js
// @require           https://unpkg.com/jquery@3.6.0/dist/jquery.min.js

// @homepageURL       https://circleliu.github.io/Comic-Fuz-Downloader/
// @supportURL        https://github.com/CircleLiu/Comic-Fuz-Downloader
// @updateURL         https://circleliu.github.io/Comic-Fuz-Downloader/comic-fuz-downloader.user.js
// ==/UserScript==

(function () {
  'use strict'

  const jq3 = $.noConflict()
  jq3(document).ready(($) => {
    const divDownload = $(`
      <div class="menuField" id="showDownloadMenuField" title="Download">
        <button id="showDownload">
          <div></div>
        </button>
      </div>
    `)
    const downloadIcon = 'url("https://circleliu.github.io/Comic-Fuz-Downloader/icons/download.png")'
    const loadingIcon = 'url("https://circleliu.github.io/Comic-Fuz-Downloader/icons/loading.gif")'
    $('#menu .submenu:first').append(divDownload)
    $('#showDownload').css('background-image', downloadIcon)
    $('#showDownload').css('background-repeat', 'no-repeat')
    $('#showDownload').css('background-size', 'contain')
    $('#showDownload').click(async function() {
      $('#showDownload').css('background-image', loadingIcon)
      const images = await getAllImages()
      await downloadAsZip(images)
      $('#showDownload').css('background-image', downloadIcon)
    })
  })

  let cid
  let comicTitle
  let contentTitle
  let authInfo
  let baseUrl
  let config

  ah.proxy({
    onResponse: (response, handler) => {
      if (response.config.url.indexOf('license') > -1) {
        handleLicense(response)
      }

      if (response.config.url.indexOf('advertisement/url') > -1) {
        handleAdvertisementUrl(response)
      }

      if (response.config.url.indexOf('configuration_pack.json') > -1) {
        handleConfiguration(response)
      }

      handler.next(response)
    },
  })

  function handleLicense(response) {
    const url = new URL(response.config.url)
    const data = JSON.parse(response.response)
    cid = url.searchParams.get('cid')
    authInfo = data.auth_info
    baseUrl = data.url
  }

  function handleAdvertisementUrl(response) {
    const data = JSON.parse(response.response)
    contentTitle = data.content_title
  }

  function handleConfiguration(response) {
    const data = JSON.parse(response.response)
    config = data
    comicTitle = _findVal(data, 'Title')
  }

  function _findVal(object, key) {
    var value;
    Object.keys(object).some(function(k) {
      if (k === key) {
        value = object[k];
        return true;
      }
      if (object[k] && typeof object[k] === 'object') {
        value = _findVal(object[k], key);
        return value !== undefined;
      }
    });
    return value;
  }

  async function getAllImages() {
    const images = []
    config.configuration.contents.forEach(async ({file}) => {
      for (let i = 0; i < config[file].FileLinkInfo.PageCount; i++) {
        images.push(getImageAndReorgnize(file, i))
      }
    })

    return Promise.all(images)
  }

  async function getImageAndReorgnize(filePath, index) {
    const pagePath = `${filePath}/${index}`
    const srcImage = constructImageUrl(pagePath)
    const canvas = await reorgnizeImage(srcImage, filePath, index)
    const image = await getCanvasBlob(canvas)

    return {
      name: `${filePath.slice(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'))}-${index}`,
      data: image
    }
  }

  function getCanvasBlob(canvas) {
    return new Promise(function(resolve, reject) {
      canvas.toBlob(function(blob) {
        resolve(blob)
      }, 'image/jpeg', 1)
    })
  }

  function constructImageUrl(pagePath) {
    const imageUrl = `${baseUrl}${pagePath}.jpeg`
    const params = $.param(authInfo)
    return `${imageUrl}?${params}&_`
  }

  function reorgnizeImage(image, filePath, index) {
    return new Promise((resolve, reject) => {
      const srcCanvas = document.createElement('canvas')
      const srcContext = srcCanvas.getContext('2d')
      const srcImage = new Image()
      srcImage.src = image
      srcImage.crossOrigin = 'Anonymous'

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      srcImage.onload = () => {
        const width = srcImage.width
        const height = srcImage.height
        srcCanvas.width = width
        srcCanvas.height = height
        srcContext.drawImage(srcImage, 0, 0)
  
        canvas.width = config[filePath].FileLinkInfo.PageLinkInfoList[index].Page.Size.Width
        canvas.height = config[filePath].FileLinkInfo.PageLinkInfoList[index].Page.Size.Height
  
        const pagePath = `${filePath}/${index}`
        const pattern = Decoder.calcPattern(pagePath)
        const mapData = Decoder.decode(width, height, 64, 64, pattern)
        mapData.forEach(({ srcX, srcY, destX, destY, width, height }) => {
          const srcData = srcContext.getImageData(destX, destY, width, height)
          context.putImageData(srcData, srcX, srcY)
        })

        resolve(canvas)
      }
      srcImage.onerror = reject
    })
  }

  async function downloadAsZip(images) {
    const zip = new JSZip()
    zip.file('ComicInfo.txt', `${cid}\n${comicTitle}\n${contentTitle}`)
    images.forEach(({name, data}) => {
      zip.file(`${name}.jpg`, data)
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${cid}.zip`)
  }

  const Decoder = {
    calcPattern: function(str) {
      let n = 0
      str.split('').forEach((char) => {
        n += char.charCodeAt(0)
      })
      return (n % 4) + 1
    },
    decode: function (e, t, r, i, n) {
      var s,a,o,u,c,p,l,m,d,h,y = Math.floor(e / r),g = Math.floor(t / i),f = e % r,b = t % i,S = []
      if (
        ((s = y - ((43 * n) % y)),
        (s = s % y == 0 ? (y - 4) % y : s),
        (s = 0 == s ? y - 1 : s),
        (a = g - ((47 * n) % g)),
        (a = a % g == 0 ? (g - 4) % g : a),
        (a = 0 == a ? g - 1 : a),
        f > 0 &&
          b > 0 &&
          ((o = s * r),
          (u = a * i),
          S.push({
            srcX: o,
            srcY: u,
            destX: o,
            destY: u,
            width: f,
            height: b,
          })),
        b > 0)
      )
        for (l = 0; l < y; l++)
          (d = this.calcXCoordinateXRest_(l, y, n)),
            (h = this.calcYCoordinateXRest_(d, s, a, g, n)),
            (c = this.calcPositionWithRest_(d, s, f, r)),
            (p = h * i),
            (o = this.calcPositionWithRest_(l, s, f, r)),
            (u = a * i),
            S.push({
              srcX: o,
              srcY: u,
              destX: c,
              destY: p,
              width: r,
              height: b,
            })
      if (f > 0)
        for (m = 0; m < g; m++)
          (h = this.calcYCoordinateYRest_(m, g, n)),
            (c = (d = this.calcXCoordinateYRest_(h, s, a, y, n)) * r),
            (p = this.calcPositionWithRest_(h, a, b, i)),
            (o = s * r),
            (u = this.calcPositionWithRest_(m, a, b, i)),
            S.push({
              srcX: o,
              srcY: u,
              destX: c,
              destY: p,
              width: f,
              height: i,
            })
      for (l = 0; l < y; l++)
        for (m = 0; m < g; m++)
          (h = (m + 37 * n + 41 * (d = (l + 29 * n + 31 * m) % y)) % g),
            (c =
              d * r + (d >= this.calcXCoordinateYRest_(h, s, a, y, n) ? f : 0)),
            (p =
              h * i + (h >= this.calcYCoordinateXRest_(d, s, a, g, n) ? b : 0)),
            (o = l * r + (l >= s ? f : 0)),
            (u = m * i + (m >= a ? b : 0)),
            S.push({
              srcX: o,
              srcY: u,
              destX: c,
              destY: p,
              width: r,
              height: i,
            })
      return S
    },
    calcPositionWithRest_: function (e, t, r, i) {
      return e * i + (e >= t ? r : 0)
    },
    calcXCoordinateXRest_: function (e, t, r) {
      return (e + 61 * r) % t
    },
    calcYCoordinateXRest_: function (e, t, r, i, n) {
      var s,
        a,
        o = n % 2 == 1
      return (
        (e < t ? o : !o) ? ((a = r), (s = 0)) : ((a = i - r), (s = r)),
        ((e + 53 * n + 59 * r) % a) + s
      )
    },
    calcXCoordinateYRest_: function (e, t, r, i, n) {
      var s,
        a,
        o = n % 2 == 1
      return (
        (e < r ? o : !o) ? ((a = i - t), (s = t)) : ((a = t), (s = 0)),
        ((e + 67 * n + t + 71) % a) + s
      )
    },
    calcYCoordinateYRest_: function (e, t, r) {
      return (e + 73 * r) % t
    },
  }
})()

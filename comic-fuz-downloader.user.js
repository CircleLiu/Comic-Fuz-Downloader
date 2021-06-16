// ==UserScript==
// @name         Comic Fuz Downloader
// @namespace    http://circleliu.cn
// @version      0.1
// @description  Userscript for download comics on Comic Fuz
// @author       Circle
// @match        https://comic-fuz.com/viewer.html*
// @run-at       document-start
// @require      https://unpkg.com/ajax-hook@2.0.3/dist/ajaxhook.min.js
// @require      https://unpkg.com/axios/dist/axios.min.js
// @require      https://unpkg.com/jszip@3.6.0/dist/jszip.min.js
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'

  ah.proxy({
    onResponse: (response, handler) => {
      if (response.config.url.indexOf('configuration_pack.json') === -1) {
        handler.next(response)
        return
      }

      const url = new URL(response.config.url)
      const baseUrl =
        url.origin +
        url.pathname.slice(0, url.pathname.lastIndexOf('configuration_pack.json'))
      const params = {
        Policy: url.searchParams.get('Policy'),
        Signature: url.searchParams.get('Signature'),
        'Key-Pair-Id': url.searchParams.get('Key-Pair-Id'),
      }
      console.log(baseUrl)
      console.log(params)

      const data = JSON.parse(response.response)
      const filePath = data.configuration.contents[0].file
      const pageLinkInfo = data[filePath].FileLinkInfo.PageLinkInfoList[0]
      const pagePath = `${filePath}/0`
      const imageUrl = `${baseUrl}${pagePath}.jpeg`
      axios.get(imageUrl, {
          params,
          responseType: 'arraybuffer',
      }).then((response) => {
        const dataUrl = _imageEncode(response.data)
        const srcCanvas = document.createElement('canvas')
        const srcContext = srcCanvas.getContext('2d')
        const srcImage = new Image()
        srcImage.src = dataUrl

        const canvas = document.createElement('canvas')
        const context = canvas.getContext("2d")
        
        srcImage.onload = () => {
          const width = srcImage.width
          const height = srcImage.height
          srcCanvas.width = width
          srcCanvas.height = height
          srcContext.drawImage(srcImage, 0, 0)

          canvas.width = width
          canvas.height = height

          const pattern = Decoder.calcPattern(pagePath)
          const mapData = Decoder.decode(width, height, 64, 64, pattern)
          mapData.forEach(({ srcX, srcY, destX, destY, width, height }) => {
            const srcData = srcContext.getImageData(destX, destY, width, height)
            context.putImageData(srcData, srcX, srcY)
          })
  
          // const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = canvas.toDataURL('image/jpeg', 1)
          link.setAttribute('download', 'file.jpg')
          document.body.appendChild(link)
          link.click()
        }
      })

      handler.next(response)
    },
  })

  function _imageEncode (arrayBuffer) {
    let u8 = new Uint8Array(arrayBuffer)
    let b64encoded = btoa([].reduce.call(new Uint8Array(arrayBuffer),function(p,c){return p+String.fromCharCode(c)},''))
    let mimetype="image/jpeg"
    return "data:"+mimetype+";base64,"+b64encoded
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

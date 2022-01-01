// ==UserScript==
// @name              Comic Fuz Downloader
// @namespace         http://circleliu.cn
// @version           0.3.4
// @description       Userscript for download comics on Comic Fuz
// @author            Circle
// @license           MIT
// @match             https://comic-fuz.com/book/viewer*
// @match             https://comic-fuz.com/magazine/viewer*
// @match             https://comic-fuz.com/manga/viewer*
// @run-at            document-start
// @grant             none

// @require           https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js
// @require           https://unpkg.com/axios/dist/axios.min.js
// @require           https://unpkg.com/jszip@3.6.0/dist/jszip.min.js
// @require           https://unpkg.com/jszip-utils@0.1.0/dist/jszip-utils.min.js
// @require           https://unpkg.com/jszip@3.6.0/vendor/FileSaver.js
// @require           https://unpkg.com/jquery@3.6.0/dist/jquery.min.js
// @require           https://cdn.jsdelivr.net/npm/protobufjs@6.11.2/dist/protobuf.min.js

// @require           https://greasyfork.org/scripts/435461-comic-fuz-downloader-protobuf-message/code/Comic%20Fuz%20Downloader%20Protobuf%20Message.js?version=987894

// @homepageURL       https://circleliu.github.io/Comic-Fuz-Downloader/
// @supportURL        https://github.com/CircleLiu/Comic-Fuz-Downloader
// @updateURL         https://circleliu.github.io/Comic-Fuz-Downloader/comic-fuz-downloader.user.js
// ==/UserScript==

;(function () {
  'use strict'

  const api = getApi()

  const imgBaseUrl = 'https://img.comic-fuz.com'
  const apiBaseUrl = 'https://api.comic-fuz.com'
  const deviceInfo = {
    deviceType: 2,
  }
  const comicType = {
    book: {
      url: `${apiBaseUrl}/v1/book_viewer_2`,
      request: {
        body: {
          deviceInfo,
          bookIssueId: '',
          consumePaidPoint: 0,
          purchaseRequest: false,
        },
        encoder: api.v1.BookViewer2Request.encode,
      },
      response: {
        decoder: api.v1.BookViewer2Response.decode,
      },
    },
    magazine: {
      url: `${apiBaseUrl}/v1/magazine_viewer_2`,
      request: {
        body: {
          deviceInfo,
          magazineIssueId: "",
          consumePaidPoint: 0,
          purchaseRequest: false,
        },
        encoder: api.v1.MagazineViewer2Resquest.encode,
      },
      response: {
        decoder: api.v1.MagazineViewer2Response.decode,
      }
    },
    manga: {
      url: `${apiBaseUrl}/v1/manga_viewer`,
      request: {
        body: {
          deviceInfo,
          chapterId: "",
          consumePoint: {
            event: 0,
            paid: 0,
          },
          useTicket: false,
        },
        encoder: api.v1.MangaViewerResquest.encode,
      },
      response: {
        decoder: api.v1.MangaViewerResponse.decode,
      }
    }
  }
  const responseDecoder = {
    'book_viewer_2': api.v1.BookViewer2Response,
    'book_viewer': api.v1.BookViewer2Response,
    'magazine_viewer_2': api.v1.MagazineViewer2Response,
    'magazine_viewer': api.v1.MagazineViewerResponse,
    'manga_viewer': api.v1.MangaViewerResponse,
  }

  let metadata
  async function decodeResponse(response, decoder) {
    const data = await response.arrayBuffer()
    const res = decoder.decode(new Uint8Array(data))
    metadata = res
  }

  async function getMetadata() {
    const url = 'https://api.comic-fuz.com/v1/book_viewer_2'
    const body = {
      deviceInfo: {
        deviceType: 2,
      },
      bookIssueId: '25929',
      consumePaidPoint: 0,
      purchaseRequest: true,
    }

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: api.v1.BookViewer2Request.encode(body).finish(),
      decode: api.v1.BookViewer2Response.decode
    })
    console.log(api.v1.BookViewer2Response.decode(new Uint8Array(await response.arrayBuffer())))

    // axios.post(url, api.v1.BookViewer2Request.encode(body).finish(), {
    //   withCredentials: true,
    //   headers: {'Content-Type': 'application/protobuf' }
    // })
    //   .then((res) => {
    //     const decodedRes = api.v1.BookViewer2Response.decode(new Uint8Array(res))
    //     console.log(decodedRes)
    //   })
  }

  async function decryptImage({imageUrl, encryptionKey, iv}) {
    const res = await axios.get(imgBaseUrl + imageUrl, {
      responseType: 'arraybuffer',
    })
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.lib.WordArray.create(res.data)
    })
    const key = CryptoJS.enc.Hex.parse(encryptionKey)
    const _iv = CryptoJS.enc.Hex.parse(iv)
    const dcWordArray = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: _iv,
      mode: CryptoJS.mode.CBC,
    })
    return dcWordArray.toString(CryptoJS.enc.Base64)
  }
  
  $(document).ready($ => {
    const downloadIcon = 'https://circleliu.github.io/Comic-Fuz-Downloader/icons/download.png'
    const loadingIcon = 'https://circleliu.github.io/Comic-Fuz-Downloader/icons/loading.gif'
    // const downloadIcon = 'http://localhost:5000/icons/download.png'
    // const loadingIcon = 'http://localhost:5000/icons/loading.gif'
    const divDownload = $(`
      <div id="downloader">
        <img id="downloaderIcon" src="${downloadIcon}">
        <img id="downloadingIcon" src="${loadingIcon}">
        <span id="downloaderText">Initializing</span>
      </div>
    `)
    divDownload.css({
      'grid-area': 'hoge',
      color: '#2c3438',
      width: 'fit-content',
      cursor: 'pointer',
    })
    divDownload.on('click', async () => {
      // console.log(metadata)
      // setDownloaderBusy()
      // try {
      //   await downloadAsZip()
      //   setDownloaderReady()
      // } catch (error) {
      //   console.error(error)
      //   setDownloaderReady()
      //   setText(error.message)
      // }
      getMetadata()
    })

    function setDownloaderReady() {
      $('#downloaderIcon').show()
      $('#downloadingIcon').hide()
      setText('Download')
    }

    function setDownloaderBusy() {
      $('#downloaderIcon').hide()
      $('#downloadingIcon').show()
    }

    function setText(text) {
      $('#downloaderText').text(text)
    }

    function updateDownloadProgress(progress) {
      setText(`Loading: ${progress.done}/${progress.total}`)
    }

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    const maxRetry = 10
    ;(async () => {
      for (let i = 0; i < maxRetry; ++i) {
        if ($('div[class^="ViewerFooter_footer__"]').length) {
          $('div[class^="ViewerFooter_footer__"]:first').append(divDownload)
          setDownloaderReady()
          break
        } else {
          await delay(500)
        }
      }
    })()

    async function downloadAsZip() {
      if (!metadata) {
        throw new Error('Failed to load data!')
      }

      const zipName = getNameFromMetadata()
      const zip = new JSZip()
      if (metadata.tableOfContents){
        zip.file('TableOfContents.txt', JSON.stringify(metadata.tableOfContents, null, '  '))
      }

      const progress = {
        total: 0,
        done: 0,
      }
      const promises = metadata.pages.map(({image}, i) => {
        if (image){
          progress.total++
          return getImageToZip(image, zip, progress, i)
        }
      })
      await Promise.all(promises)

      const content = await zip.generateAsync({ type: 'blob' }, ({ percent }) => {
        setText(`Packaging: ${percent.toFixed(2)}%`)
      })
      saveAs(content, `${zipName}.zip`)
    }

    function getNameFromMetadata() {
      if (metadata.bookIssue) {
        return metadata.bookIssue.bookIssueName.trim()
      } else if (metadata.viewerTitle) {
        return metadata.viewerTitle.trim()
      } else if (metadata.magazineIssue) {
        return metadata.magazineIssue.magazineName.trim() + ' ' + metadata.magazineIssue.magazineIssueName.trim()
      }
    }

    async function getImageToZip(image, zip, progress, index) {
      const fileName = `${index}.jpeg`
      try {
        const imageData = await decryptImage(image)
        addImageToZip(fileName, imageData, zip)
      } catch (err) {
        console.error(err)
      }
      if (progress) {
        progress.done++
        updateDownloadProgress(progress)
      }
    }
  
    function addImageToZip(name, base64Data, zip) {
      zip.file(name, base64Data, {
        base64: true,
      })
    }
  })
})()

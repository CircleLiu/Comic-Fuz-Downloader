// ==UserScript==
// @name              Comic Fuz Downloader
// @namespace         http://circleliu.cn
// @version           0.4.0-BETA
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
  
  class Comic {
    constructor (path, request, response) {
      const deviceInfo = {
        deviceType: 2,
      }
      this.url = `${apiBaseUrl}/v1/${path}`
      this.requestBody = {
        deviceInfo,
      }
      this.request = request
      this.response = response
    }

    async fetchMetadata() {
      const response = await fetch(this.url, {
        method: 'POST',
        credentials: 'include',
        body: this.request.encode(this.requestBody).finish(),
      })
      this.metadata = await this.decodeResponse(response)
    }

    async decodeResponse(response) {
      const data = await response.arrayBuffer()
      const res = this.response.decode(new Uint8Array(data))
      return res
    }
  }

  class Book extends Comic {
    constructor (bookIssueId) {
      super('book_viewer_2', api.v1.BookViewer2Request, api.v1.BookViewer2Response)
      this.requestBody = {
        deviceInfo: this.requestBody.deviceInfo,
        bookIssueId,
        consumePaidPoint: 0,
        purchaseRequest: false,
      }
    }
  }

  class Magazine extends Comic {
    constructor (magazineIssueId) {
      super('magazine_viewer_2', api.v1.MagazineViewer2Request, api.v1.MagazineViewer2Response)
      this.requestBody = {
        deviceInfo: this.requestBody.deviceInfo,
        magazineIssueId,
        consumePaidPoint: 0,
        purchaseRequest: false,
      }
    }
  }

  class Manga extends Comic {
    constructor (chapterId) {
      super('manga_viewer', api.v1.MangaViewerRequest, api.v1.MangaViewerResponse)
      this.requestBody = {
        deviceInfo: this.requestBody.deviceInfo,
        chapterId,
        consumePoint: {
          event: 0,
          paid: 0,
        },
        useTicket: false,
      }
    }
  }

  let comic
  async function initialize() {
    const path = new URL(window.location.href).pathname.split('/')
    const type = path[path.length - 3]
    const id = path[path.length - 1]
    console.log(path, type, id)
    switch (type.toLowerCase()) {
      case 'book':
        comic = new Book(id)
        break
      case 'magazine':
        comic = new Magazine(id)
        break
      case 'manga':
        comic = new Manga(id)
        break
    }
    await comic.fetchMetadata()
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
      <div id="downloader"></div>
    `)
    divDownload.css({
      'grid-area': 'hoge',
      color: '#2c3438',
      width: 'fit-content',
    })

    const spanDownloadButton = $(`
      <span id="downloadButton">
        <img id="downloaderIcon" src="${downloadIcon}">
        <img id="downloadingIcon" src="${loadingIcon}">
        <span id="downloaderText">Initializing</span>
      </span>
    `)
    spanDownloadButton.css({
      cursor: 'pointer',
    })
    spanDownloadButton.on('click', async () => {
      setDownloaderBusy()
      try {
        await downloadAsZip(comic.metadata, $('#downloadFrom').val(), $('#downloadTo').val())
        setDownloaderReady()
      } catch (error) {
        console.error(error)
        setDownloaderReady(error.message)
      }
    })

    const spanDownloadRange = $(`
      <span id="downloadRange">
        <input id="downloadFrom" type="number">~<input id="downloadTo" type="number">
      </span>
    `)
    spanDownloadRange.children('input').css({
      width: '3rem',
    })
    

    function initRange() {
      if (!comic.metadata) {
        throw new Error('No metadata')
      }
      const maxLength = comic.metadata.pages.filter(({image}) => !!image).length
      spanDownloadRange.children('input').attr({
        min: 1,
        max: maxLength,
      })

      $('#downloadFrom').val(1)
      $('#downloadFrom').on('input', () => {
        if (!$('#downloadFrom').val()) return

        const max = Math.min(+$('#downloadFrom').attr('max'), +$('#downloadTo').val())
        if (+$('#downloadFrom').val() < +$('#downloadFrom').attr('min')) {
          $('#downloadFrom').val($('#downloadFrom').attr('min'))
        } else if (+$('#downloadFrom').val() > max) {
          $('#downloadFrom').val(max)
        }
      })

      $('#downloadTo').val(maxLength)
      $('#downloadTo').on('input', () => {
        if (!$('#downloadTo').val()) return

        const min = Math.max(+$('#downloadTo').attr('min'), +$('#downloadFrom').val())
        if (+$('#downloadTo').val() > +$('#downloadTo').attr('max')) {
          $('#downloadTo').val($('#downloadTo').attr('max'))
        } else if (+$('#downloadTo').val() < min) {
          $('#downloadTo').val(min)
        }
      })
    }

    divDownload.append(spanDownloadButton)
    divDownload.append(spanDownloadRange)


    function setDownloaderReady(msg) {
      $('#downloaderIcon').show()
      $('#downloadingIcon').hide()
      setText(msg || 'Download')
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
          setDownloaderBusy()
          setText('Initializing...')
          try {
            await initialize()
            initRange()
            console.log(comic.metadata)
            setDownloaderReady()
          } catch (err) {
            setDownloaderReady('Initialization failed!')
          }
          break
        } else {
          await delay(500)
        }
      }
    })()

    async function downloadAsZip(metadata, pageFrom, pageTo) {
      console.log(pageFrom, pageTo)
      if (!metadata) {
        throw new Error('Failed to load data!')
      } else if (!pageFrom || !pageTo || pageFrom > pageTo) {
        throw new Error('Incorrect Range!')
      }

      const zipName = getNameFromMetadata(metadata)
      const zip = new JSZip()
      if (metadata.tableOfContents){
        zip.file('TableOfContents.txt', JSON.stringify(metadata.tableOfContents, null, '  '))
      }

      const progress = {
        total: 0,
        done: 0,
      }
      const promises = metadata.pages.slice(pageFrom - 1, pageTo).map(({image}, i) => {
        if (image){
          progress.total++
          return getImageToZip(image, zip, progress, +pageFrom + i)
        }
      })
      await Promise.all(promises)

      const content = await zip.generateAsync({ type: 'blob' }, ({ percent }) => {
        setText(`Packaging: ${percent.toFixed(2)}%`)
      })
      saveAs(content, `${zipName}.zip`)
    }

    function getNameFromMetadata(metadata) {
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

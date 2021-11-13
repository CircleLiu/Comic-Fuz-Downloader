// ==UserScript==
// @name              Comic Fuz Downloader
// @namespace         http://circleliu.cn
// @version           0.3.0
// @description       Userscript for download comics on Comic Fuz
// @author            Circle
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
// @require           https://cdn.rawgit.com/dcodeIO/protobuf.js/6.11.2/dist/protobuf.min.js

// @require           https://circleliu.github.io/Comic-Fuz-Downloader/resources/messages.js

// @homepageURL       https://circleliu.github.io/Comic-Fuz-Downloader/
// @supportURL        https://github.com/CircleLiu/Comic-Fuz-Downloader
// @updateURL         https://circleliu.github.io/Comic-Fuz-Downloader/comic-fuz-downloader.user.js
// ==/UserScript==

;(function () {
  'use strict'

  const api = getApi()

  const imgBaseUrl = 'https://img.comic-fuz.com'
  const responseDecoder = {
    'book_viewer_2': api.v1.BookViewer2Response,
    'book_viewer': api.v1.BookViewer2Response,
    'magazine_viewer_2': api.v1.MagazineViewer2Response,
    'magazine_viewer': api.v1.MagazineViewerResponse,
    'manga_viewer': api.v1.MangaViewerResponse,
  }
  
  const oldFetch = window.fetch
  window.fetch = async (input, options) => {
    const response = await oldFetch(input, options)

    for (const i in responseDecoder) {
      if (input.indexOf(i) > -1) {
        const resClone = response.clone()
        decodeResponse(resClone, responseDecoder[i])
        break;
      }
    }
    
    return response
  }

  let metadata
  async function decodeResponse(response, decoder) {
    const data = await response.arrayBuffer()
    const res = decoder.decode(new Uint8Array(data))
    metadata = res
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
    })
    divDownload.on('click', async () => {
      setDownloaderBusy()
      try {
        await downloadAsZip()
        setDownloaderReady()
      } catch (error) {
        console.error(error)
        setDownloaderReady()
        setText('Download Failed!')
      }
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
        if ($('.ViewerFooter_footer__3E55F').length) {
          $('.ViewerFooter_footer__3E55F:first').append(divDownload)
          setDownloaderReady()
          break
        } else {
          await delay(500)
        }
      }
    })()

    async function downloadAsZip() {
      if (!metadata) {
        setText('Failed to load data!')
        return
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
      const promises = metadata.pages.map(({image}) => {
        if (image){
          progress.total++
          return getImageToZip(image, zip, progress)
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
        return metadata.bookIssue.bookIssueName
      } else if (metadata.viewerTitle) {
        return metadata.viewerTitle
      } else if (metadata.magazineIssue) {
        return metadata.magazineIssue.magazineName + metadata.magazineIssue.magazineIssueName
      }
    }

    async function getImageToZip(image, zip, progress) {
      const fileName = image.imageUrl.slice(image.imageUrl.lastIndexOf('/') + 1, image.imageUrl.indexOf('?')).replace('.enc', '')
      const imageData = await decryptImage(image)
      addImageToZip(fileName, imageData, zip)
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

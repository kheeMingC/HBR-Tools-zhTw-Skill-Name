// ==UserScript==
// @name         HBR Skill Name zhTw
// @namespace    http://tampermonkey.net/
// @version      2026-05-05
// @description  Replace HBR skill name with zhTw!
// @author       kmc
// @match        https://www.hbr-tool.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hbr-tool.com
// @grant        none
// ==/UserScript==

;(async function () {
  "use strict"

  const baseUrl = "https://hbrskill-zhtw.pages.dev"

  const { mapVersion } = await fetch(`${baseUrl}/version.json`, {
    cache: "no-store",
  }).then((res) => res.json())

  const rawMap = await fetch(`${baseUrl}/map.json?v=${mapVersion}`).then(
    (res) => res.json(),
  )

  // Build jp => zh map automatically
  const translateMap = {}

  for (const key in rawMap) {
    const item = rawMap[key]

    if (item.jp && item.zh) {
      translateMap[item.jp] = item.zh
    }
  }

  function translateSelect(select) {
    if (!select) return

    select.querySelectorAll("option").forEach((option) => {
      const original = option.dataset.jpOriginal || option.textContent
      option.dataset.jpOriginal = original

      let text = original

      for (const jp in translateMap) {
        if (text.includes(jp)) {
          text = text.replace(jp, translateMap[jp])
          break
        }
      }

      if (option.textContent !== text) {
        option.textContent = text
      }
    })
  }

  function scanAll() {
    document
      .querySelectorAll("#battle_area select.unit_skill")
      .forEach(translateSelect)
  }

  let timer = null

  function waitForElement(selector, callback) {
    const timer = setInterval(() => {
      const el = document.querySelector(selector)

      if (el) {
        clearInterval(timer)
        callback(el)
      }
    }, 300)
  }

  waitForElement("#battle_area", (target) => {
    const observer = new MutationObserver(() => {
      clearTimeout(timer)

      // debounce to prevent lag / repeated triggers
      timer = setTimeout(() => {
        scanAll()
      }, 80)
    })

    observer.observe(target, {
      childList: true,
      subtree: true,
    })
  })
})()

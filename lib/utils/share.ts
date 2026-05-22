export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // セキュアでもブロックされる場合があるため execCommand にフォールバック
    }
  }

  // 非セキュアコンテキスト（http://192.168.x.x など）や旧ブラウザ向けフォールバック
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export function snsShareLinks(url: string, text: string) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(text)
  return {
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    line: `https://social-plugins.line.me/lineit/share?url=${u}&text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  }
}

import { inject, Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

/**
 * Escapes special regex characters in a string.
 * @param {string} text The text to escape.
 * @returns {string} The escaped text.
 */
function escapeRegExp(text: string): string {
  return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer)

  /**
   * Transforms the input HTML string by highlighting all occurrences of the specified term within words.
   * @param {string} value The HTML content in which to highlight the term.
   * @param {string} term The term to highlight.
   * @param {string} highlightClass Optional. The CSS class to apply for highlighting. Default is 'highlight'.
   * @param {boolean} caseSensitive Optional. Whether the search should be case-sensitive. Default is false.
   * @returns {SafeHtml} The HTML string with highlighted terms, sanitized for safe use in the DOM.
   */
  public transform(
    value: string,
    term: string,
    highlightClass = 'highlight',
    caseSensitive = false
  ): SafeHtml {
    if (!value) return ''
    if (!term) {
      return this.sanitizer.bypassSecurityTrustHtml(value)
    }

    // Create a DOM parser to parse the HTML string
    const parser = new DOMParser()
    const parsedDoc = parser.parseFromString(value, 'text/html')

    // Remove existing highlight <span> elements
    this.#stripExistingHighlights(parsedDoc, highlightClass)

    // Split the term into words and escape special regex characters
    const escapedTerms = term.split(/\s+/).map(escapeRegExp).filter(Boolean)

    if (escapedTerms.length === 0) {
      return this.sanitizer.bypassSecurityTrustHtml(value)
    }

    // Build the regular expression for searching the terms
    const flags = caseSensitive ? 'g' : 'gi'
    const regex = new RegExp(`(${escapedTerms.join('|')})`, flags)

    // Recursive function to traverse and process text nodes
    const walk = (node: Node) => {
      // Process text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        if (regex.test(text)) {
          // Create a temporary container for the highlighted content
          const tempDiv = document.createElement('div')

          // Replace matching terms with highlighted spans
          tempDiv.innerHTML = text.replace(regex, (match) => {
            return `<span class="${highlightClass}">${match}</span>`
          })

          // Replace the text node with the new HTML nodes
          while (tempDiv.firstChild) {
            node.parentNode?.insertBefore(tempDiv.firstChild, node)
          }
          node.parentNode?.removeChild(node)
        }
      } else {
        // Recurse into child nodes
        node.childNodes.forEach((child) => walk(child))
      }
    }

    // Start the traversal from the body
    parsedDoc.body.childNodes.forEach((child) => walk(child))

    // Get the updated HTML content
    const highlightedHtml = parsedDoc.body.innerHTML

    // Sanitize the final HTML content
    return this.sanitizer.bypassSecurityTrustHtml(highlightedHtml)
  }

  /**
   * Removes existing highlight span elements from the document.
   * @param {Document} doc The HTMLDocument object to process.
   * @param {string} highlightClass The CSS class used for highlighting.
   * @returns {void}
   */
  #stripExistingHighlights(doc: Document, highlightClass: string) {
    const existingHighlights = doc.querySelectorAll(`span.${highlightClass}`)
    existingHighlights.forEach((span) => {
      // Replace the span with its child nodes (effectively removing the span but keeping the text)
      const parent = span.parentNode
      while (span.firstChild) {
        parent?.insertBefore(span.firstChild, span)
      }
      parent?.removeChild(span)
    })
  }
}

import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

/**
 * Escapes special regex characters in a string.
 * @param text The text to escape.
 * @returns The escaped text.
 */
function escapeRegExp(text: string): string {
  return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Transforms the input HTML string by highlighting all occurrences of the specified term.
   * @param value The HTML content in which to highlight the term.
   * @param term The term to highlight.
   * @param caseSensitive Optional. Whether the search should be case-sensitive. Default is false.
   * @param highlightClass Optional. The CSS class to apply for highlighting. Default is 'highlight'.
   * @returns The HTML string with highlighted terms, sanitized for safe use in the DOM.
   */
  transform(
    value: string,
    term: string,
    highlightClass = 'highlight',
    caseSensitive = false
  ): SafeHtml {
    if (!value) return ''
    if (!term) {
      // Sanitize the original HTML content
      return this.sanitizer.bypassSecurityTrustHtml(value)
    }

    // Create a DOM parser to parse the HTML string
    const parser = new DOMParser()
    const doc = parser.parseFromString(value, 'text/html')

    // Remove existing highlight <span> elements
    this.stripExistingHighlights(doc)

    // Build the regular expression for searching the term
    const flags = caseSensitive ? 'g' : 'gi'
    const escapedTerm = escapeRegExp(term)
    const regex = new RegExp(escapedTerm, flags)

    // Recursive function to traverse and process text nodes
    const walk = (node: Node) => {
      // Process text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        if (regex.test(node.textContent || '')) {
          // Replace the matched terms with highlighted spans
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = (node.textContent || '').replace(
            regex,
            (match) => {
              return `<span class="${highlightClass}">${match}</span>`
            }
          )

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
    doc.body.childNodes.forEach((child) => walk(child))

    // Get the updated HTML content
    const highlightedHtml = doc.body.innerHTML

    // Sanitize the final HTML content
    return this.sanitizer.bypassSecurityTrustHtml(highlightedHtml)
  }

  /**
   * Removes existing <span class="searchmatch">...</span> elements from the document.
   * @param doc The HTMLDocument object to process.
   */
  private stripExistingHighlights(doc: Document) {
    const existingHighlights = doc.querySelectorAll('span.searchmatch')
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

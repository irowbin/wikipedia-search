import { Pipe, PipeTransform } from '@angular/core'
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeUrl,
  SafeStyle,
} from '@angular/platform-browser'

@Pipe({
  name: 'sanitize',
  standalone: true,
})
export class SanitizePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(
    value: string | null,
    type: 'html' | 'style' | 'url' | 'resourceUrl' = 'html'
  ): SafeHtml | SafeStyle | SafeUrl | SafeResourceUrl | null {
    if (value == null) {
      return null
    }

    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value)
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value)
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value)
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value)
      default:
        throw new Error(`Invalid safe type specified: ${type}`)
    }
  }
}

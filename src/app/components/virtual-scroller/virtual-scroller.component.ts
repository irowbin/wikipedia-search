import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { SearchResult } from '../../models/typeahead.model'
import { SanitizePipe } from '../../pipes/dom-sanitizer.pipe'
import { TypeaheadStateFacade } from '../../+state/typeahead-state.facade'
import { Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-virtual-scroller',
  standalone: true,
  imports: [CommonModule, SanitizePipe],
  templateUrl: './virtual-scroller.component.html',
  styleUrls: ['./virtual-scroller.component.scss'],
})
export class VirtualScrollerComponent implements OnInit {
  @ViewChild('scrollContainer', { static: true }) scrollContainer: ElementRef

  items = Array.from({ length: 10000 }).map((_, i) => `Item #${i + 1}`)
  itemHeight = 110 // Height of a single item in pixels
  bufferItems = 5 // Extra items to render above and below the viewport
  viewportHeight = 400 // Height of the viewport in pixels

  totalHeight = this.items.length * this.itemHeight
  startIndex = 0
  endIndex = 0
  visibleItems = []

  ngOnInit() {
    this.calculateVisibleItems()
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateVisibleItems()
  }

  onScroll() {
    this.calculateVisibleItems()
  }

  calculateVisibleItems() {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop
    const viewportItemCount = Math.ceil(this.viewportHeight / this.itemHeight)

    this.startIndex = Math.floor(scrollTop / this.itemHeight) - this.bufferItems
    this.startIndex = Math.max(0, this.startIndex)

    this.endIndex = this.startIndex + viewportItemCount + 2 * this.bufferItems
    this.endIndex = Math.min(this.items.length - 1, this.endIndex)

    this.visibleItems = this.items.slice(this.startIndex, this.endIndex + 1)
  }

  getTransform() {
    return `translateY(${this.startIndex * this.itemHeight}px)`
  }
}

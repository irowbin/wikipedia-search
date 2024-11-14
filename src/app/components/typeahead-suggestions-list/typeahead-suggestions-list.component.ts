import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  HostListener,
  AfterViewInit,
  OnChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { SanitizePipe } from '../../pipes/dom-sanitizer.pipe'
import { Subject, takeUntil } from 'rxjs'
import { SearchResult } from '../../models/typeahead.model'
import { TypeaheadStateFacade } from '../../+state/typeahead-state.facade'
import { HighlightPipe } from '../../pipes/highlight.pipe'

@Component({
  selector: 'app-typeahead-suggestions-list',
  standalone: true,
  imports: [CommonModule, SanitizePipe, HighlightPipe],
  templateUrl: './typeahead-suggestions-list.component.html',
  styleUrls: ['./typeahead-suggestions-list.component.scss'],
})
export class TypeaheadSuggestionsListComponent
  implements OnChanges, OnInit, AfterViewInit, OnDestroy
{
  public readonly toDestroy$ = new Subject<void>()

  /**
   * All results including batch loaded.
   */
  @Input()
  public items: SearchResult[] = []

  @Input()
  public searchTerm: string

  /**
   * List of displayed search results in the viewport
   */
  public readonly displayedItems = signal<SearchResult[]>([])

  /**
   * Height of a single item in pixels
   */
  public readonly itemHeight = 120
  /**
   * Extra items to render above and below the viewport
   */
  public readonly bufferItems = 5
  /**
   * Height of the viewport in pixels
   */
  public readonly viewportHeight = 560

  /**
   * Total height of all items in pixels
   */
  public totalContentHeight: number
  /**
   * Index of the first visible item
   */
  public startIndex = 0
  /**
   * Index of the last visible item
   */
  public endIndex = 0

  public readonly selectedTypeahead = signal<SearchResult>(undefined)

  public readonly typeaheadFacade = inject(TypeaheadStateFacade)

  /**
   * Emits when the suggestion list should be hidden
   */
  @Output()
  public readonly hide = new EventEmitter<void>()

  @Output()
  public readonly loadMore = new EventEmitter<void>()

  private observer: IntersectionObserver

  private lastScrollTop = 0

  public isBatchLoading = signal(false)

  constructor(private elRef: ElementRef) {}

  public ngOnChanges(): void {
    this.#setTotalContentHeight()
    this.#calculateVisibleItems()
  }

  public ngOnInit(): void {
    this.#selectIsLoadingNextBatch()
    this.#setTotalContentHeight()
    this.#selectSelectedTypeahead()
    this.#calculateVisibleItems()
  }

  public ngAfterViewInit(): void {
    const scroller = this.elRef.nativeElement.querySelector('.scroller')
    const sentinel = this.elRef.nativeElement.querySelector('.sentinel')

    const options = {
      root: scroller,
      rootMargin: '0px',
      threshold: 0.1,
    }

    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.loadNextBatch()
      }
    }, options)

    if (sentinel) {
      this.observer.observe(sentinel)
    }
  }

  public ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect()
    }

    this.toDestroy$.next()
    this.toDestroy$.complete()
  }

  public onScroll(event: Event): void {
    const target = event.target as HTMLElement
    const scrollTop = target.scrollTop
    this.#calculateVisibleItems(scrollTop)
  }

  #setTotalContentHeight(): void {
    this.totalContentHeight = this.items.length * this.itemHeight
  }

  #calculateVisibleItems(scrollTop = 0): void {
    const itemsInView = Math.ceil(this.viewportHeight / this.itemHeight)
    const totalItems = this.items.length

    // Regular calculation
    this.startIndex = Math.floor(scrollTop / this.itemHeight)
    this.endIndex = Math.min(
      this.startIndex + itemsInView + this.bufferItems,
      totalItems
    )

    // Ensure we show all available items at bottom
    if (this.endIndex >= totalItems) {
      this.startIndex = Math.max(0, totalItems - itemsInView - this.bufferItems)
      this.endIndex = totalItems
    }

    this.displayedItems.set(this.items.slice(this.startIndex, this.endIndex))
  }

  public getTransform(): string {
    return `translateY(${this.startIndex * this.itemHeight}px)`
  }

  public typeaheadItemSelect(item: SearchResult): void {
    // Since the snippet is an HTML string, we need to parse it to get the text content.
    // This is necessary to avoid XSS attacks.
    const domParser = new DOMParser()
    const parsedHtml = domParser.parseFromString(item.snippet, 'text/html')
    this.typeaheadFacade.storeSelectedTypeahead({
      ...item,
      snippet: parsedHtml.body.textContent,
    })
  }

  private loadNextBatch(): void {
    this.isBatchLoading.set(true)
    this.loadMore.emit()
  }

  #selectSelectedTypeahead(): void {
    this.typeaheadFacade.selectSelectedTypeahead$
      .pipe(takeUntil(this.toDestroy$))
      .subscribe((selected) => this.selectedTypeahead.set(selected))
  }

  #selectIsLoadingNextBatch(): void {
    this.typeaheadFacade.selectIsLoadingNextPage$
      .pipe(takeUntil(this.toDestroy$))
      .subscribe((isLoading) => {
        this.isBatchLoading.set(isLoading)
        if (isLoading) {
          const scroller = this.elRef.nativeElement.querySelector('.scroller')
          if (scroller) {
            console.log('Scrolling up by 10px')
            scroller.scrollTop -= 50
          }
        }
      })
  }

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent): void {
    // When a user clicks outside the suggestion list, or it is not an input element, hide the list
    if (
      !this.elRef.nativeElement.contains(event.target) &&
      event.target['tagName'] !== 'INPUT'
    ) {
      this.hide.emit()
    }
  }
}

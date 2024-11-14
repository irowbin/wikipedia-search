import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { VirtualScrollerComponent } from '../virtual-scroller/virtual-scroller.component'
import { TypeaheadStateFacade } from '../../+state/typeahead-state.facade'
import { SearchResult } from '../../models/typeahead.model'
import { TypeaheadSuggestionsListComponent } from '../typeahead-suggestions-list/typeahead-suggestions-list.component'
@Component({
  selector: 'app-typeahead',
  standalone: true,
  imports: [
    CommonModule,
    VirtualScrollerComponent,
    TypeaheadSuggestionsListComponent,
  ],
  templateUrl: './typeahead.component.html',
  styleUrl: './typeahead.component.scss',
})
export class TypeaheadComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly toDestroy$ = new Subject<void>()
  @ViewChild('typeahead')
  public readonly typeahead: ElementRef<HTMLInputElement>

  private readonly appFacade = inject(TypeaheadStateFacade)

  public query$ = new Subject<string>()

  public readonly page = signal<number>(1)
  public readonly suggestions = signal<SearchResult[]>([])
  public readonly searchTerm = signal<string>('')
  public readonly isDropdownVisible = signal<boolean>(false)

  /**
   * We have tri state for loading, undefined means we don't know yet
   * undefined is to do nothing, true is to show loading; false is to hide loading.
   *
   * @see TypeaheadState
   */
  public readonly isSearchLoading = signal<boolean>(undefined)

  public ngOnInit(): void {
    this.#selectIsSearchLoading()
    this.#selectSuggestions()
  }

  public ngAfterViewInit(): void {
    this.#focusInput()
  }

  public ngOnDestroy(): void {
    this.toDestroy$.next()
    this.toDestroy$.complete()
  }

  public onInputChange(value: string): void {
    value = value.trim()
    this.searchTerm.set(value)
    this.query$.next(value)
  }

  public toggleDropdown(isVisible?: boolean): void {
    this.isDropdownVisible.set(isVisible)
  }

  public loadNextBatch(): void {
    console.log('loadNextBatch')
    this.appFacade.fetchNextPage(this.searchTerm().trim(), this.page() + 1)
  }

  #focusInput(): void {
    this.typeahead.nativeElement.focus()
  }

  #selectSuggestions(): void {
    this.query$
      .pipe(
        debounceTime(500),
        tap(() => {
          this.appFacade.toggleSearchLoadingState(true)
          this.suggestions.set([])
        }),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.trim().length === 0) {
            return of([])
          }

          return this.appFacade.selectQueries$.pipe(
            map((queries) => queries[query]),
            tap((suggestions) => {
              if (!suggestions) {
                this.appFacade.fetchSuggestions(query)
              }
            }),
            filter((suggestions) => typeof suggestions !== 'undefined')
          )
        }),
        takeUntil(this.toDestroy$)
      )
      .subscribe((suggestions) => {
        this.isDropdownVisible.set(suggestions?.length > 0)
        this.suggestions.set([...suggestions])
        this.appFacade.toggleSearchLoadingState(false)
      })
  }

  #selectIsSearchLoading(): void {
    this.appFacade.selectIsLoading$
      .pipe(takeUntil(this.toDestroy$))
      .subscribe((isLoading) => {
        this.isSearchLoading.set(isLoading)
      })
  }
}

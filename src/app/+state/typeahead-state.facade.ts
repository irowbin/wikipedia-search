import { Injectable, inject } from '@angular/core'
import { Store } from '@ngrx/store'
import * as TypeaheadSelectors from './typeahead-state.selectors'
import * as TypeaheadActions from './typeahead-state.actions'
import { SearchResult } from '../models/typeahead.model'
import { TypeaheadStateKeys } from './typeahead-state.models'

@Injectable({ providedIn: 'root' })
export class TypeaheadStateFacade {
  private readonly store = inject(Store)

  public readonly selectQueryPageInfo$ = this.store.select(
    TypeaheadSelectors.selectQueryPageInfo
  )

  public readonly selectQueries$ = this.store.select(
    TypeaheadSelectors.selectQueries
  )

  public readonly selectIsLoading$ = this.store.select(
    TypeaheadSelectors.isTypeaheadLoading
  )

  public readonly selectError$ = this.store.select(
    TypeaheadSelectors.selectError
  )

  public readonly selectSelectedTypeahead$ = this.store.select(
    TypeaheadSelectors.selectSelectedTypeahead
  )

  public selectIsLoadingNextPage$ =    this.store.select(TypeaheadSelectors.selectIsLoadingNextPage)


  public resetTypeaheadState(stateKey: TypeaheadStateKeys): void {
    this.store.dispatch(TypeaheadActions.resetTypeaheadState({ stateKey }))
  }

  public fetchSuggestions(query: string, page = 1): void {
    this.store.dispatch(TypeaheadActions.search({ query, page }))
  }

  public fetchNextPage(query: string, page: number): void {
    this.store.dispatch(TypeaheadActions.fetchNextPage({ query, page }))
  }


  public toggleSearchLoadingState(isSearchLoading: boolean): void {
    this.store.dispatch(TypeaheadActions.toggleLoading({ isSearchLoading }))
  }

  public storeSelectedTypeahead(selectedTypeahead: SearchResult): void {
    this.store.dispatch(
      TypeaheadActions.selectedTypeahead({ selectedTypeahead })
    )
  }
}

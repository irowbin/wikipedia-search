import { inject, Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import * as TypeaheadActions from './typeahead-state.actions'
import { ApiService } from '../services/api.service'
import { map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'
import { fetch } from '@ngrx/router-store/data-persistence'

@Injectable()
export class TypeaheadEffects {
  private readonly actions$ = inject(Actions)
  private readonly apiService = inject(ApiService)


  public search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TypeaheadActions.search),
      fetch({
        run: (action) =>
          this.apiService.search(action.query, action.page).pipe(
            map((response) =>
              TypeaheadActions.searchSuccess({
                query: action.query,
                results: response,
                page: action.page,
              })
            ),
            catchError((error) => of(TypeaheadActions.searchFailure({ error })))
          ),
        onError: (action, error) => {
          console.error('Error', error)
          return TypeaheadActions.searchFailure({ error })
        },
      })
    )
  )
  public fetchNextPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TypeaheadActions.fetchNextPage),
      fetch({
        run: (action) =>
          this.apiService.search(action.query, action.page).pipe(
            map((response) =>
              TypeaheadActions.fetchNextPageSuccess({
                query: action.query,
                results: response,
                page: action.page,
              })
            ),
            catchError((error) =>
              of(TypeaheadActions.fetchNextPageFailure({ error }))
            )
          ),
        onError: (action, error) => {
          console.error('Error', error)
          return TypeaheadActions.fetchNextPageFailure({ error })
        },
      })
    )
  )
}

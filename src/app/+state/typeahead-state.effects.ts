import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetch } from '@ngrx/router-store/data-persistence';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '@/services/api.service';
import * as TypeaheadActions from './typeahead-state.actions';

@Injectable()
export class TypeaheadEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiService = inject(ApiService);

  private createSearchEffect(
    actionType: typeof TypeaheadActions.search | typeof TypeaheadActions.fetchNextPage,
    successAction: typeof TypeaheadActions.searchSuccess | typeof TypeaheadActions.fetchNextPageSuccess,
    failureAction: typeof TypeaheadActions.searchFailure | typeof TypeaheadActions.fetchNextPageFailure
  ) {
    return createEffect(() =>
      this.actions$.pipe(
        ofType(actionType),
        fetch({
          run: (action) =>
            this.apiService.search(action.query, action.page).pipe(
              map(({ results, totalPages }) =>
                successAction({
                  query: action.query,
                  results,
                  page: action.page,
                  totalPages,
                })
              ),
              catchError((error) => of(failureAction({ error })))
            ),
          onError: (action, error) => {
            console.error('Error', error);
            return failureAction({ error });
          },
        })
      )
    );
  }

  public search$ = this.createSearchEffect(
    TypeaheadActions.search,
    TypeaheadActions.searchSuccess,
    TypeaheadActions.searchFailure
  );

  public fetchNextPage$ = this.createSearchEffect(
    TypeaheadActions.fetchNextPage,
    TypeaheadActions.fetchNextPageSuccess,
    TypeaheadActions.fetchNextPageFailure
  );
}
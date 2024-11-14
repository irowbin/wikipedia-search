import { createSelector, createFeatureSelector } from '@ngrx/store'
import { TYPEAHEAD_STATE_FEATURE_KEY } from './typeahead-state.reducer'
import { TypeaheadState } from './typeahead-state.models'

export const selectTypeaheadState = createFeatureSelector<TypeaheadState>(
  TYPEAHEAD_STATE_FEATURE_KEY
)

export const selectQueries = createSelector(
  selectTypeaheadState,
  (state: TypeaheadState) => state.queries
)

export const isTypeaheadLoading = createSelector(
  selectTypeaheadState,
  (state: TypeaheadState) => state.isSearchLoading
)

export const selectError = createSelector(
  selectTypeaheadState,
  (state: TypeaheadState) => state.error
)

export const selectSelectedTypeahead = createSelector(
  selectTypeaheadState,
  (state: TypeaheadState) => state.selectedTypeahead
)

export const selectIsLoadingNextPage = createSelector(
  selectTypeaheadState,
  (state: TypeaheadState) => state.isNextPageLoading
)

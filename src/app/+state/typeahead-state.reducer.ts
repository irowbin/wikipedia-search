import { createReducer, on, Action } from '@ngrx/store'
import * as TypeaheadActions from './typeahead-state.actions'
import { resetStateProperty } from '../utils/state-reset-utility'
import { TypeaheadState } from './typeahead-state.models'

export const TYPEAHEAD_STATE_FEATURE_KEY = 'typeaheadState'

export const initialState: TypeaheadState = {
  queries: {},
  isSearchLoading: undefined,
  error: undefined,
  selectedTypeahead: undefined,
  isNextPageLoading: undefined,
}

const reducer = createReducer(
  initialState,
  on(TypeaheadActions.resetTypeaheadState, (state, { stateKey }) =>
    resetStateProperty<TypeaheadState>(state, initialState, stateKey)
  ),
  on(TypeaheadActions.search, (state) => ({
    ...state,
    isSearchLoading: true,
    error: null,
  })),
  on(TypeaheadActions.searchSuccess, (state, { query, results }) => ({
    ...state,
    isSearchLoading: false,
    queries: {
      ...state.queries,
      [query]: results,
    },
  })),
  on(TypeaheadActions.searchFailure, (state, { error }) => ({
    ...state,
    isSearchLoading: false,
    error,
  })),
  on(TypeaheadActions.toggleLoading, (state, { isSearchLoading }) => ({
    ...state,
    isSearchLoading,
  })),
  on(TypeaheadActions.selectedTypeahead, (state, { selectedTypeahead }) => ({
    ...state,
    selectedTypeahead,
  })),
  on(TypeaheadActions.fetchNextPage, (state) => ({
    ...state,
    isNextPageLoading: true,
  })),
  on(TypeaheadActions.fetchNextPageSuccess, (state, { query, results }) => ({
    ...state,
    isNextPageLoading: false,
    queries: {
      ...state.queries,
      [query]: [...state.queries[query], ...results],
    },
  })),
  on(TypeaheadActions.fetchNextPageFailure, (state, { error }) => ({
    ...state,
    isNextPageLoading: false,
    error,
  }))
)

export function typeaheadReducer(
  state: TypeaheadState | undefined,
  action: Action
) {
  return reducer(state, action)
}

import { Action, createReducer, on } from '@ngrx/store'
import * as TypeaheadActions from './typeahead-state.actions'
import { resetStateProperty } from '../utils/state-reset-utility'
import { TypeaheadState } from './typeahead-state.models'
import { SearchResult } from '../models/typeahead.model'

/** Name of the feature */
export const TYPEAHEAD_STATE_FEATURE_KEY = 'typeaheadState'

/** Initial state for the typeahead state */
export const initialState: TypeaheadState = {
  queries: {},
  queryPageInfo: {},
  isSearchLoading: undefined,
  error: undefined,
  selectedTypeahead: undefined,
  isNextPageLoading: undefined,
}

/** Local utility function to add serial numbers to search results */
function getResultsWithSN(
  existingResults: SearchResult[],
  newResults: SearchResult[]
) {
  const snStart = existingResults.length
    ? existingResults[existingResults.length - 1].sn + 1
    : 1
  return newResults.map((result, index) => ({ ...result, sn: snStart + index }))
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
  on(TypeaheadActions.searchSuccess, (state, { query, results, page, totalPages }) => ({
    ...state,
    isSearchLoading: false,
    queries: {
      ...state.queries,
      [query]: getResultsWithSN([], results),
    },
    queryPageInfo: {
      ...state.queryPageInfo,
      [query]: { currentPage: page, totalPages },
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
  on(TypeaheadActions.fetchNextPageSuccess, (state, { query, results, page, totalPages }) => ({
    ...state,
    isNextPageLoading: false,
    queries: {
      ...state.queries,
      [query]: [
        ...(state.queries[query] || []),
        ...getResultsWithSN(state.queries[query] || [], results),
      ],
    },
    queryPageInfo: {
      ...state.queryPageInfo,
      [query]: { currentPage: page, totalPages },
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

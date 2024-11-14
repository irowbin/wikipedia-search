import { createAction, props } from '@ngrx/store'
import { SearchResult } from '../models/typeahead.model'
import { TypeaheadStateKeys } from './typeahead-state.models'

export enum TypeaheadActionTypes {
  SEARCH = '[Typeahead] Search',
  SEARCH_SUCCESS = '[Typeahead] Search Success',
  SEARCH_FAILURE = '[Typeahead] Search Failure',

  FETCH_NEXT_PAGE = '[Typeahead] Fetch Next Page',
  FETCH_NEXT_PAGE_SUCCESS = '[Typeahead] Fetch Next Page Success',
  FETCH_NEXT_PAGE_FAILURE = '[Typeahead] Fetch Next Page Failure',

  SELECTED_TYPEAHEAD = '[Typeahead] Selected Typeahead',

  TOGGLE_LOADING = '[Typeahead] Toggle Loading',

  RESET_STATE = '[Typeahead] Reset State',
}

export const search = createAction(
  TypeaheadActionTypes.SEARCH,
  props<{ query: string; page: number }>()
)

export const searchSuccess = createAction(
  TypeaheadActionTypes.SEARCH_SUCCESS,
  props<{ query: string; results: SearchResult[]; page: number }>()
)

export const searchFailure = createAction(
  TypeaheadActionTypes.SEARCH_FAILURE,
  props<{ error: unknown }>()
)

export const resetTypeaheadState = createAction(
  TypeaheadActionTypes.RESET_STATE,
  props<{
    stateKey: TypeaheadStateKeys
  }>()
)

export const toggleLoading = createAction(
  TypeaheadActionTypes.TOGGLE_LOADING,
  props<{ isSearchLoading: boolean }>()
)

export const selectedTypeahead = createAction(
  TypeaheadActionTypes.SELECTED_TYPEAHEAD,
  props<{ selectedTypeahead: SearchResult }>()
)

export const fetchNextPage = createAction(
  TypeaheadActionTypes.FETCH_NEXT_PAGE,
  props<{ query: string; page: number }>()
)

export const fetchNextPageSuccess = createAction(
  TypeaheadActionTypes.FETCH_NEXT_PAGE_SUCCESS,
  props<{ query: string; results: SearchResult[]; page: number }>()
)

export const fetchNextPageFailure = createAction(
  TypeaheadActionTypes.FETCH_NEXT_PAGE_FAILURE,
  props<{ error: unknown }>()
)

import { SearchResult } from '../models/typeahead.model'

export type TypeaheadStateKeys =
  | keyof TypeaheadState
  | (string & keyof TypeaheadState)
  | Array<keyof TypeaheadState | (string & keyof TypeaheadState)>

export interface QueryPageInfo {
  [key: string]: { currentPage: number; totalPages?: number }
}

export interface TypeaheadState {
  queries: { [key: string]: SearchResult[] }
  queryPageInfo: QueryPageInfo
  selectedTypeahead: SearchResult | undefined
  isSearchLoading: boolean | undefined
  isNextPageLoading: boolean | undefined
  error: unknown | undefined
}

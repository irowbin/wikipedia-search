import { SearchResult } from '../models/typeahead.model'

export type TypeaheadStateKeys =
  | keyof TypeaheadState
  | (string & keyof TypeaheadState)
  | Array<keyof TypeaheadState | (string & keyof TypeaheadState)>

export interface TypeaheadState {
  queries: { [key: string]: SearchResult[] }
  selectedTypeahead: SearchResult | undefined
  isSearchLoading: boolean | undefined
  isNextPageLoading: boolean | undefined,
  error: unknown | undefined
}

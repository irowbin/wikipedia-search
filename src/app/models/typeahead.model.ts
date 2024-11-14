export interface QueryState {
  results: SearchResult[]
  currentPage: number
  totalPages?: number
}
export interface SearchResult {
  sn: number
  title: string
  snippet: string
  pageid: number
}

export interface WikipediaSearchResponse {
  batchcomplete?: string
  continue?: {
    sroffset: number
    continue: string
  }
  query?: {
    searchinfo?: {
      totalhits?: number
    }
    search: SearchResult[]
  }
}

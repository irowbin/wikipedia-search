export interface SearchResult {
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

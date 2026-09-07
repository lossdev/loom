export interface ImageSearchResult {
  name: string;
  isLocal: boolean;
  isOfficial: boolean;
  description?: string | null;
  stars?: number | null;
}

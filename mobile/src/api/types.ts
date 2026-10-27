export type TitleKind = "movie" | "series";
export type TitleStatus = "unwatched" | "watching" | "watched";

export type Title = {
  id: number;
  userId: number;
  name: string;
  kind: TitleKind;
  genre: string | null;
  status: TitleStatus;
  runtimeMinutes: number | null;
  externalId: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: number;
  email: string;
};

export type TvmazeResult = {
  externalId: number;
  name: string;
  genres: string[];
  runtimeMinutes: number | null;
  imageUrl: string | null;
  premiered: string | null;
  summary: string | null;
};

export type TitleInput = {
  name: string;
  kind: TitleKind;
  genre?: string;
  status: TitleStatus;
  runtimeMinutes?: number;
  externalId?: number;
  imageUrl?: string;
};

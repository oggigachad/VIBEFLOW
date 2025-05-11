export type Song = {
  id: string
  title: string
  artist: string
  genre: string
  coverUrl: string
  audioUrl: string
  duration: number
}

export type Genre = {
  id: string
  name: string
  coverUrl: string
}

export type Lyrics = {
  time: number
  text: string
}[]

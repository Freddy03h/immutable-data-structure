import Immutable from 'immutable'

export const initialState = Immutable.Map({
  data: Immutable.Map(),
  relations: Immutable.Map(),
})

export const SerieRecord = Immutable.Record({
  id: null,
  title: null,
  type_id: null,
})
export const serieForeignKeys = ['type_id']

export const EditionRecord = Immutable.Record({
  id: null,
  title: null,
  publisher_id: null,
  series_id: null,
})
export const editionForeignKeys = ['publisher_id', 'series_id']

export const VolumeRecord = Immutable.Record({
  id: null,
  title: null,
  number: null,
  date: null,
  img: null,
  isbn: null,
  edition_id: null,
  content: null,
})
export const volumeForeignKeys = ['edition_id']

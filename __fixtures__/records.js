import Immutable from 'immutable'

export const SerieRecord = Immutable.Record({
  id: null,
  title: null,
  type_id: null,
})
export const serieForeignKeys = ['type_id']
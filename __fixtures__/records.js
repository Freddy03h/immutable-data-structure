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
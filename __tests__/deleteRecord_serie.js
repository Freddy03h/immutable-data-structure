import Immutable from 'immutable'
import { mergeRecords, deleteRecord } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import { initialState, SerieRecord, serieForeignKeys } from '../__fixtures__/records'

describe('deleteRecord serie', () => {

  test('one item with empty store', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)
    expect(
      deleteRecord(initialState, serie.get('id'), serieForeignKeys)
    ).toMatchSnapshot()
  })

  test('one item with big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const store = mergeRecords(initialState, SerieRecord, series, serieForeignKeys)

    const serie = Immutable.fromJS(serieDeathNoteJSON)

    expect(
      deleteRecord(store, serie.get('id'), serieForeignKeys)
    ).toMatchSnapshot()
  })

})

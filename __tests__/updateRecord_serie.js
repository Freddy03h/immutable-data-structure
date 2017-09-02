import Immutable from 'immutable'
import { createUpdateRecord, createMergeRecords } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import { initialState, SerieRecord, serieForeignKeys } from '../__fixtures__/records'

const updateSerieRecord = createUpdateRecord(SerieRecord, serieForeignKeys)
const mergeSeriesRecords = createMergeRecords(SerieRecord, serieForeignKeys)

describe('updateRecord serie', () => {

  test('one item with empty store', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)
    expect(
      updateSerieRecord(initialState, serie)
    ).toMatchSnapshot()
  })

  test('one item with big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const store = mergeSeriesRecords(initialState, series)

    const serie = Immutable.fromJS(serieDeathNoteJSON)

    expect(
      updateSerieRecord(store, serie)
    ).toMatchSnapshot()
  })

})

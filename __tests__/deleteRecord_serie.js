import Immutable from 'immutable'
import { initialState, createDeleteRecord, createMergeRecords } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import { SerieRecord, serieForeignKeys } from '../__fixtures__/records'

const deleteSerieRecord = createDeleteRecord(serieForeignKeys)
const mergeSeriesRecords = createMergeRecords(SerieRecord, serieForeignKeys)

describe('deleteRecord serie', () => {

  test('one item with empty store', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)
    expect(
      deleteSerieRecord(initialState, serie.get('id'))
    ).toMatchSnapshot()
  })

  test('one item with big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const store = mergeSeriesRecords(initialState, series)

    const serie = Immutable.fromJS(serieDeathNoteJSON)

    expect(
      deleteSerieRecord(store, serie.get('id'))
    ).toMatchSnapshot()
  })

})

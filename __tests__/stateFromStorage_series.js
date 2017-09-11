import Immutable from 'immutable'
import {
  initialState,
  createMergeRecords, createUpdateRecord, createReplaceRecords,
  stateFromStorage, storageFromState,
} from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import { SerieRecord, serieForeignKeys } from '../__fixtures__/records'

const seriesInitialState = initialState.set('data', Immutable.OrderedMap())
const updateSerieRecord = createUpdateRecord(SerieRecord, serieForeignKeys)
const mergeSeriesRecords = createMergeRecords(SerieRecord, serieForeignKeys)
const replaceSeriesRecords = createReplaceRecords(SerieRecord, serieForeignKeys)

const series = Immutable.fromJS(seriesJSON)
const serie1 = Immutable.fromJS(serieDeathNoteJSON)
const serie2 = Immutable.fromJS(serieFullmetalAlchemistJSON)

describe('stateFromStorage series', () => {

  test('big store', () => {
    const store1 = replaceSeriesRecords(seriesInitialState, series)
    const store2 = updateSerieRecord(store1, serie1)
    const store3 = updateSerieRecord(store2, serie2)

    const localStorage = storageFromState(store3)
    const newStore = stateFromStorage(seriesInitialState, SerieRecord, localStorage, serieForeignKeys)

    expect(
      newStore
    ).toMatchSnapshot()
  })

})

import Immutable from 'immutable'
import {
  initialState,
  createMergeRecords, createUpdateRecord, createReplaceRecords,
  createStateFromStorage, storageFromState,
} from '../src/index'

import seriesJSON from '../__fixtures__/series_long.json'
import { SerieRecord, serieForeignKeys } from '../__fixtures__/records'

const seriesInitialState = initialState.set('data', Immutable.OrderedMap())
const replaceSeriesRecords = createReplaceRecords(SerieRecord, serieForeignKeys)

const series = Immutable.fromJS(seriesJSON)

describe('replaceRecords series', () => {

  test('very long list', () => {
    expect(
      replaceSeriesRecords(seriesInitialState, series)
    ).toMatchSnapshot()
  })

})

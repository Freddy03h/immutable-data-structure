import Immutable from 'immutable'
import { initialState, createMergeRecords, createUpdateRecord, createAsyncMergeRecords, createAsyncReplaceRecords } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import { SerieRecord, serieForeignKeys } from '../__fixtures__/records'

const seriesInitialState = initialState.set('data', Immutable.OrderedMap())
const updateSerieRecord = createUpdateRecord(SerieRecord, serieForeignKeys)
const mergeSeriesRecords = createMergeRecords(SerieRecord, serieForeignKeys)

const asyncReplaceSeriesRecords = createAsyncReplaceRecords(SerieRecord, serieForeignKeys)
const asyncMergeSeriesRecords = createAsyncMergeRecords(SerieRecord, serieForeignKeys)

describe('asyncMergeRecords series', () => {

  test('big list with empty store', () => {
    const series = Immutable.fromJS(seriesJSON)

    const promise = asyncMergeSeriesRecords(seriesInitialState, series)

    return promise.then((state) =>
      expect(state).toMatchSnapshot()
    )
  })

  test('little list with empty store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)

    const promise = asyncMergeSeriesRecords(seriesInitialState, seriesLittle)

    return promise.then((state) =>
      expect(state).toMatchSnapshot()
    )
  })

  test('big list with little store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    const store = mergeSeriesRecords(seriesInitialState, seriesLittle)

    const promise = asyncMergeSeriesRecords(store, series)

    return promise.then((state) =>
      expect(state).toMatchSnapshot()
    )
  })

  test('little list with big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    const store = mergeSeriesRecords(seriesInitialState, series)

    const promise = asyncReplaceSeriesRecords(store, seriesLittle)

    return promise.then((state) =>
      expect(state).toMatchSnapshot()
    )
  })

  test('little list with on update on big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(6)
    const serie = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store1 = mergeSeriesRecords(seriesInitialState, series)
    const store2 = updateSerieRecord(store1, serie)

    const promise = asyncReplaceSeriesRecords(store2, seriesLittle)

    return promise.then((state) =>
      expect(state).toMatchSnapshot()
    )
  })

  test('update on empty list and after entire list keep order', () => {
    const series = Immutable.fromJS(seriesJSON)
    const serie = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store = updateSerieRecord(seriesInitialState, serie)

    const promise = asyncReplaceSeriesRecords(store, series)

    return promise.then((state) =>
      expect(state).toMatchSnapshot()
    )
  })

})

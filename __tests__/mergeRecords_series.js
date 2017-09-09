import Immutable from 'immutable'
import { initialState, createMergeRecords, createUpdateRecord } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import { SerieRecord, serieForeignKeys } from '../__fixtures__/records'

const seriesInitialState = initialState.set('data', Immutable.OrderedMap())
const updateSerieRecord = createUpdateRecord(SerieRecord, serieForeignKeys)
const mergeSeriesRecords = createMergeRecords(SerieRecord, serieForeignKeys)

describe('mergeRecords series', () => {

  test('big list with empty store', () => {
    const series = Immutable.fromJS(seriesJSON)
    expect(
      mergeSeriesRecords(seriesInitialState, series)
    ).toMatchSnapshot()
  })

  test('little list with empty store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    expect(
      mergeSeriesRecords(seriesInitialState, seriesLittle)
    ).toMatchSnapshot()
  })

  test('big list with little store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    const store = mergeSeriesRecords(seriesInitialState, seriesLittle)

    expect(
      mergeSeriesRecords(store, series)
    ).toMatchSnapshot()
  })

  test('little list with big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    const store = mergeSeriesRecords(seriesInitialState, series)

    expect(
      mergeSeriesRecords(store, seriesLittle, true)
    ).toMatchSnapshot()
  })

  test('little list with on update on big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(6)
    const serie = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store1 = mergeSeriesRecords(seriesInitialState, series)
    const store2 = updateSerieRecord(store1, serie)

    expect(
      mergeSeriesRecords(store2, seriesLittle, true)
    ).toMatchSnapshot()
  })

  test('update on empty list and after entire list keep order', () => {
    const series = Immutable.fromJS(seriesJSON)
    const serie = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store = updateSerieRecord(seriesInitialState, serie)

    expect(
      mergeSeriesRecords(store, series, true)
    ).toMatchSnapshot()
  })

})

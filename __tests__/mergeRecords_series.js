import Immutable from 'immutable'
import { initialState, createMergeRecords, createUpdateRecord } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import { SerieRecord, serieForeignKeys } from '../__fixtures__/records'

const updateSerieRecord = createUpdateRecord(SerieRecord, serieForeignKeys)
const mergeSeriesRecords = createMergeRecords(SerieRecord, serieForeignKeys)

describe('mergeRecords series', () => {

  test('big list with empty store', () => {
    const series = Immutable.fromJS(seriesJSON)
    expect(
      mergeSeriesRecords(initialState, series)
    ).toMatchSnapshot()
  })

  test('little list with empty store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    expect(
      mergeSeriesRecords(initialState, seriesLittle)
    ).toMatchSnapshot()
  })

  test('big list with little store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    const store = mergeSeriesRecords(initialState, seriesLittle)

    expect(
      mergeSeriesRecords(store, series)
    ).toMatchSnapshot()
  })

  test('little list with big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    const store = mergeSeriesRecords(initialState, series)

    expect(
      mergeSeriesRecords(store, seriesLittle, true)
    ).toMatchSnapshot()
  })

  test('little list with on update on big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(6)
    const serie = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store1 = mergeSeriesRecords(initialState, series)
    const store2 = updateSerieRecord(store1, serie)

    expect(
      mergeSeriesRecords(store2, seriesLittle, true)
    ).toMatchSnapshot()
  })

})

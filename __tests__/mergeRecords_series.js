import Immutable from 'immutable'
import { createMergeRecords } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import { initialState, SerieRecord, serieForeignKeys } from '../__fixtures__/records'

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

    // for this case, we don't need to do something in the lib
    // just don't use the previous store (use initialState instead of store)
    expect(
      mergeSeriesRecords(initialState, seriesLittle)
    ).toMatchSnapshot()
  })

})

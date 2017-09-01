import Immutable from 'immutable'
import { mergeRecords } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import { initialState, SerieRecord, serieForeignKeys } from '../__fixtures__/records'

describe('mergeRecords series', () => {

  test('big list with empty store', () => {
    const series = Immutable.fromJS(seriesJSON)
    expect(
      mergeRecords(initialState, SerieRecord, series, serieForeignKeys)
    ).toMatchSnapshot()
  })

  test('little list with empty store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    expect(
      mergeRecords(initialState, SerieRecord, seriesLittle, serieForeignKeys)
    ).toMatchSnapshot()
  })

  test('big list with little store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    const store = mergeRecords(initialState, SerieRecord, seriesLittle, serieForeignKeys)

    expect(
      mergeRecords(store, SerieRecord, series, serieForeignKeys)
    ).toMatchSnapshot()
  })

  test('little list with big store', () => {
    const series = Immutable.fromJS(seriesJSON)
    const seriesLittle = series.splice(5)
    const store = mergeRecords(initialState, SerieRecord, series, serieForeignKeys)

    // for this case, we don't need to do something in the lib
    // just don't use the previous store (use initialState instead of store)
    expect(
      mergeRecords(initialState, SerieRecord, seriesLittle, serieForeignKeys)
    ).toMatchSnapshot()
  })

})

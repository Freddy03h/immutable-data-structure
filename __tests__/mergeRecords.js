import Immutable from 'immutable'
import { mergeRecords } from '../src/index'

import seriesJSON from '../__fixtures__/series.json'
import { SerieRecord, serieForeignKeys } from '../__fixtures__/records'

describe('mergeRecords', () => {
  test('simple list', () => {
    const series = Immutable.fromJS(seriesJSON)
    expect(
      mergeRecords(Immutable.Map({}), SerieRecord, series, serieForeignKeys)
    ).toMatchSnapshot()
  })
})

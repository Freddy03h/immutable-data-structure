import Immutable from 'immutable'
import {
  initialState,
  createMergeRecords, createMergeCompleteListsRecords,
  keepOnlyRecords,
} from '../src/index'

import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import authorObaJSON from '../__fixtures__/author_oba.json'
import { VolumeRecord, volumeForeignKeys } from '../__fixtures__/records'

const mergeVolumeRecords = createMergeRecords(VolumeRecord, volumeForeignKeys)
const mergeVolumeRecordsFromSeries = createMergeCompleteListsRecords(mergeVolumeRecords, 'volumes', 'edition_id')

const serie1 = Immutable.fromJS(serieDeathNoteJSON)
const serie2 = Immutable.fromJS(serieFullmetalAlchemistJSON)
const author1 = Immutable.fromJS(authorObaJSON)

describe('keepOnlyRecords volume', () => {

  test('big store', () => {
    const store1 = mergeVolumeRecordsFromSeries(initialState, serie1.get('editions'))
    const store2 = mergeVolumeRecordsFromSeries(store1, serie2.get('editions'))
    const editionsAuthor = author1.get('tasks')
      .map((task) => task.getIn(['series', 'editions']))
      .flatten(true)
    const store3 = mergeVolumeRecordsFromSeries(store2, editionsAuthor)

    const idsToKeep = Immutable.Set([
      'ec23f826-05bc-4bfc-b3e1-b2227e782ce9',
      '8d5329c8-2ad5-4713-8961-84f2e42a61c6',
      '58715dcb-ce62-4b8c-a6b0-6412310b12ff',
    ])

    expect(
      keepOnlyRecords(store3, idsToKeep)
    ).toMatchSnapshot()
  })

})

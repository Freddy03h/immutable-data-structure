import Immutable from 'immutable'
import {
  initialState,
  createMergeRecords, createMergeCompleteListsRecords,
  stateFromStorage, storageFromState,
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

describe('stateFromStorage volume', () => {

  test('big store', () => {
    const store1 = mergeVolumeRecordsFromSeries(initialState, serie1.get('editions'))
    const store2 = mergeVolumeRecordsFromSeries(store1, serie2.get('editions'))

    const editionsAuthor = author1.get('tasks')
      .map((task) => task.getIn(['series', 'editions']))
      .flatten(true)
    const store3 = mergeVolumeRecordsFromSeries(store2, editionsAuthor)

    const localStorage = storageFromState(store3)
    const newStore = stateFromStorage(initialState, VolumeRecord, localStorage, volumeForeignKeys)

    expect(
      newStore
    ).toMatchSnapshot()
  })

})

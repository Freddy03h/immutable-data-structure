import Immutable from 'immutable'
import {
  initialState,
  createMergeRecords, createMergeCompleteListsRecords, createUpdateRecord,
  getIdsByTwoForeignId, getDataByTwoForeignId,
} from '../src/index'

import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'

import {
  VolumeRecord, volumeForeignKeys,
  EditionRecord, editionForeignKeys,
  SerieRecord, serieForeignKeys,
} from '../__fixtures__/records'

const updateSerieRecord = createUpdateRecord(SerieRecord, serieForeignKeys)
const mergeVolumeRecords = createMergeRecords(VolumeRecord, volumeForeignKeys)
const mergeVolumeRecordsFromSeries = createMergeCompleteListsRecords(mergeVolumeRecords, 'volumes', 'edition_id')
const mergeEditionRecords = createMergeRecords(EditionRecord, editionForeignKeys)

const serieA = Immutable.fromJS(serieFullmetalAlchemistJSON)
const store_tmp = Immutable.Map({
  series: updateSerieRecord(initialState, serieA),
  editions: mergeEditionRecords(initialState, serieA.get('editions')),
  volumes: mergeVolumeRecordsFromSeries(initialState, serieA.get('editions')),
})

const serieB = Immutable.fromJS(serieDeathNoteJSON)
const store = Immutable.Map({
  series: updateSerieRecord(store_tmp.get('series'), serieB),
  editions: mergeEditionRecords(store_tmp.get('editions'), serieB.get('editions')),
  volumes: mergeVolumeRecordsFromSeries(store_tmp.get('volumes'), serieB.get('editions')),
})

describe('getData edition', () => {

  test('get edition ids with series_id and publisher_id', () => {
    expect(
      getIdsByTwoForeignId(store, 'editions', 'series_id', '320071be-4196-402b-98d7-d34bec8a1aab', 'publisher_id', '4c9547ff-2ef6-439a-80b8-ea705a385b76')
    ).toMatchSnapshot()
  })

  test('get edition with series_id and publisher_id', () => {
    expect(
      getDataByTwoForeignId(store, 'editions', 'series_id', '320071be-4196-402b-98d7-d34bec8a1aab', 'publisher_id', '4c9547ff-2ef6-439a-80b8-ea705a385b76')
    ).toMatchSnapshot()
  })

})

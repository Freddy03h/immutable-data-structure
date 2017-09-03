import Immutable from 'immutable'
import {
  initialState,
  createMergeRecords, createMergeCompleteListsRecords, createUpdateRecord,
  getDataById, getDataByForeignId, getDataByForeignIdThroughOtherForeignId,
  getDatas, getForeignIds,
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

describe('getData volume', () => {

  test('get volume with id', () => {
    expect(
      getDataById(store, 'volumes', 'ff15ae7e-fcfe-4061-a27b-3b481e5f313c')
    ).toMatchSnapshot()
  })

  test('get volumes with edition_id', () => {
    expect(
      getDataByForeignId(store, 'volumes', 'edition_id', '908612fd-1cc7-4780-aea4-63d3ac04c6bd')
    ).toMatchSnapshot()
  })

  test('get volumes with series_id', () => {
    expect(
      getDataByForeignIdThroughOtherForeignId(store, 'volumes', 'edition_id', 'editions', 'series_id', '320071be-4196-402b-98d7-d34bec8a1aab')
    ).toMatchSnapshot()
  })

  test('get all volumes', () => {
    expect(
      getDatas(store, 'volumes')
    ).toMatchSnapshot()
  })

  test('get volumes ids edition_id', () => {
    expect(
      getForeignIds(store, 'volumes', 'edition_id', '908612fd-1cc7-4780-aea4-63d3ac04c6bd')
    ).toMatchSnapshot()
  })

})

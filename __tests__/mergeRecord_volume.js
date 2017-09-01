import Immutable from 'immutable'
import { createMergeRecords, createMergeCompleteListsRecords } from '../src/index'

import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import authorObaJSON from '../__fixtures__/author_oba.json'
import { initialState, VolumeRecord, volumeForeignKeys } from '../__fixtures__/records'

const mergeVolumeRecords = createMergeRecords(VolumeRecord, volumeForeignKeys)
const mergeVolumeRecordsFromSeries = createMergeCompleteListsRecords(mergeVolumeRecords, 'volumes', 'edition_id')

describe('mergeRecords volume', () => {

  test('one serie with two editions on empty store', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)

    expect(
      mergeVolumeRecordsFromSeries(initialState, serie.get('editions'))
    ).toMatchSnapshot()
  })

  test('two series with two editions each on empty store', () => {
    const serieA = Immutable.fromJS(serieDeathNoteJSON)
    const serieB = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store = mergeVolumeRecordsFromSeries(initialState, serieA.get('editions'))

    expect(
      mergeVolumeRecordsFromSeries(store, serieB.get('editions'))
    ).toMatchSnapshot()
  })

  test('one serie loose a volume in an edition compare to store', () => {
    const serieA = Immutable.fromJS(serieDeathNoteJSON)
    const serieB = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store1 = mergeVolumeRecordsFromSeries(initialState, serieA.get('editions'))
    const store2 = mergeVolumeRecordsFromSeries(store1, serieB.get('editions'))

    const editionsSpliced = serieB
      .removeIn(['editions', 0, 'volumes', 0]) // remove a volume from an edition
      .get('editions')

    expect(
      mergeVolumeRecordsFromSeries(store2, editionsSpliced)
    ).toMatchSnapshot()
  })


  test('one author with 3 series and many editions', () => {
    const author = Immutable.fromJS(authorObaJSON)
    const editionsAuthor = author.get('tasks')
      .map((task) => task.getIn(['series', 'editions']))
      .flatten(true)

    expect(
      mergeVolumeRecordsFromSeries(initialState, editionsAuthor)
    ).toMatchSnapshot()
  })

  // test('one serie then author of the serie but an edition is missing', () => {
  //   const serie = Immutable.fromJS(serieDeathNoteJSON)
  //   const author = Immutable.fromJS(authorObaJSON)

  //   const store = mergeRecords(initialState, VolumeRecord, serie.get('editions'), volumeForeignKeys)

  //   const seriesAuthor = author.get('tasks')
  //     .map((task) => task.get('series'))
  //     .removeIn([2, 'editions']) // remove death note editions, so it supposed to be deleted from store

  //   expect(
  //     store.withMutations((collection) => {
  //       seriesAuthor.forEach(
  //         (serie) => {
  //           mergeRecords(collection, VolumeRecord, serie.get('editions'), volumeForeignKeys, 'id', ['series_id', serie.get('id')])
  //         }
  //       )
  //     })
  //   ).toMatchSnapshot()
  // })


})

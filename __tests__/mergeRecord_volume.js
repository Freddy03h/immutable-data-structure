import Immutable from 'immutable'
import { mergeRecords, mergeCompleteListsRecords } from '../src/index'

import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import authorObaJSON from '../__fixtures__/author_oba.json'
import { initialState, VolumeRecord, volumeForeignKeys } from '../__fixtures__/records'

describe('mergeRecords volume', () => {

  test('one serie with two editions on empty store', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)

    expect(
      mergeCompleteListsRecords(initialState, VolumeRecord, serie.get('editions'), 'volumes', 'editions_id', 'id', volumeForeignKeys)
    ).toMatchSnapshot()
  })

  test('two series with two editions each on empty store', () => {
    const serieA = Immutable.fromJS(serieDeathNoteJSON)
    const serieB = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store = mergeCompleteListsRecords(initialState, VolumeRecord, serieA.get('editions'), 'volumes', 'editions_id', 'id', volumeForeignKeys)

    expect(
      mergeCompleteListsRecords(store, VolumeRecord, serieB.get('editions'), 'volumes', 'editions_id', 'id', volumeForeignKeys)
    ).toMatchSnapshot()
  })

  // test('one serie loose an edition compare to store', () => {
  //   const serieA = Immutable.fromJS(serieDeathNoteJSON)
  //   const serieB = Immutable.fromJS(serieFullmetalAlchemistJSON)

  //   const store1 = mergeRecords(initialState, VolumeRecord, serieA.get('editions'), volumeForeignKeys)
  //   const store2 = mergeRecords(store1, VolumeRecord, serieB.get('editions'), volumeForeignKeys)

  //   const editionsSpliced = serieB.get('editions').splice(1)

  //   expect(
  //     mergeRecords(store2, VolumeRecord, editionsSpliced, volumeForeignKeys, 'id', ['series_id', serieB.get('id')])
  //   ).toMatchSnapshot()
  // })


  // test('one author with 3 series and many editions', () => {
  //   const author = Immutable.fromJS(authorObaJSON)
  //   const seriesAuthor = author.get('tasks')
  //     .map((task) => task.get('series'))

  //   expect(
  //     initialState.withMutations((collection) => {
  //       seriesAuthor.forEach(
  //         (serie) => {
  //           mergeRecords(collection, VolumeRecord, serie.get('editions'), volumeForeignKeys, 'id', ['series_id', serie.get('id')])
  //         }
  //       )
  //     })
  //   ).toMatchSnapshot()
  // })

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

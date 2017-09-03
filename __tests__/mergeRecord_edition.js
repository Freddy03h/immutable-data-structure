import Immutable from 'immutable'
import { initialState, createMergeRecords, createMergeCompleteListsRecords } from '../src/index'

import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import authorObaJSON from '../__fixtures__/author_oba.json'
import { EditionRecord, editionForeignKeys } from '../__fixtures__/records'

const mergeEditionRecords = createMergeRecords(EditionRecord, editionForeignKeys)
const mergeEditionRecordsFromSeries = createMergeCompleteListsRecords(mergeEditionRecords, 'editions', 'series_id')

describe('mergeRecords edition', () => {

  test('one serie with two editions on empty store', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)
    expect(
      mergeEditionRecords(initialState, serie.get('editions'))
    ).toMatchSnapshot()
  })

  test('two series with two editions each on empty store', () => {
    const serieA = Immutable.fromJS(serieDeathNoteJSON)
    const serieB = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store = mergeEditionRecords(initialState, serieA.get('editions'))

    expect(
      mergeEditionRecords(store, serieB.get('editions'))
    ).toMatchSnapshot()
  })

  test('one serie loose an edition compare to store', () => {
    const serieA = Immutable.fromJS(serieDeathNoteJSON)
    const serieB = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store1 = mergeEditionRecords(initialState, serieA.get('editions'))
    const store2 = mergeEditionRecords(store1, serieB.get('editions'))

    const editionsSpliced = serieB.get('editions').splice(1)

    expect(
      mergeEditionRecords(store2, editionsSpliced, false, ['series_id', serieB.get('id')])
    ).toMatchSnapshot()
  })


  test('one author with 3 series and many editions', () => {
    const author = Immutable.fromJS(authorObaJSON)
    const seriesAuthor = author.get('tasks')
      .map((task) => task.get('series'))

    expect(
      mergeEditionRecordsFromSeries(initialState, seriesAuthor)
    ).toMatchSnapshot()
  })

  test('one serie then author of the serie but an edition is missing', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)
    const author = Immutable.fromJS(authorObaJSON)

    const store = mergeEditionRecords(initialState, serie.get('editions'))

    const seriesAuthor = author.get('tasks')
      .map((task) => task.get('series'))
      .removeIn([2, 'editions']) // remove death note editions, so it supposed to be deleted from store

    expect(
      mergeEditionRecordsFromSeries(store, seriesAuthor)
    ).toMatchSnapshot()
  })


})

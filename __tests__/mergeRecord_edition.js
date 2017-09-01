import Immutable from 'immutable'
import { mergeRecords } from '../src/index'

import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import authorObaJSON from '../__fixtures__/author_oba.json'
import { initialState, EditionRecord, editionForeignKeys } from '../__fixtures__/records'

describe('mergeRecords edition', () => {

  test('one serie with two editions on empty store', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)
    expect(
      mergeRecords(initialState, EditionRecord, serie.get('editions'), editionForeignKeys)
    ).toMatchSnapshot()
  })

  test('two series with two editions each on empty store', () => {
    const serieA = Immutable.fromJS(serieDeathNoteJSON)
    const serieB = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store = mergeRecords(initialState, EditionRecord, serieA.get('editions'), editionForeignKeys)

    expect(
      mergeRecords(store, EditionRecord, serieB.get('editions'), editionForeignKeys)
    ).toMatchSnapshot()
  })

  test('one serie loose an edition compare to store', () => {
    const serieA = Immutable.fromJS(serieDeathNoteJSON)
    const serieB = Immutable.fromJS(serieFullmetalAlchemistJSON)

    const store1 = mergeRecords(initialState, EditionRecord, serieA.get('editions'), editionForeignKeys)
    const store2 = mergeRecords(store1, EditionRecord, serieB.get('editions'), editionForeignKeys)

    const editionsSpliced = serieB.get('editions').splice(1)

    expect(
      mergeRecords(store2, EditionRecord, editionsSpliced, editionForeignKeys, 'id', ['series_id', serieB.get('id')])
    ).toMatchSnapshot()
  })


  test('one author with 3 series and many editions', () => {
    const author = Immutable.fromJS(authorObaJSON)
    const seriesAuthor = author.get('tasks')
      .map((task) => task.get('series'))

    expect(
      initialState.withMutations((collection) => {
        seriesAuthor.forEach(
          (serie) => {
            mergeRecords(collection, EditionRecord, serie.get('editions'), editionForeignKeys, 'id', ['series_id', serie.get('id')])
          }
        )
      })
    ).toMatchSnapshot()
  })

  test('one serie then author of the serie but an edition is missing', () => {
    const serie = Immutable.fromJS(serieDeathNoteJSON)
    const author = Immutable.fromJS(authorObaJSON)

    const store = mergeRecords(initialState, EditionRecord, serie.get('editions'), editionForeignKeys)

    const seriesAuthor = author.get('tasks')
      .map((task) => task.get('series'))
      .removeIn([2, 'editions']) // remove death note editions, so it supposed to be deleted from store

    expect(
      store.withMutations((collection) => {
        seriesAuthor.forEach(
          (serie) => {
            mergeRecords(collection, EditionRecord, serie.get('editions'), editionForeignKeys, 'id', ['series_id', serie.get('id')])
          }
        )
      })
    ).toMatchSnapshot()
  })


})

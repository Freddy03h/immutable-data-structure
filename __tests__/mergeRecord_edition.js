import Immutable from 'immutable'
import { mergeRecords, updateRecord } from '../src/index'

import serieDeathNoteJSON from '../__fixtures__/serie_death_note.json'
import serieFullmetalAlchemistJSON from '../__fixtures__/serie_fullmetal_alchemist.json'
import { initialState, EditionRecord, editionForeignKeys } from '../__fixtures__/records'

describe('updateRecord edition', () => {

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


})

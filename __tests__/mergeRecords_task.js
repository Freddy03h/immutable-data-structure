import Immutable from 'immutable'
import { initialState, createMergeRecords } from '../src/index'

import authorObaJSON from '../__fixtures__/author_oba.json'
import seriePlatinumEndJSON from '../__fixtures__/serie_platinum_end.json'

import { TaskRecord, taskForeignKeys } from '../__fixtures__/records'

const mergeTasksRecords = createMergeRecords(TaskRecord, taskForeignKeys)

const author = Immutable.fromJS(authorObaJSON)
const serie = Immutable.fromJS(seriePlatinumEndJSON)

describe('mergeRecords tasks', () => {

  test('one author with empty store', () => {
    expect(
      mergeTasksRecords(initialState, author.get('tasks'), ['author_id', author.get('id')])
    ).toMatchSnapshot()
  })

  test('one author then serie with empty store', () => {
    const store = mergeTasksRecords(initialState, author.get('tasks'), ['author_id', author.get('id')])
    expect(
      mergeTasksRecords(store, serie.get('tasks'), ['series_id', serie.get('id')])
    ).toMatchSnapshot()
  })

  test('one author change task order', () => {
    const authorEdited = author.updateIn(['tasks'], (list) => list.sortBy((item) => item.get('id')))
    const store = mergeTasksRecords(initialState, authorEdited.get('tasks'), ['author_id', authorEdited.get('id')])

    expect(
      mergeTasksRecords(store, author.get('tasks'), ['author_id', author.get('id')])
    ).toMatchSnapshot()
  })

})

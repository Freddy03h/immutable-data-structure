// Polyfill

window.requestIdleCallback = window.requestIdleCallback ||
  function (cb) {
    return setTimeout(function () {
      var start = Date.now();
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, 1);
  }

window.cancelIdleCallback = window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  }

///////////////////////////////

import { createUpdateRecord } from './index'

function iterateWithRequestIdleCallback(it, sideEffect, callback){
  requestIdleCallback((deadline) => {
    let val = it.next()
    while(!val.done){
      sideEffect(val.value)
      if(deadline.timeRemaining() <= 1){
        iterateWithRequestIdleCallback(it, sideEffect, callback)
        return
      }
      val = it.next()
    }
    callback()
  })
}

export function asyncReplaceRecords(updateFunc, store, listData, primaryKey = 'id') {
  return new Promise((resolve, reject) => {
    let iteratorValues = listData.values()
    let collection = store
      .update('relations', (r) => r.clear())
      .update('data', (d) => d.clear())
      .asMutable()

    try {
      iterateWithRequestIdleCallback(
        iteratorValues,
        (item) => {
          const currentItemInState = store.getIn(['data', item.get(primaryKey)])
          const mergedItem = currentItemInState
            ? currentItemInState.merge(item)
            : item

          updateFunc(collection, mergedItem)
        },
        () => resolve(collection.asImmutable())
      )
    } catch (error) {
      reject(error)
    }

  })
}

export const createAsyncReplaceRecords = (Record, foreignKeys = [], primaryKey = 'id') => {
  const updateFunc = createUpdateRecord(Record, foreignKeys, primaryKey)
  return (store, listData) => {
    return asyncReplaceRecords(updateFunc, store, listData, primaryKey)
  }
}

export function asyncMergeRecords(updateFunc, store, listData, primaryKey = 'id') {
  return new Promise((resolve, reject) => {
    let iteratorValues = listData.values()
    let collection = store
      .asMutable()

    try {
      iterateWithRequestIdleCallback(
        iteratorValues,
        (item) => {
          updateFunc(collection, item)
        },
        () => resolve(collection.asImmutable())
      )
    } catch (error) {
      reject(error)
    }

  })
}

export const createAsyncMergeRecords = (Record, foreignKeys = [], primaryKey = 'id') => {
  const updateFunc = createUpdateRecord(Record, foreignKeys, primaryKey)
  return (store, listData) => {
    return asyncMergeRecords(updateFunc, store, listData, primaryKey)
  }
}

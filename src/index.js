import Immutable from 'immutable'

const mapListToTuple = (list, key) => list.map((item) => [item.get(key), item])

export const listToMapWithKey = (list, key) => Immutable.Map(mapListToTuple(list, key))

//////////

export const getDataById = (store, moduleName, id) => {
  return store.getIn([moduleName, 'data', id])
}

export const getDatas = (store, moduleName) => {
  return store.getIn([moduleName, 'data'])
}

export const getForeignIds = (store, moduleName, foreignIdKey, id) => {
  return store.getIn([moduleName, 'relations', foreignIdKey, id])
}

export const getDataByForeignId = (store, moduleName, foreignIdKey, foreignId, key = 'id') => {
  const relatedItemIds = store.getIn([moduleName, 'relations', foreignIdKey, foreignId], Immutable.Map())
  const listRelatedItemIds = relatedItemIds.map((itemId) => store.getIn([moduleName, 'data', itemId])).toList()

  return listToMapWithKey(listRelatedItemIds, key)
}

export const getDataByForeignIds = (store, moduleName, foreignIdKey, foreignIds, key = 'id') => {
  const relatedItemIds = foreignIds
    ? foreignIds.reduce((accumulator, otherItemId) => {
        const itemIds = store.getIn([moduleName, 'relations', foreignIdKey, otherItemId])
        return itemIds ? accumulator.union(itemIds) : accumulator
      }, Immutable.Set())
    : Immutable.Set()

  const listRelatedItemIds = relatedItemIds
    ? relatedItemIds.map((itemId) => store.getIn([moduleName, 'data', itemId])).toList()
    : Immutable.List()

  return listToMapWithKey(listRelatedItemIds, key)
}

export const getDataByForeignIdThroughOtherForeignId = (store, moduleName, foreignIdKey, otherModuleName, otherForeignIdKey, otherForeignId, key = 'id') => {
  const otherForeignIds = store.getIn([otherModuleName, 'relations', otherForeignIdKey, otherForeignId])

  return getDataByForeignIds(store, moduleName, foreignIdKey, otherForeignIds, key)
}

//////////

export const updateRecord = (store, Record, newData, foreignKeys = [], primaryKey = 'id') => {
  const id = newData.get(primaryKey)
  const oldData = store.getIn(['data', id])

  return store.updateIn(['data', id], new Record(), (record) => record.merge(newData))
    .withMutations((collection) => {
      foreignKeys.forEach(
        (foreignKey) => {
          if(oldData) {
            collection.updateIn(['relations', foreignKey, oldData.get(foreignKey)], (item_ids) => item_ids && item_ids.remove(id))
          }
          if(newData.get(foreignKey)) {
            collection.updateIn(['relations', foreignKey, newData.get(foreignKey)], new Immutable.Set(), (item_ids) => item_ids.add(id))
          }
        }
      )
    })
}

export const createUpdateRecord = (Record, foreignKeys = [], primaryKey = 'id') => {
  return (store, newData) => {
    return updateRecord(store, Record, newData, foreignKeys, primaryKey)
  }
}

//////////

export const deleteRecord = (store, id, foreignKeys = []) => {
  const data = store.getIn(['data', id])

  if(!data) {
    return store
  }

  return store.deleteIn(['data', id])
    .withMutations((collection) => {
      foreignKeys.forEach(
        (foreignKey) => {
          collection.updateIn(['relations', foreignKey, data.get(foreignKey)], (item_ids) => item_ids && item_ids.remove(id))
        }
      )
    })
}

export const createDeleteRecord = (foreignKeys = []) => {
  return (store, id) => {
    return deleteRecord(store, id, foreignKeys)
  }
}

//////////

export const mergeRecords = (updateFunc, deleteFunc, store, listData, primaryKey = 'id', completeKeysPath = null) => {
  let keysToRemove = null
  if(completeKeysPath) {
    const completeKeys = store.getIn(['relations', ...completeKeysPath])
    if(completeKeys) {
      const actuelKeys = listData ? listData.map((mapItem) => mapItem.get(primaryKey)).toSet() : Immutable.Set()

      keysToRemove = completeKeys.subtract(actuelKeys)
    }
  }

  return store
    .withMutations((collection) => {
      if(listData) {
        listData.forEach(
          (mapItem) => {
            updateFunc(collection, mapItem)
          }
        )
      }

      if(keysToRemove) {
        keysToRemove.forEach(
          (id) => {
            deleteFunc(collection, id)
          }
        )
      }
    })
}

export const createMergeRecords = (Record, foreignKeys = [], primaryKey = 'id') => {
  const updateFunc = createUpdateRecord(Record, foreignKeys, primaryKey)
  const deleteFunc = createDeleteRecord(foreignKeys)
  return (store, listData, completeKeysPath = null) => {
    return mergeRecords(updateFunc, deleteFunc, store, listData, primaryKey, completeKeysPath)
  }
}

//////////

export const mergeCompleteListsRecords = (mergeFunc, store, listData, entitiesKey, foreignKey, keyDataPrimary = 'id') => {
  return store
    .withMutations((collection) => {
      listData.forEach(
        (mapItem) => {
          mergeFunc(collection, mapItem.get(entitiesKey), [foreignKey, mapItem.get(keyDataPrimary)])
        }
      )
    })
}

export const createMergeCompleteListsRecords = (mergeFunc, entitiesKey, foreignKey, keyDataPrimary = 'id') => {
  return (store, listData) => {
    return mergeCompleteListsRecords(mergeFunc, store, listData, entitiesKey, foreignKey, keyDataPrimary)
  }
}

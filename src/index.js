import Immutable from 'immutable'

const mapListToTuple = (list, key, record) => list.map((item) => [item.get(key), record ? new record(item) : item])

export const listToMapWithKey = (list, key) => Immutable.Map(mapListToTuple(list, key))
export const listToOrderedMapWithKey = (list, key) => Immutable.OrderedMap(mapListToTuple(list, key))

export const arrayToMapWithKey = (array, key) => listToMapWithKey(Immutable.fromJS(array), key)
export const arrayToOrderedMapWithKey = (array, key) => listToOrderedMapWithKey(Immutable.fromJS(array), key)

export const listToMapWithKeyAndRecord = (list, key, record) => Immutable.Map(mapListToTuple(list, key, record))
export const listToOrderedMapWithKeyAndRecord = (list, key, record) => Immutable.OrderedMap(mapListToTuple(list, key, record))

// predicate function for Immutable
export function keyIn(keys) {
  const keySet = Immutable.Set(keys)
  return (v, k) => keySet.has(k)
}

export const listGroupToMapByForeignKey = (list, foreign_id, key = 'id') => {
  return list.reduce((accumulator, item) => {
    if (!item.get(foreign_id)) {
      return accumulator
    }
    return accumulator.update(
      item.get(foreign_id),
      Immutable.Set(),
      (item_ids) => item_ids.add(item.get(key)),
    )
  }, Immutable.Map())
}

export const listGroupToMapByForeignKeys = (list, foreign_ids, key = 'id') => {
  return list.reduce((accumulator, item) => {
    return item.get(foreign_ids).reduce((acc, foreign_id) => {
      return acc.update(
        foreign_id,
        Immutable.Set(),
        (item_ids) => item_ids.add(item.get(key)),
      )
    }, accumulator)
  }, Immutable.Map())
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

//////

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

export const mergeRecords = (store, Record, listData, foreignKeys = [], primaryKey = 'id', completeKeysPath = null) => {
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
            updateRecord(collection, Record, mapItem, foreignKeys, primaryKey)
          }
        )
      }

      if(keysToRemove) {
        keysToRemove.forEach(
          (id) => {
            deleteRecord(collection, id, foreignKeys)
          }
        )
      }
    })
}

export const mergeCompleteListsRecords = (store, Record, listData, keyData, relationKey, keyDataPrimary, foreignKeys = [], primaryKey = 'id') => {
  return store
    .withMutations((collection) => {
      listData.forEach(
        (mapItem) => {
          mergeRecords(collection, Record, mapItem.get(keyData), foreignKeys, primaryKey, [relationKey, mapItem.get(keyDataPrimary)])
        }
      )
    })
}


import Immutable from 'immutable'

export * from './async'


export const initialState = Immutable.Map({
  data: Immutable.Map(),
  relations: Immutable.Map(),
})

//////////

const getDataByIdAndReturnTuple = (store, moduleName, key) => (itemId) => {
  const item = getDataById(store, moduleName, itemId)
  return item && [item.get(key), item]
}

//////////

export const getDataById = (store, moduleName, id) => {
  return store.getIn([moduleName, 'data', id])
}

export const getDataByIds = (store, moduleName, idsSet, key = 'id') => {
  const idsList = Immutable.List(idsSet)
  const tupleItemIds = idsList.map(getDataByIdAndReturnTuple(store, moduleName, key))
  return Immutable.Map(tupleItemIds)
}

export const getDatas = (store, moduleName) => {
  return store.getIn([moduleName, 'data'])
}

export const getForeignIds = (store, moduleName, foreignIdKey, id) => {
  return store.getIn([moduleName, 'relations', foreignIdKey, id], Immutable.OrderedSet())
}

export const getDataByForeignId = (store, moduleName, foreignIdKey, foreignId, key = 'id') => {
  return getDataByIds(store, moduleName, getForeignIds(store, moduleName, foreignIdKey, foreignId))
}

export const getIdsByTwoForeignId = (store, moduleName, foreignIdKey1, id1, foreignIdKey2, id2) => {
  const set1 = getForeignIds(store, moduleName, foreignIdKey1, id1)
  const set2 = getForeignIds(store, moduleName, foreignIdKey2, id2)

  return set1.intersect(set2)
}

export const getDataByTwoForeignId = (store, moduleName, foreignIdKey1, id1, foreignIdKey2, id2, key = 'id') => {
  return getDataByIds(store, moduleName, getIdsByTwoForeignId(store, moduleName, foreignIdKey1, id1, foreignIdKey2, id2))
}

export const getIdsByForeignIds = (store, moduleName, foreignIdKey, foreignIds) => {
  return foreignIds
    ? foreignIds.reduce((accumulator, otherItemId) => {
        const itemIds = getForeignIds(store, moduleName, foreignIdKey, otherItemId)
        return itemIds ? accumulator.union(itemIds) : accumulator
      }, Immutable.OrderedSet())
    : Immutable.OrderedSet()
}

export const getDataByForeignIds = (store, moduleName, foreignIdKey, foreignIds, key = 'id') => {
  return getDataByIds(store, moduleName, getIdsByForeignIds(store, moduleName, foreignIdKey, foreignIds))
}

export const getDataByForeignIdThroughOtherForeignId = (store, moduleName, foreignIdKey, otherModuleName, otherForeignIdKey, otherForeignId, key = 'id') => {
  const otherForeignIds = getForeignIds(store, otherModuleName, otherForeignIdKey, otherForeignId)

  return getDataByForeignIds(store, moduleName, foreignIdKey, otherForeignIds, key)
}

//////////

export const updateRecord = (store, Record, newData, foreignKeys = [], primaryKey = 'id') => {
  if(!Immutable.isImmutable(newData)) {
    return store
  }
  const id = newData.get(primaryKey)
  const oldData = store.getIn(['data', id])

  return store.updateIn(['data', id], (record) => record ? record.merge(newData) : new Record(newData))
    .withMutations((collection) => {
      foreignKeys.forEach(
        (foreignKey) => {
          if(oldData && oldData.get(foreignKey) !== newData.get(foreignKey)) {
            collection.updateIn(['relations', foreignKey, oldData.get(foreignKey)], (item_ids) => item_ids && item_ids.remove(id))
          }
          if(newData.get(foreignKey)) {
            collection.updateIn(['relations', foreignKey, newData.get(foreignKey)], new Immutable.OrderedSet(), (item_ids) => item_ids.add(id))
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

export const keepOnlyRecords = (store, idsSet) => {
  return store
    .updateIn(['data'], (data) =>
      data.filter((datum, id) => idsSet.has(id))
    )
    .updateIn(['relations'], (relations) =>
      relations.map((fkIds) =>
        fkIds
          .map((fk) => fk.intersect(idsSet))
          .filter((fk) => fk.size)
      )
    )
}

//////////

export const mergeRecords = (updateFunc, deleteFunc, store, listData, primaryKey = 'id', completeKeys = null) => {
  let keysToRemove = null

  if(completeKeys) {
    const actuelKeys = listData ? listData.map((mapItem) => mapItem.get(primaryKey)).toOrderedSet() : Immutable.OrderedSet()
    keysToRemove = completeKeys.subtract(actuelKeys)
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
    let completeKeys
    if (completeKeysPath) {
      completeKeys = store.getIn(['relations', ...completeKeysPath])
      store = store.updateIn(['relations', ...completeKeysPath], () => Immutable.OrderedSet())
    }

    return mergeRecords(updateFunc, deleteFunc, store, listData, primaryKey, completeKeys)
  }
}

//////////

// To use only if listData is the entire list AND want to keep order, otherwise use "mergeRecords"
export const replaceRecords = (Record, foreignKeys = [], store, listData, primaryKey = 'id') => {
  return store.withMutations((state) => {

    state.updateIn(['data'], (data) => {
      return data.clear().withMutations((collection) => {
        listData.forEach((item) => {
          const currentItemInState = data.get(item.get(primaryKey))

          collection.update(item.get(primaryKey), () => new Record(currentItemInState ? currentItemInState.merge(item) : item))
        })
      })
    })

    foreignKeys.forEach((fk) => {
      state.updateIn(['relations', fk], Immutable.Map(), (relation) => {
        return relation.clear().withMutations((collection) => {
          listData.forEach((item) => {
            collection.update(item.get(fk), new Immutable.OrderedSet(), (item_ids) => item_ids.add(item.get(primaryKey)))
          })
        })
      })
    })

  })
}

export const createReplaceRecords = (Record, foreignKeys = [], primaryKey = 'id') => {
  return (store, listData) => {
    return replaceRecords(Record, foreignKeys, store, listData, primaryKey)
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

///////////

export const stateFromStorage = (store, Record, moduleData, foreignKeys = [], primaryKey = 'id') => {
  const module = Immutable.fromJS(moduleData)

  return store
    .updateIn(['data'], (data) => {
      return data.merge(
        module.get('data').map((item) => [item.get(primaryKey), new Record(item)])
      )
    })
    .updateIn(['relations'], (relations) => {
      return relations.merge(
        module.get('relations').map((relation) =>{
          return relation.map((fk) => fk.toOrderedSet())
        })
      )
    })
}

export const createStateFromStorage = (Record, foreignKeys = [], primaryKey = 'id') => {
  return (store, moduleData) => {
    return stateFromStorage(store, Record, moduleData, foreignKeys, primaryKey)
  }
}

export const storageFromState = (store) => {
  return store.updateIn(['data'], (data) => data.toList()).toJS()
}

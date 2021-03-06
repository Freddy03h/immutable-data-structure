# Immutable-Data-Structure

**BETA VERSION**

Give me some feedback to improve the API and the Doc

---

Immutable-Data-Structure is a project to help you **normalize** and **merge** your application's data using **Immutable.JS** objects.

It is useful to help manage your **Redux** store, it is created for this purpose, but Redux isn't a dependency of this project so you basically can use it elsewhere.

It only provides functions :

* Writing functions to use inside your reducers (merge, update, delete, … )
* Reading functions to use inside your `mapStateToProps` (selectors)

## Structure of the store

Assuming your already know why it's important to normalize your data and to be resource oriented. Here is an example of a manga's `series` reducer store.

The **Immutable Record** look like :

```javascript
const SerieRecord = Immutable.Record({
  id: null,
  title: null,
  type_id: null,
})
```
And we also declare an array of all foreign keys for the Record :

```javascript
const serieForeignKeys = ['type_id']
```

The point of this project is to produce and maintain a structure like this :

```
Immutable.Map {
  data: Immutable.Map {
    d1a38f41: Object {
      "id": "d1a38f41",
      "title": "Naruto",
      "type_id": "106f524e",
    },
    f0db2df6: Object {
      "id": "f0db2df6",
      "title": "Naruto : Les Romans",
      "type_id": "bb3d92a9",
    },
    a02cf154: Object {
      "id": "a02cf154",
      "title": "One Piece",
      "type_id": "106f524e",
    },
    f59ab8de: Object {
      "id": "f59ab8de",
      "title": "Radiant",
      "type_id": "3c009f18",
    },
    96138837: Object {
      "id": "96138837",
      "title": "Dreamland",
      "type_id": "3c009f18",
    },
    b9652346: Object {
      "id": "b9652346",
      "title": "Fullmetal Alchemist",
      "type_id": "106f524e",
    },
    940629b6: Object {
      "id": "940629b6",
      "title": "Dragon Ball",
      "type_id": "106f524e",
    },
  },
  relations: Immutable.Map {
    type_id: Immutable.Map {
      106f524e: Immutable.OrderedSet [
        "a02cf154",
        "d1a38f41",
        "940629b6",
        "b9652346",
      ],
      3c009f18: Immutable.OrderedSet [
        "96138837",
        "f59ab8de",
      ],
      bb3d92a9: Immutable.OrderedSet [
        "f0db2df6",
      ],
    },
  },
}
```

### Data

`data` stores all the resources with a quick access by `id`

### Relations

`relations` store all the foreign keys relations like a relational database. It provides a fast access to resources based on a foreign key to avoid doing a `filter` directly on the `data` object that can be really huge and slow.

## Selectors

If you already know `Immutable.JS` you know how to access data :

```javascript
state.getIn(['series', 'data', 'd1a38f41'])
```

**But, it's not recommended !** We provide selectors to easily access data and can change the structure internally without breaking / migrating your code.

### getDataById

To get a Record knowing it's ID.

```javascript
import { getDataById } from `immutable-data-structure`

// ....

// inside mapStateToProps
const seriesID = 'd1a38f41'
const serie = getDataById(state, 'series', seriesID)
```

### getDataByIds

To get a **List** (Immutable.List) of Records by giving a **Set** (Immutable.Set) of IDs.

```javascript
const narutoSeriesIDs = Immutable.Set(['d1a38f41', 'f0db2df6'])

const narutoSeries = getDataByIds(state, 'series', narutoSeriesIDs)
```

### getForeignIds

To get the **OrderedSet** (Immutable.OrderedSet) of IDs by giving a ForeignKeys ID.

```javascript
const manfraTypeID = '3c009f18'

const manfraSeriesIDs = getForeignIds(state, 'series', 'type_id', manfraTypeID)
```

It's the equivalent of the **not recommended** Immutable.JS way :

```javascript
state.getIn(['series', 'relations', 'type_id', '3c009f18'])
```

### getDataByForeignId

In many cases, `getForeignIds` is enough to use in the `mapStateToProps` of a list component. It's recommended to `.map` IDs in the list and then `connect` each row by using `getDataById ` inside the `mapStateToProps` of the row, for performance reason.

But sometimes, you need to order / filter / … the list based on Records attributes. So we need to get all the data.

`getDataByForeignId` return a **List** (Immutable.List) of Records by giving a ForeignKeys ID.

```javascript
const manfraTypeID = '3c009f18'

const manfraSeries = getDataByForeignId(state, 'series', 'type_id', manfraTypeID)
```

You can think of this function like an easy version of something like this :

```javascript
const manfraTypeID = '3c009f18'

const manfraSeriesIDs = getForeignIds(state, 'series', 'type_id', manfraTypeID)

const manfraSeries = manfraSeriesIDs.map((serieID) => getDataById(state, 'series', serieID))
```

## Manage (CRUD actions)

Functions to use in yours reducers.

### updateRecord

Function to Create or Update one entity in the store. It automatically update `data` and `relations` to keep a consistent state.

For example inside a reducer :

```javascript
case FETCH_SERIE_SUCCESS: {
  const apiResponse = Immutable.fromJS(action.jsonResponse)

  const newStore = updateRecord(store, SerieRecord, apiResponse, serieForeignKeys)

  return newStore
}
```

### deleteRecord

Function to Delete one entity in the store.

```javascript
case DELETE_SERIE_SUCCESS: {
  const newStore = deleteRecord(store, action.seriesIDToDelete, serieForeignKeys)

  return newStore
}
```

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
    d1a38f41-2ac9-40cf-aa17-aeac9697e1c8: Object {
      "id": "d1a38f41-2ac9-40cf-aa17-aeac9697e1c8",
      "title": "Naruto",
      "type_id": "106f524e-7283-44b8-aa84-25e9a7fb1f7d",
    },
    f0db2df6-dc0c-48cd-b3c4-88dd350c9cb0: Object {
      "id": "f0db2df6-dc0c-48cd-b3c4-88dd350c9cb0",
      "title": "Naruto : Les Romans",
      "type_id": "bb3d92a9-020a-4d3f-adec-77bebe9980db",
    },
    a02cf154-af6c-4f08-9a7a-32f7bc229ac8: Object {
      "id": "a02cf154-af6c-4f08-9a7a-32f7bc229ac8",
      "title": "One Piece",
      "type_id": "106f524e-7283-44b8-aa84-25e9a7fb1f7d",
    },
    f59ab8de-2c3a-4bf2-a501-b844599646be: Object {
      "id": "f59ab8de-2c3a-4bf2-a501-b844599646be",
      "title": "Radiant",
      "type_id": "3c009f18-811d-4b07-8dde-8249e422ec9e",
    },
    96138837-ef12-4a8f-869a-ea745047b41f: Object {
      "id": "96138837-ef12-4a8f-869a-ea745047b41f",
      "title": "Dreamland",
      "type_id": "3c009f18-811d-4b07-8dde-8249e422ec9e",
    },
    b9652346-95db-45ef-982b-de9f9d3ac01f: Object {
      "id": "b9652346-95db-45ef-982b-de9f9d3ac01f",
      "title": "Fullmetal Alchemist",
      "type_id": "106f524e-7283-44b8-aa84-25e9a7fb1f7d",
    },
    940629b6-a0df-4bd2-970d-b75d19336793: Object {
      "id": "940629b6-a0df-4bd2-970d-b75d19336793",
      "title": "Dragon Ball",
      "type_id": "106f524e-7283-44b8-aa84-25e9a7fb1f7d",
    },
  },
  relations: Immutable.Map {
    type_id: Immutable.Map {
      106f524e-7283-44b8-aa84-25e9a7fb1f7d: Immutable.OrderedSet [
        "a02cf154-af6c-4f08-9a7a-32f7bc229ac8",
        "d1a38f41-2ac9-40cf-aa17-aeac9697e1c8",
        "940629b6-a0df-4bd2-970d-b75d19336793",
        "b9652346-95db-45ef-982b-de9f9d3ac01f",
      ],
      3c009f18-811d-4b07-8dde-8249e422ec9e: Immutable.OrderedSet [
        "96138837-ef12-4a8f-869a-ea745047b41f",
        "f59ab8de-2c3a-4bf2-a501-b844599646be",
      ],
      bb3d92a9-020a-4d3f-adec-77bebe9980db: Immutable.OrderedSet [
        "f0db2df6-dc0c-48cd-b3c4-88dd350c9cb0",
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
state.getIn(['series', 'data', 'd1a38f41-2ac9-40cf-aa17-aeac9697e1c8'])
```

**But, it's not recommended !** We provide selectors to easily access data and can change the structure internally without breaking / migrating your code.

### getDataById

To get a Record knowing it's ID.

```javascript
import { getDataById } from `immutable-data-structure`

// ....

// inside mapStateToProps
const seriesID = 'd1a38f41-2ac9-40cf-aa17-aeac9697e1c8'
const serie = getDataById(state, 'series', seriesID)
```

### getDataByIds

To get a **List** (Immutable.List) of Records by giving a **Set** (Immutable.Set) of IDs.

```javascript
const narutoSeriesIDs = Immutable.Set(['d1a38f41-2ac9-40cf-aa17-aeac9697e1c8', 'f0db2df6-dc0c-48cd-b3c4-88dd350c9cb0'])

const narutoSeries = getDataByIds(state, 'series', narutoSeriesIDs)
```

### getForeignIds

To get the **OrderedSet** (Immutable.OrderedSet) of IDs by giving a ForeignKeys ID.

```javascript
const manfraTypeID = '3c009f18-811d-4b07-8dde-8249e422ec9e'

const manfraSeriesIDs = getForeignIds(state, 'series', 'type_id', manfraTypeID)
```

It's the equivalent of the **not recommended** Immutable.JS way :

```javascript
state.getIn(['series', 'relations', 'type_id', '3c009f18-811d-4b07-8dde-8249e422ec9e'])
```

### getDataByForeignId

In many cases, `getForeignIds` is enough to use in the `mapStateToProps` of a list component. It's recommended to `.map` IDs in the list and then `connect` each row by using `getDataById ` inside the `mapStateToProps` of the row, for performance reason.

But sometimes, you need to order / filter / … the list based on Records attributes. So we need to get all the data.

`getDataByForeignId` return a **List** (Immutable.List) of Records by giving a ForeignKeys ID.

```javascript
const manfraTypeID = '3c009f18-811d-4b07-8dde-8249e422ec9e'

const manfraSeries = getDataByForeignId(state, 'series', 'type_id', manfraTypeID)
```

You can think of this function like an easy version of something like this :

```javascript
const manfraTypeID = '3c009f18-811d-4b07-8dde-8249e422ec9e'

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

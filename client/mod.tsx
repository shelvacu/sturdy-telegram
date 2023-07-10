import React from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import "../shared/types.ts";

import PouchDB from "npm:pouchdb-browser";
// import PouchDB from "https://deno.land/x/pouchdb_deno@2.1.3-PouchDB+7.3.0/modules/pouchdb/mod.ts";

ReactDOM.hydrate(
  <App initialState={globalThis.__INITIAL_STATE__} />,
  document.getElementById("root"),
);

const db = new PouchDB('my_awesome_db');

db.put({_id: 'test', foo: true}, {}, (err, result) => {console.log(err, result)});

delete globalThis.__INITIAL_STATE__;

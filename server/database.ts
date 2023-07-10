// import { DB } from "sqlite";
import type { Todo } from "../shared/types.ts";

// function createDb(name: string): DB {
//   console.log("dB");
//   const db = new DB(name);
//   console.log("dC");

//   db.query(`
//     CREATE TABLE IF NOT EXISTS todos (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       label TEXT NOT NULL,
//       complete BOOLEAN
//     )
//  `);
//  console.log("dD");

//   return db;
// }

// export function openDb(name = "data.db") {
//   console.log("dA");
//   const db = createDb(name);
//   console.log("dZ");
//   return {
//     close: () => {
//       db.close();
//     },

//     getTodos: (): Todo[] => {
//       const rows = db.query<[number, string, number]>(
//         "SELECT id, label, complete FROM todos",
//       );
//       return rows.map(([id, label, complete]) => ({
//         id,
//         label,
//         complete: Boolean(complete),
//       }));
//     },

//     addTodo: (todo: Omit<Todo, "id">): Todo => {
//       const rows = db.query<[number, string, number]>(
//         `INSERT INTO todos (label, complete)
//         VALUES (:label, :complete)
//         RETURNING id, label, complete`,
//         { label: todo.label, complete: todo.complete ?? false },
//       );
//       const item = rows[0];
//       return {
//         id: item[0],
//         label: item[1],
//         complete: Boolean(item[2]),
//       };
//     },

//     removeTodo: (id: number): void => {
//       db.query("DELETE FROM todos WHERE id = (:id)", { id });
//     },

//     updateTodo: (todo: Todo): Todo => {
//       const rows = db.query<[number, string, number]>(
//         `UPDATE todos
//         SET (label, complete) = (:label, :complete)
//         WHERE id = (:id)
//         RETURNING id, label, complete`,
//         { id: todo.id, label: todo.label, complete: todo.complete },
//       );
//       const item = rows[0];
//       return {
//         id: item[0],
//         label: item[1],
//         complete: Boolean(item[2]),
//       };
//     },
//   };
// }
export function openDb(_name = "whatever") {
  return {
    close: () => {},
    getTodos: (): Todo[] => { return [] },
    addTodo: (_todo: Omit<Todo, "id">): Todo => {
      return {
        id: 1,
        label: "foo",
        complete: false
      }
    },
    removeTodo: (_id: number): void => {},
    updateTodo: (todo: Todo): Todo => { return todo; },
  }
}

export type Database = ReturnType<typeof openDb>;

import express, { Request, Response } from "express";
import ShortUniqueId from "short-unique-id";
import { BaseTodoItem, TodoItem, TodoItems } from "../models/todoItems";
import {totalmem} from "os";

export const todoItemRouter = express.Router();

let todoItems: TodoItems = {};


/*
    Why I chose not to refactor everything:

    In a real world scenario this first section of the code would be replaced with a database of some
    sort.  For the most part refactoring this code would be pointless as it fulfils its purpose and is simple and
    comprehensible.

    I will refactor a couple of functions to demonstrate my preference, but it is just that.  My Preference.
    I am perfectly happy with the readability and maintainability of this code insofar as the current use case
    extends.

*/

const findAll = async (): Promise<TodoItem[]> => Object.values(todoItems);
const find = async (id: string): Promise<TodoItem> => todoItems[id];

async function todoItemDescriptionExists( description: string): Promise<boolean>{
  return Object.values(todoItems).some(
      (todoItem) => todoItem.description === description
  );
}

async function create(newTodoItem: BaseTodoItem): Promise<TodoItem> {

  const uid = new ShortUniqueId({ length: 10 });
  const id: string = uid();

  todoItems[id] = {
    id,
    ...newTodoItem,/*  This is a potential problem - in this scenario ( and update) - as a provided "id" in newTodoItem
    will overwrite the auto generated one.  Of course this is probably a deliberate error and one that is unlikely
    to occur in a real world db interface.

    The guard for this has been placed in the POST and PUT routers.

    */
  };

  return todoItems[id];
}
// Refactored above
//
// const todoItemDescriptionExists = async (
//   description: string
// ): Promise<boolean> => {
//   return Object.values(todoItems).some(
//     (todoItem) => todoItem.description === description
//   );
// };

// const create = async (newTodoItem: BaseTodoItem): Promise<TodoItem> => {
//   const uid = new ShortUniqueId({ length: 10 });
//   const id: string = uid();
//   todoItems[id] = {
//     id,
//     ...newTodoItem,
//   };
//
//   return todoItems[id];
// };
const update = async (
  id: string,
  todoItemUpdate: BaseTodoItem
): Promise<TodoItem | null> => {
  const existingTodoItem = await find(id);

  if (!existingTodoItem) {
    return null;
  }

  todoItems[id] = { id, ...todoItemUpdate };/* Beware !!!! */

  return todoItems[id];
};
const remove = async (id: string): Promise<null | void> => {
  const existingTodoItem = await find(id);

  if (!existingTodoItem) {
    return null;
  }

  delete todoItems[id];
};



/*

  The routing is simple and to the point.  I have added a catch for the id param in the request body sent to the
  post and put routes,  Otherwise for the scope of this test i would not really change anything as it is just
  pushing code around for the sake of it

*/

// GET todoItems
todoItemRouter.get("/", async (req: Request, res: Response) => {
  try {
    const items: TodoItem[] = await findAll();

    return res.status(200).send(items);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// GET todoItem/:id
todoItemRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const item: TodoItem = await find(req.params.id);

    if (item) {
      return res.status(200).send(item);
    }

    return res.status(404).send("TodoItem not found");
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// POST todoItem
todoItemRouter.post("/", async (req: Request, res: Response) => {
  try {

    const todoItem: BaseTodoItem = req.body;
    console.log({ todoItem, req, body: req.body });

    if ( todoItem.hasOwnProperty("id") ){
      return res.status(400).send("The id parameter in the request body is invalid when creating an item");
    }

    // The above guard would not be required if access to the backend application were to come only from
    // the front end angular app.  So depending on the deployment scenario is the above needed?
    // I would probably say yes as it documents a fact that otherwise maybe opaque to casual observation.
    // NOTE: I could also have checked req.body.id but in my opinion it is more self documenting by not referencing
    // req.body


    const description = todoItem?.description;
    if (!description) {
      return res.status(400).send("Description is required");
    }

    const hasDuplicateDescription = await todoItemDescriptionExists(
      description
    );

    if (hasDuplicateDescription) {
      return res.status(400).send("Description already exists");
    }
    await create(todoItem);
    return res.status(201).json({});// choosing not to send data back as the front end is not that smart
  } catch (e) {console.log(e)
    return res.status(500).send(e.message);
  }
});

// PUT todoItems/:id
todoItemRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const todoItem: BaseTodoItem = req.body;

    if ( todoItem.hasOwnProperty("id") ){
      return res.status(400).send("The id parameter in the request body is invalid when updating an item");
    }

    // Same comment as the POST route but additionally you could compare the param id and the body id for sameness
    // but since its not useful to have the id in the body I use the same test as the POST route.  Of course you
    // could also silently delete the id from the request body as there is questionable value in informing the caller
    // as they are likely not using the FE app and are currently out of scope.

    const existingTodoItem: TodoItem = await find(id);
    if (existingTodoItem) {
      await update(id, todoItem);
      return res.status(200).json({});// choosing not to send data back as the front end is not that smart
    }

    return res.status(404).send("TodoItem not found");
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// DELETE todoItems/:id
todoItemRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await remove(id);

    return res.sendStatus(204);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

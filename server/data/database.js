const { insertRace, deleteRace, updateRace, getRace, getRaces } = require('./redis');
const events = require('../events');
class Todo {}
class User {}

// Mock authenticated ID
const VIEWER_ID = 'me';

// Mock user data
const viewer = new User();
viewer.id = VIEWER_ID;

async function addTodo(text, complete) {
  const id = await insertRace({
    text,
    complete,
  });
  return id;
}

async function renameTodo(id, text) {
  const race = getRace(id);
  race.text = text;
  updateRace(id, race);
  events.emit('amqp.changes', { id });
}

function changeTodoStatus(id, isCompleted) {
  const race = getRace(id);
  race.completed = isCompleted;
  updateRace(id, race);
  events.emit('amqp.changes', { id });
}

async function getTodo(id) {
  const race = await getRace(id);
  return race;
}

async function getTodos(status = 'any') {
  const races= await getRaces(status);
  return races;
}

function getViewer() {
  return viewer;
}

async function markAllTodos(completed) {
  const races = await getRaces();
  const changedIds = [];
  races.forEach(race => {
    if (race.completed !== completed.toString()) {
      race.complete = completed;
      updateRace(race.id, race);
      changedIds.push(race.id);
    }
  });
  return changedIds;
}

function removeTodo(id) {
  deleteRace(id);
}

async function removeCompletedTodos() {
  const races = getRaces('completed');
  const deletedIds = [];
  races.forEach(race => {
    deleteRace(race.id);
    deletedIds.push(race.id);
  });
  return races;
}



module.exports = {
  Todo,
  User,
  addTodo,
  changeTodoStatus,
  getTodo,
  getTodos,
  getViewer,
  markAllTodos,
  removeTodo,
  removeCompletedTodos,
  renameTodo,
};

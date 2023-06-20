const newTodo = document.getElementById("task-input");
const timeInput = document.getElementById("time-input");
const list = document.getElementById("tasks");
const completed = document.getElementById("completed-count");

let todoArray = [];

if (localStorage.getItem("todoArray")) {
  todoArray = JSON.parse(localStorage.getItem("todoArray"));
  render();
  updateCompletedCount();
} else {
  fetch("/todoArray")
    .then((resp) => resp.json())
    .then((resp) => {
      todoArray = resp;
      render();
      updateCompletedCount();
    })
    .catch((error) => {
      console.error(error);
    });
}

function sendTodos() {
  fetch("/todoArray", {
    method: "post",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ todoArray: todoArray }),
  });
}

function onDelete(index) {
  todoArray.splice(index, 1);
  sendTodos();
  updateCompletedCount();
  render();
}

function render() {
  list.innerHTML = "";

  for (let index = 0; index < todoArray.length; index++) {
    const todo = todoArray[index];

    const todoDiv = document.createElement("div");
    todoDiv.className = "task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", function () {
      todo.completed = !todo.completed;
      sendTodos();
      updateCompletedCount();
      render();
    });

    const contentDiv = document.createElement("div");
    contentDiv.className = "content";

    const textDiv = document.createElement("div");
    textDiv.className = "text";
    textDiv.textContent = todo.text;
    if (todo.completed) {
      textDiv.classList.add("strike");
    }

    const deadlineDiv = document.createElement("div");
    deadlineDiv.className = `deadline ${todo.isRed ? "red" : ""}`;
    deadlineDiv.textContent = todo.deadline;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.textContent = "delete";
    deleteBtn.addEventListener("click", function () {
      onDelete(index);
    });

    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(deadlineDiv);

    todoDiv.appendChild(checkbox);
    todoDiv.appendChild(contentDiv);
    todoDiv.appendChild(deleteBtn);

    list.appendChild(todoDiv);
  }
}

function updateCompletedCount() {
  const completedCount = todoArray.filter((todo) => todo.completed).length;
  const notCompletedCount = todoArray.length - completedCount;
  completed.textContent = `Completed: ${completedCount}`;
  document.getElementById("not-completed-count").textContent = `Not completed: ${notCompletedCount}`;
}

document.getElementById("task-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const todoText = newTodo.value.trim();
  const todoDeadline = timeInput.value;

  if (todoText !== "") {
    const todoObj = {
      text: todoText,
      deadline: todoDeadline,
      completed: false,
      isRed: false,
    };

    todoArray.push(todoObj);
    sendTodos();
    updateCompletedCount();
    render();

    newTodo.value = "";
    timeInput.value = "";
  }
});
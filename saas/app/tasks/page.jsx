const { h, useState } = window.Lungo;

export const metadata = { title: "Tasks", description: "Manage your tasks." };
export const loader = { url: "/api/tasks" };

function StatusBadge({ status }) {
  const colors = {
    todo: "bg-gray-100 text-gray-600",
    doing: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  };
  return (
    <span class={"px-2.5 py-0.5 rounded-full text-xs font-medium " + (colors[status] || colors.todo)}>
      {status}
    </span>
  );
}

function TaskRow({ task }) {
  const [confirming, setConfirming] = useState(false);

  const nextStatus = { todo: "doing", doing: "done", done: "todo" };

  return (
    <div class="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div class="flex-1">
        <div class={"text-sm font-medium " + (task.status === "done" ? "text-gray-400 line-through" : "text-gray-900")}>
          {task.title}
        </div>
        <div class="text-xs text-gray-400 mt-0.5">{task.createdAt}</div>
      </div>

      <form method="POST" action="/action/update-task" class="flex items-center">
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="status" value={nextStatus[task.status]} />
        <button type="submit" class="cursor-pointer border-0 bg-transparent p-0">
          <StatusBadge status={task.status} />
        </button>
      </form>

      {confirming ? (
        <div class="flex items-center gap-2">
          <form method="POST" action="/action/delete-task">
            <input type="hidden" name="id" value={task.id} />
            <button type="submit" class="px-2.5 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
              Delete
            </button>
          </form>
          <button onclick={() => setConfirming(false)} class="px-2.5 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onclick={() => setConfirming(true)}
          class="text-gray-300 hover:text-red-500 transition-colors text-sm"
        >✕</button>
      )}
    </div>
  );
}

export default function TasksPage({ data }) {
  const tasks = Array.isArray(data) ? data : [];
  const todo = tasks.filter(t => t.status === "todo");
  const doing = tasks.filter(t => t.status === "doing");
  const done = tasks.filter(t => t.status === "done");

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Tasks</h1>
        <div class="flex items-center gap-3 text-sm text-gray-500">
          <span>{todo.length} todo</span>
          <span>·</span>
          <span>{doing.length} in progress</span>
          <span>·</span>
          <span>{done.length} done</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 mb-6">
        <form method="POST" action="/action/add-task" class="flex gap-3 p-4 border-b border-gray-200">
          <input
            name="title"
            type="text"
            placeholder="Add a new task..."
            required="true"
            class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button type="submit" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Add
          </button>
        </form>

        {tasks.length === 0 && (
          <div class="px-5 py-12 text-center text-gray-400 text-sm">
            No tasks yet. Add one above.
          </div>
        )}

        {tasks.map(task => (
          <TaskRow task={task} />
        ))}
      </div>

      <p class="text-xs text-gray-400 text-center">
        Data stored in tasks.json — add/delete tasks and the page re-renders with fresh SSR data.
        Click a status badge to cycle: todo → doing → done → todo.
      </p>
    </div>
  );
}

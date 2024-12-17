import React, { useState, useEffect, useCallback } from 'react';

// Import components
import { Button } from '../../components/ui/button.tsx';
import { ConfirmDialog } from '../../components/ui/confirm-dialog.tsx';
import { columns } from '../../components/table/ui/columns.tsx';
import { DataTable } from '../../components/table/ui/data-table.tsx';
import { TasksImportDialog } from '../../components/table/ui/tasks-import-dialog.tsx';
import { TasksMutateDrawer } from '../../components/table/ui/tasks-mutate-drawer.tsx';
import { Task } from '../../components/table/data/schema.ts';

// Import hooks
import { useTasksContext } from 'src/components/table/context/task-context.tsx';
import { useTaskContext } from '@/contexts/UserTaskContext.tsx';
import axios from 'axios';

// Import ShadCN Toast components
import {
  ToastProvider,
  Toast,
  ToastViewport,
  ToastAction,
} from 'src/components/ui/toast.tsx';

import { Download, Plus } from 'lucide-react';

const MemoizedTasksMutateDrawer = React.memo(TasksMutateDrawer);
const MemoizedTasksImportDialog = React.memo(TasksImportDialog);
const MemoizedConfirmDialog = React.memo(ConfirmDialog);

const Tasks = () => {
  const { tasks, setTasks, fetchTasks } = useTaskContext();
  const { open, currentRow, setCurrentRow, setOpen, handleOpen } =
    useTasksContext();
  const [pendingDeletes, setPendingDeletes] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());
  const [toastQueue, setToastQueue] = useState<{ id: string; task: Task }[]>(
    [],
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle row click to update the current row in TasksContext
  const handleRowClick = (task: Task) => {
    setCurrentRow(task);
    handleOpen('update');
  };

  // Handle task creation and update using useTaskContext
  const handleTaskMutate = useCallback(
    (task: Task, isUpdate: boolean) => {
      setTasks((prevTasks) => {
        if (isUpdate) {
          // Update an existing task
          return prevTasks.map((t) => (t.id === task.id ? task : t));
        } else {
          // Add a new task
          return [...prevTasks, task];
        }
      });
    },
    [setTasks],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!currentRow) return;

    const taskId = currentRow.id;
    const taskToDelete = currentRow;

    // Temporarily remove the task from the list
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));

    // Create a timeout for permanent deletion
    const timeoutId = setTimeout(async () => {
      try {
        await axios.delete(`http://localhost:3000/tasks/${taskId}`);
        setToastQueue((prevQueue) =>
          prevQueue.filter((item) => item.id !== taskId),
        );
      } catch (error) {
        console.error('Error deleting task:', error);
        setTasks((prevTasks) => [...prevTasks, taskToDelete]);
      }
      setPendingDeletes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
    }, 10000); // 10 seconds timeout

    setPendingDeletes((prev) => {
      const newMap = new Map(prev);
      newMap.set(taskId, timeoutId);
      return newMap;
    });

    setToastQueue((prevQueue) => [
      ...prevQueue,
      { id: taskId, task: taskToDelete },
    ]);
    setCurrentRow(null);
    setOpen(null);
  }, [currentRow, setTasks, setOpen, setPendingDeletes]);

  const undoDelete = useCallback((task: Task) => {
    setPendingDeletes((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(task.id)) {
        clearTimeout(newMap.get(task.id));
        newMap.delete(task.id);
      }
      return newMap;
    });
    setTasks((prevTasks) => [...prevTasks, task]);
    setToastQueue((prevQueue) =>
      prevQueue.filter((item) => item.id !== task.id),
    );
  }, []);

  return (
    <ToastProvider>
      <ToastViewport />
      <div className="flex space-x-2 bg-indigo-50 p-2 w-full h-full overflow-x-hidden">
        <div className="flex flex-col bg-white border rounded-md w-full h-full">
          {/* ===== Top Heading ===== */}
          <div className="flex flex-wrap justify-between items-center gap-x-4 p-2">
            <button className="px-2 font-semibold text-indigo-500 text-lg">
              TaskList
              <span className="ml-2 font-normal text-gray-500">|</span>
              <span className="ml-2 font-normal text-[12px] text-gray-500">
                This section manages your daily activity calendar.
              </span>
            </button>

            <Button onClick={() => handleOpen('create')}>
              Create <Plus size={18} />
            </Button>
          </div>

          <hr className="my-1 w-full" />

          {/* ===== Data Table ===== */}
          <DataTable data={tasks} columns={columns} />

          <MemoizedTasksMutateDrawer />

          {/* ===== Toasts for Undo ===== */}
          {toastQueue.map(({ id, task }) => (
            <Toast key={id} variant="default">
              <div className="flex justify-between">
                <p>{task.title} deleted.</p>
                <ToastAction
                  altText="Undo Deletion"
                  onClick={() => undoDelete(task)}
                >
                  Undo
                </ToastAction>
              </div>
            </Toast>
          ))}

          {/* ===== Update Drawer & Delete Dialog ===== */}
          {currentRow && (
            <>
              <MemoizedConfirmDialog
                destructive
                open={open === 'delete'}
                onOpenChange={() => setOpen(null)}
                handleConfirm={handleConfirmDelete}
                title={`Delete this task: ${currentRow?.id}?`}
                desc={
                  <p>
                    You are about to delete task{' '}
                    <strong>{currentRow?.title}</strong>.
                  </p>
                }
                confirmText="Delete"
              />
            </>
          )}
        </div>
      </div>
    </ToastProvider>
  );
};

export default Tasks;

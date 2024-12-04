import { useEffect, useState } from 'react';
import { AddTaskForm } from "../components/AddTaskForm";
import { fetchTasks } from '../services/superbaseService';
import { ITask } from '../models/ITask';
import { useParams } from 'react-router-dom';

interface TasksProps {
  tasks: ITask[];
}

export const Tasks = ({ tasks: initialTasks } : TasksProps) => {
    const { householdId } = useParams<{householdId:string}>();
    const [tasks, setTasks] = useState<ITask[]>(initialTasks);

useEffect(() => {
  const fetchAndSetTasks = async () => {
    const fetchedTasks = await fetchTasks();
    setTasks(fetchedTasks);
  };

  fetchAndSetTasks();
}, [householdId]);

  return (
    <div>
      <h2>Tasks for Household {householdId}</h2>
      <AddTaskForm householdId={householdId} />
      <ul>
        {tasks.map(task => (
          <li key={task.task_id}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
};
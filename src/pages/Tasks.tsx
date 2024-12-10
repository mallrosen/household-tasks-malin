import { useEffect, useState } from 'react';
import { AddTaskForm } from "../components/AddTaskForm";
import { fetchTasks } from '../services/superbaseService';
import { ITask } from '../models/ITask';
import { useParams } from 'react-router-dom';

interface TasksProps {
  tasks: ITask[];
}

export const Tasks = ({ tasks: initialTasks }: TasksProps) => {
  const { householdId } = useParams<{ householdId: string }>();
  console.log('Household ID from useParams:', householdId);

  const [tasks, setTasks] = useState<ITask[]>(initialTasks);

  useEffect(() => {
    const fetchAndSetTasks = async () => {
      if (householdId) {
        const fetchedTasks = await fetchTasks(householdId);
        const filteredTasks = fetchedTasks ? fetchedTasks.filter(task => task.member_id && task.member.household_id === householdId) : [];
        setTasks(filteredTasks);
      }
    };

    fetchAndSetTasks();
  }, [householdId]);

  return (
    <div>
      <h2>Tasks for Household {householdId}</h2>
      <AddTaskForm householdId={householdId} />
      <ul>
        {tasks.map(task => (
          <li key={task.task_id}>
            {task.name} (Difficulty: {task.difficulty}, Points: {task.points})
          </li>
        ))}
      </ul>
    </div>
  );
};

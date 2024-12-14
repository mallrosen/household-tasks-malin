import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ITask } from '../models/ITask';

interface TaskListProps {
  tasks: ITask[];
  onToggle: (taskId: string) => void;
  onRemove: (taskId: string) => void;
}

export const TaskList = ({ tasks, onToggle, onRemove }:TaskListProps) => {
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.task_id}>
          <span style={{ textDecoration: task.status ? 'line-through' : 'none' }}>
            {task.name} (Difficulty: {task.difficulty}, Points: {task.points})
          </span>
          {!task.status && (
            <button onClick={() => onToggle(task.task_id)}>Complete</button>
          )}
          <button onClick={() => onRemove(task.task_id)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </li>
      ))}
    </ul>
  );
};

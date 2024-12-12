import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface TaskListProps {
  tasks: any[];
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
            <button onClick={() => onRemove(task.task_id)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </span>
          {!task.status && (
            <button onClick={() => onToggle(task.task_id)}>Complete</button>
          )}
        </li>
      ))}
    </ul>
  );
};

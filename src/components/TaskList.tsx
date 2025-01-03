import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ITask } from '../models/ITask';
import "../styles/main.scss";


interface TaskListProps {
  tasks: ITask[];
  onToggle: (taskId: string, points: number) => Promise<void>;
  onRemove: (taskId: string, points: number) => Promise<void>;

}

export const TaskList = ({ tasks, onToggle, onRemove }:TaskListProps) => {
  return (
    <><h2 className='rubrik'>Tasks</h2>
    <div className="tasks-container">
      {tasks.map(task => (
        <div key={task.task_id} className="task-item">
          <span style={{ textDecoration: task.status ? 'line-through' : 'none' }}>
            {task.name} (Points: {task.points})
          </span>
          {!task.status && (
            <button className='completeBtn' onClick={() => onToggle(task.task_id, task.points)}>Complete</button>
          )}
          <button className='removeBtn' onClick={() => onRemove(task.task_id, task.points)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      
      ))}

    </div>
    </>
  );
};

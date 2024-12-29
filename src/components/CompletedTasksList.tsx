import { ITask } from "../models/ITask";

interface CompletedTasksProps {
    tasks: ITask[];
    onClose: () => void;
    username: string;
  }
  
  export const CompletedTasksList = ({ tasks, onClose }: CompletedTasksProps) => (
    <div className="completed-tasks-modal">
      <div className="modal-content">
        <h5>Completed Tasks</h5>
        {tasks.length > 0 ? (
          <ul className="completed-tasks-list">
            {tasks.map(task => (
              <li key={task.task_id} className="completed-task-item">
  
                <h5 className="task-name">{task.name}  -  {task.points} points</h5>
                </li>
            ))}
          </ul>
        ) : (
          <p>No completed tasks yet</p>
        )}
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
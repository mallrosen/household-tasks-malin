import { ITask } from "../models/ITask";

interface CompletedTasksProps {
    tasks: ITask[];
    onClose: () => void;
    username: string;
  }
  
  export const CompletedTasksList = ({ tasks, onClose, username }:CompletedTasksProps) => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Completed Tasks - {username}</h3>
          {tasks.length > 0 ? (
            <ul className="completed-tasks-list">
              {tasks.map(task => (
                <li key={task.task_id} className="completed-task-item">
                  <div className="task-name">
                    {task.name} <span>{task.points} points</span>
                  </div>
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
  };
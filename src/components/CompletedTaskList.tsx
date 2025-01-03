import { ITask } from "../models/ITask";

interface CompletedTasksProps {
  tasks: ITask[];
  onClose: () => void;
}

export const CompletedTasksList = ({
  tasks,
  onClose,
}: CompletedTasksProps) => {

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Completed Tasks</h3>
        {tasks.length > 0 ? (
          <ul className="completed-tasks-list">
            {tasks.map(task => (
              <li key={`${task.task_id}-${task.member_id}`} className="completed-task-item">
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
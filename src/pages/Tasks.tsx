import { useEffect } from 'react';
import { useUserAndTasks } from '../hooks/useUserAndTasks';
import { useTaskHandlers } from '../hooks/useTaskHandlers'; // Ny hook för hantering av uppgifter
import { AddTaskForm } from '../components/AddTaskForm';
import { fetchTasks } from '../services/superbaseService';
import { supabase } from '../services/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import '../styles/Tasks.scss'

export const Tasks = () => {
  const {
    memberId,
    taskList,
    setTaskList,
    userPoints,
    setUserPoints,
    error,
    setError,
  } = useUserAndTasks();

  const { toggleTaskCompletion, removeTask } = useTaskHandlers(
    memberId,
    taskList,
    setTaskList,
    userPoints,
    setUserPoints,
    setError,
    error,
  );

  useEffect(() => {
    const fetchTasksForMember = async () => {
      if (!memberId) return;

      const tasks = await fetchTasks(memberId);
      if (tasks) {
        setTaskList(tasks);
      } else {
        setError('Error fetching tasks');
      }
    };

    fetchTasksForMember();
  }, [memberId, setTaskList, setError]);

  const handleSubmit = async (task: { name: string; difficulty: number; points: number }) => {
    if (!memberId) {
      setError('Member ID is missing!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Tasks')
        .insert({
          name: task.name,
          difficulty: task.difficulty,
          points: task.points,
          status: false,
          member_id: memberId,
        })
        .select();

      if (error) {
        setError('Error adding task: ' + error.message);
      } else {
        console.log('Task added successfully:', data);
        if (data) {
          setTaskList((prevTaskList) => [...prevTaskList, data[0]]);
        }
      }
    } catch (error) {
      setError('Error adding task: ' + (error as Error).message);
    }
  };

  if (!memberId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className='rubrik'>Tasks</h2>
      <div className="tasks-container">
        {taskList.map((task) => (
          <div key={task.task_id} className="task-item">
            <span style={{ textDecoration: task.status ? 'line-through' : 'none' }}>
              {task.name} (Difficulty: {task.difficulty}, Points: {task.points})
            </span>
            {!task.status && (
              <button onClick={() => toggleTaskCompletion(task.task_id)}>Complete</button>
            )}
            <button onClick={() => removeTask(task.task_id)}>
              <FontAwesomeIcon icon={faTrash} className="delete-icon" />
            </button>
          </div>
        ))}
      </div>
      <div className='addTaskForm'>
      <AddTaskForm  handleSubmit={handleSubmit} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
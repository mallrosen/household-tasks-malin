import { FormEvent, useState } from 'react';
import "../styles/main.scss";

interface CreateHouseholdFormProps {
  onCreate: (householdName: string) => void;
}

export const CreateHouseholdForm = ({ onCreate }: CreateHouseholdFormProps) => {
  const [householdName, setHouseholdName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    if (!householdName) {
      setError('Please provide a valid household name');
      return;
    }

    setError('');
    onCreate(householdName);
    setHouseholdName('');
  };


  return (
    <div>
      <h3>Create a New Household</h3>
      <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Household Name"
        value={householdName} 
          onChange={(e) => setHouseholdName(e.target.value)}
          required
        />
        <button type="submit">Create Household</button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
    </div>
  );
};

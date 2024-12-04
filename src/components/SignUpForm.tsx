
import { supabase } from '../supabaseClient';

export const SignUpForm = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;
    const password = (e.target as HTMLFormElement).password.value;
    const username = (e.target as HTMLFormElement).username.value; 

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error('Error creating user:', signUpError.message);
        return;
      }


      if (data?.user) {
        const { user } = data; 

        const { data: insertData, error: insertError } = await supabase
          .from('Users')
          .insert([
            {
              email: user.email,
              user_id: user.id, 
              username: username,  
            }
          ]);

        if (insertError) {
          console.error('Error inserting user data into table:', insertError.message);
        } else {
          console.log('User data inserted into table:', insertData);
        }
      }
    } catch (error) {
      console.error('Error during sign-up process:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username: 
        <input type="text" name="username" required />
      </label>
      <label>
        Email:
        <input type="email" name="email" required />
      </label>
      <label>
        Password:
        <input type="password" name="password" required />
      </label>
      <button type="submit">Register</button>
    </form>
  );
};

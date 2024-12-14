// import { useState } from 'react';
// import { LogInForm } from './LogInForm';
// import { SignUpForm } from './SignUpForm';


// export const LoginSignUp = () => {
//   const [isLogin, setIsLogin] = useState(true);    
//   return (
//     <div>
//       <h1>{isLogin ? 'Log in' : 'Sign up'}</h1>
//       {isLogin ? (
//         <LogInForm /> 
//       ) : (
//         <SignUpForm /> 
//       )}

//       <p>
//         {isLogin
//           ? "Don't have an account yet?"
//           : 'Already have an account?'}
//         <button onClick={() => setIsLogin(!isLogin)}>
//           {isLogin ? 'Sign up here' : 'Log in here'}
//         </button>
//       </p>
//     </div>
//   );
// };
import './App.css';
import { Overview } from "./pages/Overview";
import { Tasks } from './pages/Tasks';
import { SignUpForm } from "./components/SignUpForm";



function App() {
  return (
    <>
    <SignUpForm/>
    <Tasks tasks={[]} />
    <Overview setHouseholdId={function (id: string): void {
      console.log(id);
      ;
    } } />
    </>
  );  
}
export default App;
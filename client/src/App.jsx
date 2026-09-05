// DESCRIPTION: controlss app structure and logic

import './App.css'

import Layout from './components/Layout';
import TodoList from './components/TodoList';

function App() {
  return(
    <Layout>
      <TodoList/>
    </Layout>
  )
}

export default App

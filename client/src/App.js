import { useState, useEffect, useCallback } from 'react';

import './App.css';

function TestChild()
{
  useEffect(function(){
    console.log('Child component rerendered');
  });

  return (
    <p>I am child.</p>
  )
}

function Test()
{
  const [myState, setState] = useState(false);

  useEffect(function() {
    console.log('Parent component rerenderd');
  });

  return (
    <>
      <p>I am Parent</p>
      <button onClick={() => setState(!myState)}>Rerender parent component</button>
      <TestChild />
    </>
  )
}

function App() {
  return (
    <div className="App">

      <h2>Hello fucker!</h2>
      <br />

      <Test />
      
    </div>
  );
}

export default App;

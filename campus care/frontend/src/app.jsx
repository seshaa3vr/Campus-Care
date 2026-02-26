function App(){
  const {useState} = React;

  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser({name: username});
  };

  return (
    <div className="app-root">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

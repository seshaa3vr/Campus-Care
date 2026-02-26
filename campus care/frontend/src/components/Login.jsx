function Login({ onLogin }) {
  const { useState } = React;

  const [mode, setMode] = useState('login');

  // login
  const [loginName, setLoginName] = useState('');

  // signup
  const [regNo, setRegNo] = useState('');
  const [sname, setSname] = useState('');
  const [sclass, setSclass] = useState('');
  const [dept, setDept] = useState('');
  const [section, setSection] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});

  const resetErrors = () => setErrors({});

  const doLogin = (e) => {
    e && e.preventDefault();
    if (!loginName.trim()) return setErrors({ login: 'Please enter your name to login.' });
    resetErrors();
    onLogin(loginName.trim());
  };

  const validateSignup = () => {
    const err = {};
    if (!/^RA\d{13}$/.test(regNo)) err.regNo = 'Registration number must be in format RA followed by 13 digits (e.g. RA0123456789012).';
    if (!sname.trim()) err.sname = 'Name is required';
    if (!sclass.trim()) err.sclass = 'Class is required';
    if (!dept.trim()) err.dept = 'Department is required';
    if (!section.trim()) err.section = 'Section is required';
    if (!email.includes('srmist.edu.in')) err.email = 'Please provide your college email (srmist.edu.in).';
    else if (!/^[A-Za-z]{2}\d{4}@srmist\.edu\.in$/.test(email)) err.email = 'Email should match AA0000@srmist.edu.in format (two letters + four digits).';
    if (password.length < 6) err.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) err.confirmPassword = 'Passwords do not match';
    return err;
  };

  const doSignup = (e) => {
    e.preventDefault();
    const v = validateSignup();
    if (Object.keys(v).length) { setErrors(v); return; }
    resetErrors();
    alert('Registration successful — logging you in');
    onLogin(sname.trim());
  };

  return (
    <div className="auth-page">
      <div className="hero">
        <img src="./assets/srm-logo.svg" className="corner-logo" alt="SRM" />
        <div className="hero-mark">SRM INSTITUTE</div>
      </div>

      <form className="card auth-card" onSubmit={mode === 'login' ? doLogin : doSignup}>
        <img src="./assets/srm-logo.svg" className="card-logo" alt="SRM" />

        <div className="mode-toggle">
          <button type="button" className={mode === 'login' ? 'btn-toggle active' : 'btn-toggle'} onClick={() => { setMode('login'); resetErrors(); }}>Log in</button>
          <button type="button" className={mode === 'signup' ? 'btn-toggle active' : 'btn-toggle'} onClick={() => { setMode('signup'); resetErrors(); }}>Sign up</button>
        </div>

        {mode === 'login' ? (
          <>
            <h2>Welcome back</h2>
            {errors.login && <div className="form-error">{errors.login}</div>}
            <div className="field">
              <label>Your name</label>
              <input value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="Enter your name" />
            </div>
            <div className="actions">
              <button type="submit" className="btn">Log in</button>
            </div>
          </>
        ) : (
          <>
            <h2>Create an account</h2>
            <div className="field">
              <label>Registration number</label>
              <input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="RA0123456789012" />
              {errors.regNo && <div className="form-error">{errors.regNo}</div>}
            </div>

            <div className="field">
              <label>Full name</label>
              <input value={sname} onChange={(e) => setSname(e.target.value)} placeholder="Your full name" />
              {errors.sname && <div className="form-error">{errors.sname}</div>}
            </div>

            <div className="field-row">
              <div className="field small">
                <label>Class</label>
                <input value={sclass} onChange={(e) => setSclass(e.target.value)} placeholder="e.g. I B.Sc" />
                {errors.sclass && <div className="form-error">{errors.sclass}</div>}
              </div>
              <div className="field small">
                <label>Department</label>
                <input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="e.g. CSE" />
                {errors.dept && <div className="form-error">{errors.dept}</div>}
              </div>
            </div>

            <div className="field-row">
              <div className="field small">
                <label>Section</label>
                <input value={section} onChange={(e) => setSection(e.target.value)} placeholder="A" />
                {errors.section && <div className="form-error">{errors.section}</div>}
              </div>
              <div className="field small">
                <label>College email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="AA0000@srmist.edu.in" />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
            </div>

            <div className="field-row">
              <div className="field small">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>
              <div className="field small">
                <label>Confirm password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
                {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
              </div>
            </div>

            <div className="actions">
              <button type="submit" className="btn">Create account</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

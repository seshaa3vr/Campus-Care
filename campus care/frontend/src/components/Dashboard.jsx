function Dashboard({user}){
  const {useState, useEffect} = React;

  const [issueType, setIssueType] = useState('Plumbing');
  const [building, setBuilding] = useState('Main Hall');
  const [issueName, setIssueName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(()=>{
    return () => {
      if(photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if(!f){
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const submit = (e) =>{
    e.preventDefault();
    // For now we create a FormData to show intent for backend integration later
    const form = new FormData();
    form.append('type', issueType);
    form.append('building', building);
    form.append('name', issueName);
    if(photoFile) form.append('photo', photoFile);

    // In this demo we just show a brief confirmation. Backend integration will POST `form`.
    alert(`Issue submitted:\nType: ${issueType}\nBuilding: ${building}\nName: ${issueName || '(no name)'}\nPhoto: ${photoFile ? photoFile.name : '(none)'} `);
  };

  return (
    <div className="dashboard-page">
      <Header user={user} />
      <main className="dashboard-body">
        <div className="dashboard-card card">
          <div className="dashboard-banner">
            <img src="./assets/srm-logo.svg" className="banner-logo" alt="SRM" />
            <h2>Report an issue</h2>
          </div>
          <form onSubmit={submit} className="issue-form">
            <label>Issue type
              <select value={issueType} onChange={(e)=>setIssueType(e.target.value)}>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Cleaning</option>
                <option>Security</option>
                <option>Other</option>
              </select>
            </label>

            <label>Building
              <select value={building} onChange={(e)=>setBuilding(e.target.value)}>
                <option>Main Hall</option>
                <option>Library</option>
                <option>Science Block</option>
                <option>Gym</option>
              </select>
            </label>

            <label>Issue name
              <input value={issueName} onChange={(e)=>setIssueName(e.target.value)} placeholder="Short title of the issue" />
            </label>

            <label className="file-uploader">Upload photo
              <div className="file-row">
                <input id="photo" type="file" accept="image/*" onChange={handleFileChange} />
                <div className="file-info">
                  {photoFile ? <div className="file-name">{photoFile.name}</div> : <div className="file-none">No file selected</div>}
                </div>
              </div>
              {photoPreview && (
                <div className="preview">
                  <img src={photoPreview} alt="preview" className="preview-img" />
                </div>
              )}
            </label>

            <div className="actions">
              <button className="btn" type="submit">Submit Issue</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

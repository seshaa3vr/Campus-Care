function Header({user}){
  const avatarSrc = user ? `https://i.pravatar.cc/80?u=${encodeURIComponent(user.name)}` : '';
  return (
    <header className="cc-header">
      <div className="brand">
        <img className="college-logo" src="./assets/srm-logo.svg" alt="SRM logo" />
        <div className="brand-text">Campus Care</div>
      </div>

      <div className="profile">
        {user ? (
          <>
            <img className="avatar" src={avatarSrc} alt="profile" />
            <div className="profile-text">Signed in as <strong>{user.name}</strong></div>
          </>
        ) : (
          <div className="profile-text">Not signed in</div>
        )}
      </div>
    </header>
  );
}

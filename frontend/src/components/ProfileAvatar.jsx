export default function ProfileAvatar({ src, name, size = 40, className = '' }) {
  const initials =
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'MG';

  const style = {
    width: `${size}px`,
    height: `${size}px`
  };

  return src ? (
    <img src={src} alt={name || 'Profile'} className={`profile-avatar ${className}`} style={style} />
  ) : (
    <span className={`profile-avatar profile-avatar-fallback ${className}`} style={style} aria-label="Profile avatar">
      {initials}
    </span>
  );
}

import { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import { FiImage, FiRefreshCw, FiUpload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import ProfileAvatar from '../components/ProfileAvatar';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ProfilePage() {
  const { user } = useAuth();
  const { customProfileImage, setCustomProfileImage, clearCustomProfileImage } = usePreferences();
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const name = user?.displayName || user?.email?.split('@')[0] || 'MediGrid User';
  const email = user?.email || 'Not available';
  const avatarSrc = customProfileImage || user?.photoURL || '';

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setCustomProfileImage(dataUrl);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const saveFromUrl = () => {
    if (!urlInput.trim()) return;
    setCustomProfileImage(urlInput.trim());
    setUrlInput('');
  };

  return (
    <div className="page-grid two-col">
      <section className="pin-card form-card profile-card">
        <header className="section-head">
          <h3>Profile</h3>
          <p>Manage your account identity and preferred profile image.</p>
        </header>

        <div className="profile-header-row">
          <ProfileAvatar src={avatarSrc} name={name} size={82} />
          <div>
            <h4 className="profile-name">{name}</h4>
            <p className="profile-email">{email}</p>
          </div>
        </div>

        <Stack spacing={1.2}>
          <TextField label="Display Name" value={name} disabled />
          <TextField label="Email" value={email} disabled />
        </Stack>
      </section>

      <section className="pin-card form-card profile-card">
        <header className="section-head">
          <h3>Profile Picture</h3>
          <p>By default we use your Google photo, or an avatar if no Google photo is available.</p>
        </header>

        <Stack spacing={1.2}>
          <TextField
            label="Image URL"
            placeholder="https://example.com/avatar.jpg"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
          />

          <div className="row-actions">
            <Button type="button" startIcon={<FiImage />} onClick={saveFromUrl} disabled={!urlInput.trim()}>
              Save URL
            </Button>

            <Button type="button" variant="outlined" component="label" startIcon={<FiUpload />} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" hidden onChange={onFileChange} />
            </Button>

            <Button type="button" variant="outlined" color="inherit" startIcon={<FiRefreshCw />} onClick={clearCustomProfileImage}>
              Reset Default
            </Button>
          </div>
        </Stack>
      </section>
    </div>
  );
}

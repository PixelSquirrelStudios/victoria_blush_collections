'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, Trash2 } from 'lucide-react';
import Uploader from '@/components/shared/Uploader';
import { updateOwnAvatar } from '@/lib/actions/user.actions';
import { supabaseClient } from '@/lib/supabase/browserClient';
import styles from '@/components/booking/booking.module.css';

export default function ClientAvatarForm({ userId, avatarUrl }: { userId: string; avatarUrl: string | null }) {
  const router = useRouter();
  const [preview, setPreview] = useState(avatarUrl);
  const [filePath, setFilePath] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (filePath === undefined || busy) return;
    setBusy(true); setError('');
    try {
      const result = await updateOwnAvatar(filePath);
      if (result.error) throw new Error(result.error);
      router.push('/dashboard/bookings');
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Your avatar could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={save} className={`${styles.surface} ${styles.avatarForm}`}>
    <fieldset disabled={busy} className={styles.avatarFields}>
      <legend className="sr-only">Your Avatar</legend>
      <div className={styles.avatarBody}>
        <Image src={preview || '/assets/images/Default_Avatar.jpg'} alt="Your avatar preview" width={128} height={128} className={styles.avatarPreview} />
        <div className={styles.avatarControls}>
          <h2>Profile Photo</h2>
          <div className={styles.avatarUpload}>
            <Uploader type="modal" contentType="profiles" bucketName="images" folderPath="avatars" userId={userId} fileAttached={null} uppyId="client-avatar" allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']} onUpload={path => {
              setFilePath(path);
              setPreview(path ? supabaseClient.storage.from('images').getPublicUrl(path).data.publicUrl : null);
              setError('');
            }} />
          </div>
          {preview && <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => { setFilePath(null); setPreview(null); }}><Trash2 size={18} />Remove Avatar</button>}
        </div>
      </div>
      {error && <p role="alert" className={`${styles.message} ${styles.error}`}>{error}</p>}
      <div className={styles.avatarActions}>
        <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => router.push('/dashboard/bookings')}>Cancel</button>
        <button type="submit" className={styles.button} disabled={busy || filePath === undefined}><Save size={18} />{busy ? 'Saving...' : 'Save Avatar'}</button>
      </div>
    </fieldset>
  </form>;
}
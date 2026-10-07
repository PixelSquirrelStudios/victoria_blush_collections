import EditUserForm from '@/components/forms/EditUserForm';
import { getUserWithProfile } from '@/lib/actions/user.actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { bookingIdentity } from '@/lib/booking-server';
import ClientAvatarForm from '@/components/forms/ClientAvatarForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from '@/components/booking/dashboard.module.css';

const EditProfile = async () => {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();
  const userId = userData?.claims.sub;

  if (!userId) {
    redirect('/sign-in');
  }

  const profile = await getUserWithProfile(userId);
  const identity = await bookingIdentity();
  if (!identity.admin) {
    if (!identity.client) redirect('/');
    return <div className={styles.dashboard}>
      <header className={styles.header}>
        <div><h1>Edit Avatar</h1><p className={styles.dateline}>Your Account</p></div>
        <Link href="/dashboard/bookings" className={styles.secondaryLink}><ArrowLeft size={18} />Back to Dashboard</Link>
      </header>
      <ClientAvatarForm userId={userId} avatarUrl={profile?.avatar_url || null} />
    </div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div><h1>Edit Profile</h1><p className={styles.dateline}>Your Account</p></div>
        <Link href="/dashboard" className={styles.secondaryLink}><ArrowLeft size={18} />Back to Dashboard</Link>
      </header>
      <EditUserForm profileDetails={JSON.stringify(profile)} />
    </div>
  );
};

export default EditProfile;

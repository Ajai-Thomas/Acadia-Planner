import { useEffect, useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import PageShell from '../components/PageShell';
import Card from '../components/Card';
import Button from '../components/Button';

const ProfilePage = () => {
  const { logout, token } = usePlanner();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/user/', {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => res.json())
    .then(setProfile)
    .catch(console.error);
  }, [token]);

  return (
    <PageShell title="My Profile">
      <Card className="bg-white p-8 max-w-lg mx-auto shadow-2xl">
        {profile ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-planetary">Username</p>
              <p className="text-2xl font-black text-black">{profile.username}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-planetary">Email</p>
              <p className="text-lg font-medium text-black">{profile.email || 'Not provided'}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted text-center animate-pulse">Loading profile...</p>
        )}
        <div className="mt-10">
          <Button onClick={logout} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
            Sign Out
          </Button>
        </div>
      </Card>
    </PageShell>
  );
};

export default ProfilePage;

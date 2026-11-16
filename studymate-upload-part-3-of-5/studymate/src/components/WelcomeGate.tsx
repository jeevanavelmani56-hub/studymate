"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Check, Sparkles } from 'lucide-react';
import { Dashboard } from '@/components/dashboard/dashboard';

type Profile = { name: string; googleId: string };

export function WelcomeGate() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [googleId, setGoogleId] = useState('');
  useEffect(() => {
    const saved = localStorage.getItem('studymate-profile');
    if (saved) {
      try { const value = JSON.parse(saved) as Profile; if (value.name) setProfile(value); } catch { localStorage.removeItem('studymate-profile'); }
    }
  }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const next = { name: name.trim(), googleId: googleId.trim() };
    localStorage.setItem('studymate-profile', JSON.stringify(next));
    setProfile(next);
  }
  if (profile) return <Dashboard user={profile.name} googleId={profile.googleId} onSignOut={() => { localStorage.removeItem('studymate-profile'); setProfile(null); setName(''); setGoogleId(''); }} />;
  return <main className="welcome-shell">
    <section className="welcome-card">
      <div className="welcome-logo"><span><BookOpen size={22}/></span><strong>study<span>mate</span></strong></div>
      <div className="welcome-art"><div className="welcome-art-ring ring-a"/><div className="welcome-art-ring ring-b"/><div className="welcome-art-book"><BookOpen size={42}/></div><div className="welcome-float"><Check size={14}/> Progress saved</div></div>
      <p className="welcome-kicker">YOUR PERSONAL STUDY SPACE</p>
      <h1>A better way to<br/><em>learn anything.</em></h1>
      <p className="welcome-copy">One thoughtful workspace for questions, notes, practice, and the ideas in between.</p>
      <form onSubmit={submit} className="welcome-form">
        <label htmlFor="student-name">What should we call you?</label>
        <input id="student-name" value={name} onChange={event => setName(event.target.value)} placeholder="Enter your name" autoComplete="given-name" maxLength={40} required />
        <label htmlFor="google-id">Google ID / account email <span>Optional</span></label>
        <input id="google-id" type="email" value={googleId} onChange={event => setGoogleId(event.target.value)} placeholder="you@example.com" autoComplete="email" />
        <p className="welcome-privacy">Your profile is stored in this browser only. Never enter your Google password here. OAuth sign-in can be added separately.</p>
        <button type="submit">Create my study space <ArrowRight size={17}/></button>
      </form>
      <p className="welcome-foot"><Sparkles size={12}/> Small steps. Big understanding.</p>
    </section>
  </main>;
}

'use client';
import React from 'react';
import { Candidate } from '../../data/candidates';

interface CandidateDetailPanelProps {
  candidate: Candidate;
  onInvite: () => void;
  onPass: () => void;
}

function StatBadge({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: '12px', background: accent ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${accent ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`, flex: 1 }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 600, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ color: accent ? '#818CF8' : 'white', fontSize: '13px', fontWeight: 700, margin: 0 }}>{value}</p>
    </div>
  );
}

export default function CandidateDetailPanel({ candidate, onInvite, onPass }: CandidateDetailPanelProps) {
  const matchColor = candidate.matchScore >= 90 ? '#22C55E' : candidate.matchScore >= 75 ? '#818CF8' : '#FACC15';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', scrollbarWidth: 'none' }}>

      {/* Header avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p style={{ color: 'white', fontSize: '16px', fontWeight: 700, margin: 0 }}>{candidate.name}</p>
            {candidate.verified && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0' }}>{candidate.role}</p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', margin: '1px 0 0' }}>{candidate.distance} · {candidate.availability.split('·')[0].trim()}</p>
        </div>
      </div>

      {/* Match score bar */}
      <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Match Score</span>
          <span style={{ color: matchColor, fontSize: '14px', fontWeight: 800 }}>{candidate.matchScore}%</span>
        </div>
        <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${candidate.matchScore}%`, borderRadius: '999px', background: `linear-gradient(90deg, ${matchColor}, ${matchColor}99)`, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <StatBadge label="Expected" value={candidate.salary.split('–')[0].trim() + '+'} accent />
        <StatBadge label="Status" value={candidate.availability.split('·')[0].trim()} />
      </div>

      {/* About */}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>About</p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', lineHeight: 1.7, margin: 0 }}>{candidate.description}</p>
      </div>

      {/* Skills */}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Skills</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {candidate.tags.map(tag => (
            <span key={tag} style={{ padding: '4px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', color: '#818CF8' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Experience</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {candidate.experience.map((exp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366F1', flexShrink: 0, marginTop: '5px' }} />
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{exp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>🎓</span>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Education</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0, fontWeight: 500 }}>{candidate.education}</p>
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
        <button
          onClick={onInvite}
          style={{ width: '100%', padding: '13px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 18px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Send Invite
        </button>
        <button
          onClick={onPass}
          style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          Pass
        </button>
      </div>
    </div>
  );
}
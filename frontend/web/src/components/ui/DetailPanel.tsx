import React from 'react';
import { Job } from '../../types/job';
import { IconVerified, IconDollar, IconClock, IconMapPin, IconCheck, IconStar, IconX } from './icons';

interface DetailPanelProps {
  job: Job;
  onApply: () => void;
  onSkip: () => void;
}

export default function DetailPanel({ job, onApply, onSkip }: DetailPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', scrollbarWidth: 'none' }}>

      {/* Header */}
      <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
            <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>{job.company}</span>
              {job.verified && <IconVerified />}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.3 }}>{job.role}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {[
            { icon: <IconDollar />, text: job.salary },
            { icon: <IconClock />, text: job.type },
            { icon: <IconMapPin />, text: job.distance },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>
              {icon}<span>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onApply} style={{ flex: 1, padding: '11px 0', borderRadius: '14px', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #22C55E, #16a34a)', boxShadow: '0 4px 18px rgba(34,197,94,0.28)' }}>Apply Now</button>
          <button onClick={onSkip} style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><IconX /></button>
        </div>
      </div>

      {/* About */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>About the Role</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.65 }}>{job.description}</p>
      </div>

      {/* Requirements */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Requirements</p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: 0, padding: 0 }}>
          {job.requirements.map((req, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ marginTop: '2px', width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.14)', color: '#22C55E' }}><IconCheck /></span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: 1.5 }}>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Skills</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {job.tags.map((t) => (
            <span key={t} style={{ padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, background: 'rgba(255,78,106,0.08)', border: '1px solid rgba(255,78,106,0.2)', color: '#FF7A8A' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div style={{ padding: '18px 22px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Benefits</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {job.benefits.map((b) => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
              <span style={{ color: '#FFB347', flexShrink: 0 }}><IconStar /></span>{b}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

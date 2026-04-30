import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import LeftSidebar from '@/components/ui/LeftSidebar';
import TopBar from '@/components/ui/TopBar';
import { jobs as ALL_JOBS } from '@/data/jobs';
import { Job } from '@/types/job';
import { USER_NAV, USER_NAV_ROUTES } from '@/lib/nav';
import {
  IconVerified,
  IconMapPin,
  IconSearch,
  IconX,
  IconHeart,
} from '@/components/ui/icons';

// ─── Route → nav id map ───────────────────────────────────────────────────────
const ROUTE_TO_NAV: Record<string, string> = {
  '/user/explore':     'explore',
  '/user/application': 'applications',
  '/user/messages':    'messages',
  '/user/profile':     'profile',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkStyle = 'Remote' | 'Hybrid' | 'On-site';
type SortOption = 'Newest' | 'Salary' | 'Match';
type CategoryFilter = 'All' | 'Design' | 'Engineering' | 'Marketing' | 'Product' | 'Data';

const WORK_STYLE_CONFIG: Record<WorkStyle, { color: string; bg: string; border: string; accent: string }> = {
  Remote:    { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.22)',   accent: '#22C55E' },
  Hybrid:    { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.22)',  accent: '#FBBF24' },
  'On-site': { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.22)',  accent: '#60A5FA' },
};

// ─── Company data map ─────────────────────────────────────────────────────────
interface CompanyInfo {
  about: string;
  industry: string;
  size: string;
  founded: string;
  website: string;
  photos: string[];
}

const COMPANY_INFO: Record<string, CompanyInfo> = {
  'Accenture': {
    about: 'Accenture is a global professional services company that helps clients build their digital core, optimize their operations, accelerate revenue growth and enhance citizen services. With deep industry experience and specialized capabilities in strategy, technology, and operations.',
    industry: 'Professional Services & Technology',
    size: '700,000+ employees',
    founded: '1989',
    website: 'accenture.com',
    photos: [
      '/assets/images/accenture.jpg',
      '/assets/images/accenture2.jpg',
      '/assets/images/accenture3.jpg',
    ],
  },
  'Alorica': {
    about: 'Alorica is a leading provider of customer experience solutions, delivering services in customer care, technical support, and back-office operations. They partner with some of the world\'s most respected brands to build better customer experiences.',
    industry: 'Business Process Outsourcing',
    size: '100,000+ employees',
    founded: '1999',
    website: 'alorica.com',
    photos: [
      '/assets/images/alorica.jpg',
      '/assets/images/alorica2.jpg',
      '/assets/images/alorica3.jpg',
    ],
  },
  'Socia': {
    about: 'Socia is a fast-growing social commerce platform redefining how brands connect with consumers through authentic creator-driven experiences. We combine data intelligence with community-driven content to power the next generation of social selling.',
    industry: 'Social Commerce & Technology',
    size: '500–1,000 employees',
    founded: '2019',
    website: 'socia.io',
    photos: [
      '/assets/images/socia.png',
      '/assets/images/socia2.png',
      '/assets/images/socia3.png',
    ],
  },
};

// Fallback for companies not in the map
function getCompanyInfo(companyName: string): CompanyInfo {
  // Try exact match first, then partial match
  const exact = COMPANY_INFO[companyName];
  if (exact) return exact;

  const key = Object.keys(COMPANY_INFO).find(k =>
    companyName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(companyName.toLowerCase())
  );
  if (key) return COMPANY_INFO[key];

  return {
    about: `${companyName} is a forward-thinking company dedicated to innovation and excellence. They foster a collaborative culture that empowers employees to do their best work.`,
    industry: 'Technology',
    size: 'Not specified',
    founded: 'N/A',
    website: '',
    photos: [],
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWorkStyle(job: Job): WorkStyle {
  const combined = `${job.type} ${job.distance}`.toLowerCase();
  if (combined.includes('remote')) return 'Remote';
  if (combined.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

function getCategory(job: Job): CategoryFilter {
  const role = job.role.toLowerCase();
  if (role.includes('design') || role.includes('ux') || role.includes('ui')) return 'Design';
  if (role.includes('engineer') || role.includes('developer') || role.includes('frontend') || role.includes('backend')) return 'Engineering';
  if (role.includes('market') || role.includes('growth') || role.includes('brand')) return 'Marketing';
  if (role.includes('product') || role.includes('pm') || role.includes('manager')) return 'Product';
  if (role.includes('data') || role.includes('analyst') || role.includes('science')) return 'Data';
  return 'All';
}

// ─── Company Photo Gallery ────────────────────────────────────────────────────
function CompanyPhotoGallery({ photos, company }: { photos: string[]; company: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Main large photo */}
      <div style={{
        width: '100%',
        height: '200px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        position: 'relative',
      }}>
        <img
          src={photos[activeIndex]}
          alt={`${company} office ${activeIndex + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }}
        />
        {/* Dot indicators */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '5px',
        }}>
          {photos.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === activeIndex ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === activeIndex ? 'white' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {photos.map((photo, i) => (
          <div
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              width: '72px',
              height: '52px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `1px solid ${i === activeIndex ? 'rgba(255,78,106,0.6)' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer',
              opacity: i === activeIndex ? 1 : 0.55,
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <img src={photo} alt={`${company} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onViewDetails, onSave, isSaved }: {
  job: Job;
  onViewDetails: () => void;
  onSave: () => void;
  isSaved: boolean;
}) {
  const style   = getWorkStyle(job);
  const cfg     = WORK_STYLE_CONFIG[style];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `3px solid ${cfg.accent}`,
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.18s',
        cursor: 'default',
      }}
    >
      {/* Top row: logo + company + work style badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '11px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</span>
            {job.verified && <IconVerified />}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</p>
        </div>

        <span style={{
          flexShrink: 0, padding: '3px 9px', borderRadius: '999px',
          fontSize: '10px', fontWeight: 700,
          background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
        }}>
          {style}
        </span>
      </div>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {job.tags.slice(0, 4).map((tag: string) => (
            <span key={tag} style={{
              padding: '2px 9px', borderRadius: '6px', fontSize: '11px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
        <IconMapPin />
        <span>{job.distance}</span>
        <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>
        <span>{job.type.split('·')[0].trim()}</span>
      </div>

      {/* Bottom row: salary + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 700 }}>{job.salary}</span>

        <div style={{ display: 'flex', gap: '7px' }}>
          {/* Save / bookmark */}
          <button
            onClick={onSave}
            style={{
              width: '32px', height: '32px', borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isSaved ? 'rgba(255,78,106,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isSaved ? 'rgba(255,78,106,0.35)' : 'rgba(255,255,255,0.09)'}`,
              color: isSaved ? '#FF4E6A' : 'rgba(255,255,255,0.35)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <IconHeart />
          </button>

          {/* View Details */}
          <button
            onClick={onViewDetails}
            style={{
              padding: '0 16px', height: '32px', borderRadius: '9px',
              fontSize: '12px', fontWeight: 700,
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Full-Screen Detail Modal ─────────────────────────────────────────────────
function DetailModal({ job, onClose, onSave, isSaved }: {
  job: Job;
  onClose: () => void;
  onSave: () => void;
  isSaved: boolean;
}) {
  const style    = getWorkStyle(job);
  const cfg      = WORK_STYLE_CONFIG[style];
  const compInfo = getCompanyInfo(job.company);

  return (
    /* Backdrop — covers the entire viewport including the left sidebar */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px',
      }}
    >
      {/* Modal panel — stop click propagation so clicking inside doesn't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '780px', maxHeight: '90vh',
          background: '#0e0e18',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >

        {/* ── Top bar ── */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Job Details
          </span>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
            }}
          >
            <IconX />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

          {/* Hero section */}
          <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
              <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '22px' }}>{job.company}</span>
                {job.verified && <IconVerified />}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 14px' }}>{job.role}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                  {style}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}>
                  {job.type.split('·')[0].trim()}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconMapPin /> {job.distance}
                </span>
              </div>
            </div>

            {/* Salary callout */}
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 4px' }}>Salary</p>
              <p style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>{job.salary}</p>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Work style',  value: style },
                { label: 'Type',        value: job.type.split('·')[0].trim() },
                { label: 'Location',    value: job.distance },
                { label: 'Posted',      value: (job as any).postedAt ?? 'Recently' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 5px' }}>{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {job.tags && job.tags.length > 0 && (
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 12px' }}>Skills & keywords</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {job.tags.map((tag: string) => (
                  <span key={tag} style={{ padding: '5px 13px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {(job as any).description && (
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 12px' }}>About the role</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{(job as any).description}</p>
            </div>
          )}

          {/* ── COMPANY INFORMATION SECTION (NEW) ── */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

            {/* Section header */}
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 18px' }}>
              About the Company
            </p>

            {/* Company header row: logo + name + website */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '13px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{job.company}</span>
                  {job.verified && <IconVerified />}
                </div>
                {compInfo.website && (
                  <a
                    href={`https://${compInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#FF4E6A', fontSize: '12px', textDecoration: 'none', opacity: 0.85 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                  >
                    {compInfo.website} ↗
                  </a>
                )}
              </div>
            </div>

            {/* Company stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Industry',  value: compInfo.industry },
                { label: 'Company size', value: compInfo.size },
                { label: 'Founded',   value: compInfo.founded },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 5px' }}>{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* About text */}
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.75, margin: '0 0 20px' }}>
              {compInfo.about}
            </p>

            {/* Company Photos */}
            {compInfo.photos.length > 0 && (
              <>
                <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 12px' }}>
                  Company Photos
                </p>
                <CompanyPhotoGallery photos={compInfo.photos} company={job.company} />
              </>
            )}
          </div>
          {/* ── END COMPANY INFORMATION SECTION ── */}

          <div style={{ height: '24px' }} />
        </div>

        {/* ── Sticky footer ── */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          display: 'flex', gap: '12px', alignItems: 'center',
          background: '#0e0e18',
        }}>
          <button
            onClick={onSave}
            style={{
              width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isSaved ? 'rgba(255,78,106,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isSaved ? 'rgba(255,78,106,0.35)' : 'rgba(255,255,255,0.09)'}`,
              color: isSaved ? '#FF4E6A' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <IconHeart />
          </button>

          <button
            style={{
              flex: 1, height: '46px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700,
              background: 'linear-gradient(135deg, #FF4E6A, #FF7854)',
              color: 'white', border: 'none', cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Apply Now
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '0 20px', height: '46px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 600,
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Jobs Sidebar ───────────────────────────────────────────────────────
function SavedJobsSidebar({ savedJobs, onRemove }: { savedJobs: Job[]; onRemove: (id: string | number) => void }) {
  return (
    <div style={{ width: '260px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', margin: 0 }}>Saved Jobs</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '3px 0 0' }}>{savedJobs.length} saved</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {savedJobs.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔖</div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
              Tap the heart on any job to save it here
            </p>
          </div>
        ) : savedJobs.map(job => (
          <div
            key={job.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
              <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</p>
            </div>
            <button
              onClick={() => onRemove(job.id)}
              style={{ width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', flexShrink: 0 }}
            >
              <IconX />
            </button>
          </div>
        ))}
      </div>

      {savedJobs.length > 0 && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button
            style={{
              width: '100%', padding: '9px', borderRadius: '10px',
              fontSize: '12px', fontWeight: 700,
              background: 'linear-gradient(135deg, #FF4E6A, #FF7854)',
              color: 'white', border: 'none', cursor: 'pointer',
            }}
          >
            Apply to All Saved ({savedJobs.length})
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main ExplorePage ─────────────────────────────────────────────────────────
export default function ExplorePage() {
  const router     = useRouter();
  const sidebarRef = useRef<HTMLElement>(null!);

  const activeNav = ROUTE_TO_NAV[router.pathname] ?? 'explore';

  const [leftOpen,    setLeftOpen]    = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [activeWorkStyle, setActiveWorkStyle] = useState<WorkStyle | 'All'>('All');
  const [sortBy,      setSortBy]      = useState<SortOption>('Newest');
  const [savedIds,    setSavedIds]    = useState<Set<string | number>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const swipedCount = 0;
  const swipesLeft  = 15 - swipedCount;

  const CATEGORIES: CategoryFilter[]       = ['All', 'Design', 'Engineering', 'Marketing', 'Product', 'Data'];
  const WORK_STYLES: (WorkStyle | 'All')[] = ['All', 'Remote', 'Hybrid', 'On-site'];
  const SORT_OPTIONS: SortOption[]         = ['Newest', 'Salary', 'Match'];

  const filtered = ALL_JOBS.filter(j => {
    const matchCategory  = activeCategory === 'All' || getCategory(j) === activeCategory;
    const matchWorkStyle = activeWorkStyle === 'All' || getWorkStyle(j) === activeWorkStyle;
    const matchSearch    =
      !searchQuery ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchWorkStyle && matchSearch;
  });

  const savedJobs = ALL_JOBS.filter(j => savedIds.has(j.id));

  const toggleSave = (id: string | number) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#07070f', fontFamily: "'DM Sans', 'Inter', sans-serif", overflow: 'hidden' }}>

      {/* ── Left Sidebar ── */}
      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav={activeNav}
        setActiveNav={() => {}}
        swipedCount={swipedCount}
        swipesLeft={swipesLeft}
        navItems={USER_NAV}
        navRoutes={USER_NAV_ROUTES}
        accentColor="#FF4E6A"
        counterLabel="Daily swipes"
        counterLimit={15}
        profileName="Alex Rivera"
        profileEmail="alex@email.com"
        profileImage="/assets/images/img1.jpg"
        avatarRadius="50%"
      />

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <TopBar
          title="Explore Jobs"
          subtitle={`${filtered.length} jobs match your profile`}
          accentColor="#FF4E6A"
        />

        {/* ── Filter bar ── */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Search + sort */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '8px 12px', flex: 1 }}>
              <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}><IconSearch /></span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search roles, companies, or skills…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '13px' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <IconX />
                </button>
              )}
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  style={{
                    padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    background: sortBy === opt ? 'rgba(255,78,106,0.18)' : 'transparent',
                    color: sortBy === opt ? '#FF4E6A' : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Category chips + work-style chips */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginRight: '2px' }}>Role</span>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                style={{
                  padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                  border: `1px solid ${activeCategory === c ? '#FF4E6A' : 'rgba(255,255,255,0.1)'}`,
                  background: activeCategory === c ? 'rgba(255,78,106,0.12)' : 'transparent',
                  color: activeCategory === c ? '#FF4E6A' : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {c}
              </button>
            ))}

            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginRight: '2px' }}>Work</span>
            {WORK_STYLES.map(w => (
              <button
                key={w}
                onClick={() => setActiveWorkStyle(w)}
                style={{
                  padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                  border: `1px solid ${activeWorkStyle === w ? (w === 'All' ? '#FF4E6A' : WORK_STYLE_CONFIG[w as WorkStyle]?.color ?? '#FF4E6A') : 'rgba(255,255,255,0.1)'}`,
                  background: activeWorkStyle === w ? (w === 'All' ? 'rgba(255,78,106,0.12)' : `${WORK_STYLE_CONFIG[w as WorkStyle]?.bg}`) : 'transparent',
                  color: activeWorkStyle === w ? (w === 'All' ? '#FF4E6A' : WORK_STYLE_CONFIG[w as WorkStyle]?.color ?? '#FF4E6A') : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

            {/* Result count */}
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 16px' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>🔍</div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>No jobs found</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>Try adjusting your filters</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {filtered.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={() => setSelectedJob(job)}
                    onSave={() => toggleSave(job.id)}
                    isSaved={savedIds.has(job.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right panel: always show saved jobs */}
          <SavedJobsSidebar
            savedJobs={savedJobs}
            onRemove={(id) => toggleSave(id)}
          />
        </div>
      </div>

      {/* Full-screen detail modal — rendered over everything including the sidebar */}
      {selectedJob && (
        <DetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSave={() => toggleSave(selectedJob.id)}
          isSaved={savedIds.has(selectedJob.id)}
        />
      )}
    </div>
  );
}
import React from 'react';

interface IconProps {
  className?: string;
}

const GavelIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.427 9.239 14.76 1.573a2.25 2.25 0 0 0-3.182 0L3.911 9.239a2.25 2.25 0 0 0 0 3.182l1.63 1.631-.662 3.308a2.25 2.25 0 0 0 3.248 2.583l3.043-1.826 3.043 1.826a2.25 2.25 0 0 0 3.248-2.583l-.662-3.308 1.63-1.631a2.25 2.25 0 0 0 0-3.182ZM12 14.25a.75.75 0 0 1-.75-.75V8.25a.75.75 0 0 1 1.5 0v5.25a.75.75 0 0 1-.75.75Z" /></svg>
);

const ScalesOfJusticeIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 0 1 1 1v2.101a1 1 0 0 1-.293.708l-3 3a1 1 0 0 1-1.414 0l-3-3A1 1 0 0 1 5 5.101V3a1 1 0 0 1 1-1h6Zm-2.707 9.293a1 1 0 0 1 0-1.414l3-3a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0Z" /><path fillRule="evenodd" d="M3.19 8.293a1 1 0 0 1 1.233-.243l4 2a1 1 0 0 1 0 1.898l-4 2A1 1 0 0 1 3 13.5v-5a1 1 0 0 1 .19-.593ZM15.577 10.05a1 1 0 0 1 1.233.243l4 2A1 1 0 0 1 21 13.5v5a1 1 0 0 1-1.423.904l-4-2a1 1 0 0 1 0-1.898l4-2a1 1 0 0 1 .19-.593V10.5a1 1 0 0 1-.423-.904Z" clipRule="evenodd" /></svg>
);

const BookIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.5a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533.75.75 0 0 0 0-1.321v-12a.75.75 0 0 0 0-1.321Z" /><path d="M12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.5a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533.75.75 0 0 1 0-1.321v-12a.75.75 0 0 1 0-1.321Z" /></svg>
);

const DocumentIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 10.5 3h-1.875A3.75 3.75 0 0 0 5.625 1.5ZM12.563 6a.375.375 0 0 0-.375.375v1.875h1.875a.375.375 0 0 0 .375-.375V6.375a.375.375 0 0 0-.375-.375h-1.5Z" clipRule="evenodd" /><path d="M14.063 15h-4.125a.375.375 0 0 1 0-.75h4.125a.375.375 0 0 1 0 .75Z" /></svg>
);

const HandshakeIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.75 1.5a.75.75 0 0 0-1.5 0V6a.75.75 0 0 0 1.5 0V1.5Z" /><path fillRule="evenodd" d="M12 7.5a4.5 4.5 0 0 0-4.5 4.5v3.829a3.375 3.375 0 0 1 .553 1.595.75.75 0 0 0 1.49-.155 1.875 1.875 0 0 0-2.842-1.764.75.75 0 0 0 .196-1.487A3 3 0 0 1 12 9a3 3 0 0 1 3 3v.018a.75.75 0 0 0 .998-.474 5.25 5.25 0 0 0-2.732-5.466A4.48 4.48 0 0 0 12 7.5Z" clipRule="evenodd" /><path d="M12 22.5a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 .75.75Z" /></svg>
);

// FIX: Export ICON_NAMES to be used in the icon picker UI.
export const ICON_NAMES = ['Gavel', 'ScalesOfJustice', 'Book', 'Document', 'Handshake'];

export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  switch (name.toLowerCase()) {
    case 'gavel': return <GavelIcon className={className} />;
    case 'scalesofjustice': return <ScalesOfJusticeIcon className={className} />;
    case 'book': return <BookIcon className={className} />;
    case 'document': return <DocumentIcon className={className} />;
    case 'handshake': return <HandshakeIcon className={className} />;
    default: return <DocumentIcon className={className} />;
  }
};
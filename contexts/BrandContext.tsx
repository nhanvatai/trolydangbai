import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { BrandProfileData } from '../types';

const defaultProfile: BrandProfileData = {
    brandVoice: '',
    targetAudience: '',
    customInstructions: '',
};

interface BrandContextType {
    brandProfile: BrandProfileData;
    setBrandProfile: React.Dispatch<React.SetStateAction<BrandProfileData>>;
}

const BrandContext = createContext<BrandContextType>({
    brandProfile: defaultProfile,
    setBrandProfile: () => {},
});

export const useBrand = () => useContext(BrandContext);

export const BrandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [brandProfile, setBrandProfile] = useState<BrandProfileData>(() => {
        try {
            const savedProfile = localStorage.getItem('brandProfile');
            return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
        } catch (error) {
            console.error('Failed to parse brand profile from localStorage', error);
            return defaultProfile;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('brandProfile', JSON.stringify(brandProfile));
        } catch (error) {
            console.error('Failed to save brand profile to localStorage', error);
        }
    }, [brandProfile]);

    return (
        <BrandContext.Provider value={{ brandProfile, setBrandProfile }}>
            {children}
        </BrandContext.Provider>
    );
};

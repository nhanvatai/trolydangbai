import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { ContentAtom } from '../types';

interface ContentContextType {
    latestContent: ContentAtom | null;
    setLatestContent: (content: ContentAtom | null) => void;
}

const ContentContext = createContext<ContentContextType>({
    latestContent: null,
    setLatestContent: () => {},
});

export const useContent = () => useContext(ContentContext);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [latestContent, setLatestContent] = useState<ContentAtom | null>(null);

    return (
        <ContentContext.Provider value={{ latestContent, setLatestContent }}>
            {children}
        </ContentContext.Provider>
    );
};

import React, { createContext, useState, useContext } from 'react';

export const TagContext = createContext();

export const TagProvider = ({ children }) => {
    const [tagUpdated, setTagUpdated] = useState(false);

    return (
        <TagContext.Provider value={{ tagUpdated, setTagUpdated }}>
            {children}
        </TagContext.Provider>
    );
};
export const useTagContext = () => useContext(TagContext);

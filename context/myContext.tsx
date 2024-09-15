import * as React from 'react';
import { Config, MyContextType } from '../@types/mytype';

export const MyContext = React.createContext<MyContextType | null>(null);

const MyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = React.useState<Config>(
        {
            notegroup: '',
            encryptionkey: '',
            hasPermission: false,
            favColor: '#6FCF97',
        }
    );

    const changeConfig = (conf: Config) => {
        setConfig(conf);
    };

    return (
        <MyContext.Provider value={{ config, changeConfig }}>
            {children}
        </MyContext.Provider>
    );
};

export default MyProvider;





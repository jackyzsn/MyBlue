export interface Config {
    notegroup: string;
    encryptionkey: string;
    hasPermission: boolean;
    favColor: string;
}

export type MyContextType = {
    config: Config;
    changeConfig: (config: Config) => void;
}

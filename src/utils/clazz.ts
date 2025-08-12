
export type Clazz<T extends object>
    = { new(...args: any[]): T };
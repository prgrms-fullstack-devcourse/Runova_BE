
export function deepFreeze<T extends object>(obj: T): T {

    for (const k of Object.keys(obj)) {
        if (obj[k] && typeof obj[k] === 'object')
            deepFreeze(obj[k]);
    }

    return Object.freeze(obj);
}

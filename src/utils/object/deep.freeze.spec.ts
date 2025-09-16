import { deepFreeze } from "./deep.freeze";

describe("deepFreeze", () => {

    it("should freeze a simple object", () => {
        const obj = { a: 1, b: 2 };
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(() => {
            (frozen as any).a = 3;
        }).toThrow();
    });

    it("should freeze nested objects", () => {
        const obj = {
            a: 1,
            b: {
                c: 2,
                d: {
                    e: 3
                }
            }
        };
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.b)).toBe(true);
        expect(Object.isFrozen(frozen.b.d)).toBe(true);

        expect(() => {
            (frozen as any).a = 4;
        }).toThrow();
        expect(() => {
            (frozen.b as any).c = 5;
        }).toThrow();
        expect(() => {
            (frozen.b.d as any).e = 6;
        }).toThrow();
    });

    it("should freeze arrays", () => {
        const obj = {
            arr: [1, 2, { nested: 3 }]
        };
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen.arr)).toBe(true);
        expect(Object.isFrozen(frozen.arr[2])).toBe(true);

        expect(() => {
            frozen.arr.push(4);
        }).toThrow();
        expect(() => {
            (frozen.arr[2] as any).nested = 4;
        }).toThrow();
    });

    it("should handle null values", () => {
        const obj = {
            a: null,
            b: {
                c: null
            }
        };
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.b)).toBe(true);
        expect(frozen.a).toBeNull();
        expect(frozen.b.c).toBeNull();
    });

    it("should handle undefined values", () => {
        const obj = {
            a: undefined,
            b: {
                c: undefined
            }
        };
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.b)).toBe(true);
        expect(frozen.a).toBeUndefined();
        expect(frozen.b.c).toBeUndefined();
    });

    it("should handle primitive values", () => {
        const obj = {
            str: "hello",
            num: 42,
            bool: true,
            nested: {
                str2: "world",
                num2: 24
            }
        };
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.nested)).toBe(true);
        expect(frozen.str).toBe("hello");
        expect(frozen.num).toBe(42);
        expect(frozen.bool).toBe(true);
    });

    it("should return the same object reference", () => {
        const obj = { a: 1, b: { c: 2 } };
        const frozen = deepFreeze(obj);

        expect(frozen).toBe(obj);
    });

    it("should handle empty objects", () => {
        const obj = {};
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(frozen).toBe(obj);
    });

    it("should handle complex nested structures", () => {
        const obj = {
            users: [
                { id: 1, name: "Alice", settings: { theme: "dark" } },
                { id: 2, name: "Bob", settings: { theme: "light" } }
            ],
            config: {
                database: {
                    host: "localhost",
                    credentials: {
                        username: "admin",
                        password: "secret"
                    }
                }
            }
        };
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.users)).toBe(true);
        expect(Object.isFrozen(frozen.users[0])).toBe(true);
        expect(Object.isFrozen(frozen.users[0].settings)).toBe(true);
        expect(Object.isFrozen(frozen.config)).toBe(true);
        expect(Object.isFrozen(frozen.config.database)).toBe(true);
        expect(Object.isFrozen(frozen.config.database.credentials)).toBe(true);

        expect(() => {
            frozen.users.push({ id: 3, name: "Charlie", settings: { theme: "auto" } });
        }).toThrow();
        expect(() => {
            (frozen.users[0] as any).name = "Alice Updated";
        }).toThrow();
        expect(() => {
            (frozen.config.database.credentials as any).password = "new-secret";
        }).toThrow();
    });

    it("should handle Date objects", () => {
        const date = new Date();
        const obj = {
            createdAt: date,
            nested: {
                updatedAt: new Date()
            }
        };
        const frozen = deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.nested)).toBe(true);
        expect(Object.isFrozen(frozen.createdAt)).toBe(true);
        expect(Object.isFrozen(frozen.nested.updatedAt)).toBe(true);
    });

    it("should preserve type information", () => {
        interface User {
            id: number;
            name: string;
            profile: {
                email: string;
            };
        }

        const user: User = {
            id: 1,
            name: "Test User",
            profile: {
                email: "test@example.com"
            }
        };

        const frozenUser = deepFreeze(user);

        expect(frozenUser.id).toBe(1);
        expect(frozenUser.name).toBe("Test User");
        expect(frozenUser.profile.email).toBe("test@example.com");
        expect(Object.isFrozen(frozenUser)).toBe(true);
        expect(Object.isFrozen(frozenUser.profile)).toBe(true);
    });
});
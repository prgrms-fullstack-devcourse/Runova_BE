
export interface DedicatedWorker<
    F extends (...args: unknown[]) => unknown
> {
    run: F;
    filename: string;
}

type __RunnerType<W extends DedicatedWorker<any>>
    = W extends DedicatedWorker<infer F> ? F : never;

export type WorkerParamsType<W extends DedicatedWorker<any>>
    = Parameters<__RunnerType<W>>;

export type WorkerReturnType<W extends DedicatedWorker<any>>
    = Awaited<ReturnType<__RunnerType<W>>>;
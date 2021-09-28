
import { AnyAction, Reducer } from 'redux';

export interface EffectsCommandMap {
    put: <A extends AnyAction>(action: A) => any;
    call: Function;
    select: Function;
    take: Function;
    cancel: Function;
    [key: string]: any;
}

export type Effect<StateType> = (
    action: AnyAction,
    effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export type Reducers<T> = {
    [x: string]: Reducer<T>;
}

export type Sagas<StateType> = {
    [x: string]: Effect<StateType>;
}

export interface Model<StateType> {
    /**
     * 命名空间
     */
    namespace: string;
    /**
     * 默认状态
     */
    defaultState: StateType;
    /**
     * reducers
     */
    reducers: Reducers<StateType>;
    /**
     * sagas
     */
    sagas?: Sagas<StateType>;

}
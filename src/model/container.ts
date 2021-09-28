import { Model } from "../framework/d.ts/model"

export type StateType = {
    isFullScreen: boolean;
}


const Container: Model<StateType> = {
    namespace: 'container',
    defaultState: {
        isFullScreen: false,
    },
    reducers: {
        toggleFullScreen: function (state: StateType) {
            return Object.assign({}, state, { isFullScreen: !state.isFullScreen });
        },
        default: (state: StateType) => {
            return state;
        }
    },
}


export default Container;
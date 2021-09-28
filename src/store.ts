/* eslint no-console:"off" */
import { createStore, applyMiddleware, Store, AnyAction } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as effectFunction from 'redux-saga/effects';
import { Model, Reducers } from './framework/d.ts/model';
// 这个model就是我们所有的逻辑文件
import models from "./model/index";

/**
 * 获取命名空间的正则表达式
 * action 格式为 命名空间/action名
 * @type {[reg]}
 */
const NAMESPACE_REG = /^(.*)\//;

/**
 * Redux 私有的事件
 * 初始化
 * 随机事件
 * @type {Object}
 */
const REDUX_ACTIONS = {
  INIT: `@@redux/INIT${Math.random().toString(36).substring(7).split('')
    .join('.')}`,
  PROBE_UNKNOWN_ACTION: `@@redux/PROBE_UNKNOWN_ACTION${Math.random().toString(36).substring(7).split('')
    .join('.')}`,
};

/**
 * reduer 生成器
 * 根据传入的model，返回一个reducer
 * @param  {object} m  model
 * @return {function} 返回reducer函数
 */
const reducerGenerator = <T = any>(m: Model<T>) => function reducerInner(state: T, action: AnyAction) {
  const matchResult = action.type.match(NAMESPACE_REG); // 摘取命名空间

  if (matchResult === null || matchResult[1] !== m.namespace) {
    if ('default' in m.reducers) {
      return m.reducers.default(m.defaultState, action);
    }
    return m.defaultState;
  }
  let rState;
  if (state === undefined) {
    // 初始化时 state 为undefined
    rState = m.defaultState;
  }
  // 剥去命名空间
  const type = action.type.replace(`${m.namespace}/`, '');

  if (type in m.reducers) {
    rState = m.reducers[type](state, action);
  } else if ('default' in m.reducers) {
    // 如果没有匹配的action，尝试调用default 方法
    rState = m.reducers.default(state, action);
  }
  return rState;
};

/**
 * 所有的reducer
 * @type {Object}
 */
const allReducers: Reducers<any> = {};

/**
 * 遍历所有的model
 * 为每一个model生成一个reducer
 * 并最后组装到 allReducers 中
 */
for (const k in models) {
  if (Object.prototype.hasOwnProperty.call(models, k)) { // 只处理model本身的属性
    const m = models[k];
    allReducers[m.namespace] = reducerGenerator(m);
  }
}

/**
 * 检查reducer是否符合规范
 * @param  {object} reducers 需要被检查的reducer集合
 * @return {null}          不返还任何值，如果有错误就会立刻抛出，中断执行
 */
function assertReducerShape(reducers: Reducers<any>) {
  Object.keys(reducers).forEach((key) => {
    const reducer = reducers[key];
    const initialState = reducer(undefined, { type: REDUX_ACTIONS.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error(`Reducer "${key}" 在初始化时返回了 undefined. ` +
        '如果传入 reducer 的 state 是 undefined, 你必须 ' +
        '显示地返回初始状态. 初始状态必须不是 ' +
        ' undefined. 如果你不想返回任何值, ' +
        '你可以使用 null，而不是 undefined.');
    }

    const type = REDUX_ACTIONS.PROBE_UNKNOWN_ACTION;
    if (typeof reducer(undefined, { type }) === 'undefined') {
      throw new Error(`Reducer "${key}" 在随机调用一个action时返回了 undefined. ` +
        `不要处理 在 ${REDUX_ACTIONS.INIT} 或其他在 @@redux 命名空间下的action  ` +
        ' 他们被设计为私有的. 实际上, 对于任何未知的 action ' +
        '你都必须返回当前的 state, 除非它是 undefined, ' +
        '在这种情况下，你必须返回初始状态, 不管是什么 action ' +
        '初始值都不能是 undefined，但可以是 null.');
    }
  });
}

/**
 * 组装错误信息，如果返回值为undefined
 * @param  {string} namespace 命名空间
 * @param  {object} action    action
 * @return {string}           组装好了的错误信息
 */
function getUndefinedStateErrorMessage(namespace: string, action: AnyAction) {
  const actionType = action && action.type;
  const actionDescription = (actionType && `action "${String(actionType)}"`) || '一个 action';

  return (
    `对于 ${actionDescription}, reducer "${namespace}" 返回了 undefined. ` +
    '如果要忽略一个action, 你必须显示返回先前的 state. ' +
    '如果你不想返回任何值，你可以返回null，而不是undefined'
  );
}

/**
 * 合并reducers
 * 这是我自己根据官网的源码实现的一个样板
 * 与官网的不同之处在于：
 * 1.如果有一个action被触发了，不会遍历每个reducer去匹配action，而是会根据命名空间，直接找到合适的reducer匹配action
 *   但是，@@redux命名空间下的除外，这是因为这个命名空间下的action一般适用于所有reducer
 * 2.如果有一个state发生了变化，不会改变整个state数，只会改变该命名空间下的state
 * @param  {object} reducers 需要被合并的reducer，是一个对象，对象的key就是命名空间，key对应的值就是一个model的reducers
 * @return {function}        合并后的reducer函数
 */
function combineReducers(reducers: Reducers<any>) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers: Reducers<any> = {};
  for (let i = 0; i < reducerKeys.length; i += 1) {
    const key = reducerKeys[i];

    // 开发环境下，检测是否提供了合适的reducer
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        console.error(`No reducer provided for key "${key}"`);
      }
    }
    // 我们只处理类型为function的数据，以免误伤一些自定义的数据，
    // 不过这不是十分必要，因为我们的规范里不允许在reducer里写别的东西
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  // 检测 reducer是否符合规范，即是否能返回正确的值，只要不返还undefined，一般都是合理的
  // 我们没有做重复性检测，即对同一个reducer，输入同样的值，应返回同样的结果，这是因为
  // 我们不确定reducer需要的数据类型，这个属于规范的范畴
  let shapeAssertionError;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  if (shapeAssertionError) {
    throw shapeAssertionError;
  }

  // 返回真正合并的函数
  return (inputState: any, action: AnyAction) => {
    if (!inputState) {
      inputState = {};
    }
    let nextState = {};

    // 判断是否符合命名规范并取出namespace
    const matchResult = action.type.match(NAMESPACE_REG);
    if (matchResult === null && action.type !== '@@INIT') {
      throw new Error(`${action.type} 不符合命名规范，正确的action 格式为：命名空间/action名。如 login/geturls`);
    }
    let namespace;
    if (action.type === '@@INIT') {
      namespace = action.type;
    } else {
      namespace = matchResult[1];
    }

    // 如果是 @@redux 命名空间下，遍历所有的reducer
    // 这个是因为 @@redux 命名空间下的事件一般就是INIT事件，它需要遍历所有的reducer
    // 以获取返回的初始化state，构建整个应用程序state树
    // @@INIT 是Redux dev tool 的事件
    if (namespace === '@@redux' || namespace === '@@INIT') {
      reducerKeys.forEach((reducerName) => {
        const reducer = finalReducers[reducerName];
        const currentDomainState = inputState[reducerName];
        const nextDomainState = reducer(currentDomainState, action);
        // 如果返回undefined，这问题就很大，我们不允许，中断执行
        if (typeof nextDomainState === 'undefined') {
          const errorMessage = getUndefinedStateErrorMessage(reducerName, action);
          throw new Error(errorMessage);
        }
        inputState[reducerName] = nextDomainState;
      });
      nextState = Object.assign({}, inputState);
    } else {
      // 不是 @@redux 下的action，我们只触发对应reducer里的action
      // 这是我们自己的实现，这种实现可以有效提高性能，降低模块间耦合性
      const reducer = finalReducers[namespace];
      const previousStateForNamespace = inputState[namespace];
      const nextStateForNamespace = reducer(previousStateForNamespace, action);
      // 如果返回undefined，这问题就很大，我们不允许，终端执行
      if (typeof nextStateForNamespace === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(action.type, action);
        throw new Error(errorMessage);
      }
      inputState[namespace] = nextStateForNamespace;
      nextState = Object.assign({}, inputState);
    }
    return nextState;
  };
}

/**
 * 创建 saga middleware
 * @type {object}
 */
const sagaMiddleware = createSagaMiddleware();
const initialState = {};



/**
 * saga 生成器
 * @param  {object} m 一个 model
 * @return {generator}  一个saga generator
 */
const sagaGenerator = (m: Model<any>) => function* sagaInner() {
  if ('sagas' in m) {
    // 根据函数的后缀名判断需要执行哪种 effect helper
    const everyReg = /(.*)Every$/;
    const latestEeg = /(.*)Latest$/;

    if (m.sagas) {
      for (const k in m.sagas) {
        if (everyReg.test(k)) {
          yield (effectFunction as any).takeEvery(`${m.namespace}/${k}`, m.sagas[k], effectFunction);
        } else if (latestEeg.test(k)) {
          yield (effectFunction as any).takeLatest(`${m.namespace}/${k}`, m.sagas[k], effectFunction);
        }
      }
    }
  }
};



function getStore() {
  /**
 * redux store
 * @type {object}
 */
  /* eslint-disable no-underscore-dangle */
  let store: Store<any>;

  if (process.env.NODE_ENV !== 'production') {
    store = createStore(
      combineReducers(allReducers),
      // initialState,
      (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
      applyMiddleware(sagaMiddleware),
    );
  } else {
    store = createStore(
      combineReducers(allReducers),
      initialState,
      applyMiddleware(sagaMiddleware),
    );
  }
  /* eslint-enable */
  /**
   * 订阅变化
   * @type {object}
   */
  store.subscribe(() => {
    // console.log(store.getState());
  });

  // 为每个model生成 saga（如有）
  for (const k in models) {
    if (Object.prototype.hasOwnProperty.call(models, k)) {
      const m = models[k];
      const saga = sagaGenerator(m);
      sagaMiddleware.run(saga);
    }
  }

  return store;
}

/**
 * 返回需要的store
 */
export default getStore;

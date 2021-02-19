// import { createStore } from 'redux'
import { createStore, applyMiddleware } from 'redux';
import { reducer } from './reducers'
// import { createLogger } from 'redux-logger';

// const loggerMiddleware = createLogger();



function configure(preloadedState) {
    /*
    https://redux.js.org/docs/advanced/Middleware.html
    To ensure that you may only apply middleware once, it operates on createStore()
    */
    const store = createStore(
        reducer,
        preloadedState,
        applyMiddleware(
            // loggerMiddleware
        )
    );
    // if (module.hot) {
    // 	// Enable Webpack hot module replacement for reducers
    // 	module.hot.accept('../reducers', () => {
    // 		const nextRootReducer = require('../reducers/index');
    // 		store.replaceReducer(nextRootReducer);
    // 	});
    // }
    return store;
}

const store = configure()
export default store;
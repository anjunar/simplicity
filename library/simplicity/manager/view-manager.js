const registry = new Map();

export const viewManager = new class ViewManager {
    load(url, queryParams, app, options) {
        let executor = (resolve, reject) => {
            let newPath = "../../../" + url;
            import(newPath)
                .then((module) => {
                    let view = module.default;
                    this.loadGuards(view, queryParams).then((object) => {
                        view = new view({app : app, ...object, ...options?.data, queryParams});
                        resolve(view);
                    })
                })
                .catch((result) => {
                    reject(result);
                })
        }

        return new Promise(executor);
    }

    loadGuards(viewClass, result = {}) {
        let executor = (resolve, reject) => {
            let queryParams = {queryParams : result};

            let configure = get(viewClass);

            if (configure?.guard) {

                let target = configure.guard(queryParams);

                let guardResult = Reflect.ownKeys(target);

                let promises = [];
                for (const property of guardResult) {
                    let guardResultElement = target[property];
                    promises.push(guardResultElement);
                }

                return Promise.all(promises).then((results) => {
                    resolve(guardResult.reduce((prev, property, index) => {
                        prev[property] = results[index];
                        return prev;
                    }, {}));
                })

            } else {
                resolve();
            }
        };

        return new Promise(executor);
    }
}

export function register(name, guard) {
    registry.set(name, guard)
}

export function get(name) {
    return registry.get(name);
}
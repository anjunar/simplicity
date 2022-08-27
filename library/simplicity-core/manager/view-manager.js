const registry = new Map();

export const viewManager = new class ViewManager {
    load(url, queryParams) {
        let executor = (resolve, reject) => {
            let newPath = "../../../" + url;
            import(newPath)
                .then((module) => {
                    let view;
                    view = new module.default();
                    this.loadGuards(view, queryParams).then(() => {
                        resolve(view);
                    })
                })
                .catch((result) => {
                    reject(result);
                })
        }

        return new Promise(executor);
    }

    loadGuards(view, result = {}) {
        let executor = (resolve, reject) => {
            view.queryParams = result;

            let configure = get(view.localName);

            if (configure.guard) {

                view.reload = () => {
                    let target = configure.guard(view);

                    let guardResult = Reflect.ownKeys(target);

                    let promises = [];
                    for (const property of guardResult) {
                        let guardResultElement = target[property];
                        promises.push(guardResultElement);
                    }

                    return Promise.all(promises).then((results) => {
                        view.$guards = [];
                        guardResult.forEach((property, index) => {
                            view[property] = results[index];
                            view.$guards.push(property);
                        });
                    })
                }

                view.reload().then(() => {
                    resolve();
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
import Ledger from "lib/Blockchain/ContractsLedger.js";

export const ERROR_FETCH_LEDGER = 'LoadLedger: An unknown error';
export const UPDATE_META = "UPDATE_META";

export default {
    namespaced: true,
    state: {
        meta: {
            loading: false,
            loadingError: false,
        },
    },
    modules: {},
    getters: {},
    mutations: {
        [UPDATE_META](state, payload) {
            Object.assign(state.meta, payload);
        },
    },
    actions: {
        async fetch({commit}) {
            commit(UPDATE_META, {loading: true, loadingError: false});

            let ledger;

            try {
                ledger = await Ledger;
            } catch (e) {
                commit(UPDATE_META, {loading: false, loadingError: e.message || ERROR_FETCH_LEDGER});
            }

            commit(UPDATE_META, {loading: false, loadingError: false});

            return ledger;
        }
    }
};




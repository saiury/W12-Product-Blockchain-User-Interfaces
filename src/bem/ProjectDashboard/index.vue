<template>
    <div class="ProjectDashboard buefy" v-if="!langMeta.loading">
        <section class="container">
            <h2>{{ $t('ProjectDashboard') }}</h2>

            <b-notification v-if="isError" type="is-danger" :closable="false" has-icon>
                <span v-if="ledgerMeta.loadingError">{{ ledgerMeta.loadingError }}</span>
                <span v-if="ProjectMeta.loadingError">{{ ProjectMeta.loadingError }}</span>
                <span v-if="accountMeta.loadingError">{{ accountMeta.loadingError }}</span>
            </b-notification>

            <b-notification v-if="!isError && isLoading" :closable="false">
                {{ $t('ProjectDashboardLoadExpect') }}
                <b-loading :is-full-page="false" :active="isLoading" :can-cancel="true"></b-loading>
            </b-notification>

            <div v-if="!isLoading">
                <ProjectSwitch v-if="!isCurrentToken"></ProjectSwitch>

                <b-notification v-if="ProjectMeta.loadingProjectError" :closable="false">
                    {{ ProjectMeta.loadingProjectError }}
                </b-notification>

                <div class="ProjectDashboard__project">
                    <TokenInfo v-if="!ProjectMeta.loadingProjectError && currentProject && currentProject.version" :is="TokenInfoVersion"></TokenInfo>
                    <ProjectStages v-if="!ProjectMeta.loadingProjectError && currentProject && currentProject.version" :is="ProjectStagesVersion"></ProjectStages>

                    <b-loading :is-full-page="false" :active="ProjectMeta.loadingProject" :can-cancel="true"></b-loading>
                </div>
            </div>
        </section>
        <Steps :number="5"></Steps>
    </div>
</template>

<script>
    import './default.scss';
    import ProjectSwitch from 'bem/ProjectSwitch';
    import Steps from "bem/Steps";

    import {createNamespacedHelpers} from 'vuex';

    const LedgerNS = createNamespacedHelpers("Ledger");
    const AccountNS = createNamespacedHelpers("Account");
    const ProjectNS = createNamespacedHelpers("Project");
    const LangNS = createNamespacedHelpers("Lang");

    export default {
        name: 'ProjectDashboard',
        components: {
            ProjectSwitch,
            Steps
        },
        computed: {
            ...LedgerNS.mapState({
                ledgerMeta: 'meta',
            }),
            ...AccountNS.mapState({
                currentAccount: "currentAccount",
                accountMeta: "meta",
                currentAccountData: "currentAccountData",
            }),
            ...ProjectNS.mapState({
                currentProject: "currentProject",
                ProjectMeta: "meta",
            }),
            ...LangNS.mapState({
                langMeta: 'meta'
            }),
            isError() {
                return this.ledgerMeta.loadingError || this.ProjectMeta.loadingProjectError || this.accountMeta.loadingError;
            },
            isLoading() {
                return (
                    this.accountMeta.loading
                    || this.ProjectMeta.loading
                );
            },
            TokenInfoVersion(){
                const v = this.currentProject.version;
                return () => import("bem/TokenInfo/" + v);
            },
            ProjectStagesVersion(){
                const v = this.currentProject.version;
                return () => import("bem/ProjectStages/" + v);
            },
            isCurrentToken(){
                return typeof CurrentToken !== 'undefined';
            }
        },
        watch: {
            'currentAccount': {
                handler: 'handleCurrentAccountChange',
                immediate: true
            },
            'currentProject': {
                handler: 'handleCurrentProjectChange',
                immediate: true
            }
        },
        methods: {
            ...AccountNS.mapActions({
                watchCurrentAccount: 'watch',
                updateAccountData: 'updateAccountData',
            }),
            ...ProjectNS.mapActions({
                ProjectFetchList: "fetchList",
                FetchProjectByCurrentToken: "fetchProjectByCurrentToken"
            }),

            async handleCurrentAccountChange(currentAccount) {
                if(currentAccount){
                    if(this.isCurrentToken){
                        await this.FetchProjectByCurrentToken(CurrentToken);
                    } else {
                        await this.ProjectFetchList();
                    }
                }
            },
            async handleCurrentProjectChange() {
                window.dispatchEvent(new Event('resize'));
            }
        },
        async created() {
            await this.watchCurrentAccount();
        },
    }
</script>

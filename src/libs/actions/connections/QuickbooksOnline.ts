import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {ConnectPolicyToAccountingIntegrationParams} from '@libs/API/parameters';
import type UpdateQuickbooksOnlineAutoCreateVendorParams from '@libs/API/parameters/UpdateQuickbooksOnlineAutoCreateVendorParams';
import type UpdateQuickbooksOnlineGenericTypeParams from '@libs/API/parameters/UpdateQuickbooksOnlineGenericTypeParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionName, Connections, IntegrationEntityMap} from '@src/types/onyx/Policy';

type ConnectionNameExceptNetSuite = Exclude<ConnectionName, typeof CONST.POLICY.CONNECTIONS.NAME.NETSUITE>;

function getQuickbooksOnlineSetupLink(policyID: string) {
    const params: ConnectPolicyToAccountingIntegrationParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

function buildOnyxDataForMultipleQuickbooksConfigurations<TConfigUpdate extends Partial<Connections['quickbooksOnline']['config']>>(
    policyID: string,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            ...configUpdate,
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE])),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            ...configCurrentData,
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                            errorFields: Object.fromEntries(
                                Object.keys(configUpdate).map((settingName) => [settingName, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')]),
                            ),
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map((settingName) => [settingName, null])),
                        },
                    },
                },
            },
        },
    ];
    return {
        optimisticData,
        failureData,
        successData,
    };
}

function updateQuickbooksOnlineAutoSync(policyID: string, settingValue: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            autoSync: {
                                enabled: settingValue ?? null,
                            },
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            autoSync: {
                                enabled: !settingValue ?? null,
                            },
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            autoSync: {
                                enabled: settingValue ?? null,
                            },
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_SYNC, parameters, {optimisticData, failureData, successData});
}

function buildOnyxDataForQuickbooksConfiguration<TSettingName extends keyof Connections['quickbooksOnline']['config']>(
    policyID: string,
    settingName: TSettingName,
    settingValue: Partial<Connections['quickbooksOnline']['config'][TSettingName]>,
) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [settingName]: settingValue ?? null,
                            pendingFields: {
                                [settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [settingName]: settingValue ?? null,
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [settingName]: settingValue ?? null,
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];
    return {
        optimisticData,
        failureData,
        successData,
    };
}

function updateQuickbooksOnlineEnableNewCategories(policyID: string, settingValue: boolean) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES, settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}

function updateQuickbooksOnlineAutoCreateVendor<TConfigUpdate extends Partial<Connections['quickbooksOnline']['config']>>(
    policyID: string,
    configUpdate: TConfigUpdate,
    configCurrentData: TConfigUpdate,
) {
    const onyxData = buildOnyxDataForMultipleQuickbooksConfigurations(policyID, configUpdate, configCurrentData);

    const parameters: UpdateQuickbooksOnlineAutoCreateVendorParams = {
        policyID,
        autoCreateVendor: JSON.stringify(configUpdate.autoCreateVendor),
        nonReimbursableBillDefaultVendor: JSON.stringify(configUpdate.nonReimbursableBillDefaultVendor),
        idempotencyKey: CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR,
    };

    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_CREATE_VENDOR, parameters, onyxData);
}

function updateQuickbooksOnlineSyncPeople(policyID: string, settingValue: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_PEOPLE, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlineReimbursableExpensesAccount<TConnectionName extends ConnectionNameExceptNetSuite, TSettingName extends keyof Connections[TConnectionName]['config']>(
    policyID: string,
    settingValue: Partial<Connections[TConnectionName]['config'][TSettingName]>,
) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT, settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, onyxData);
}

function updateQuickbooksOnlineSyncLocations(policyID: string, settingValue: IntegrationEntityMap) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS, settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_LOCATIONS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_LOCATIONS, parameters, onyxData);
}

function updateQuickbooksOnlineSyncCustomers(policyID: string, settingValue: IntegrationEntityMap) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS, settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_CUSTOMERS),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CUSTOMERS, parameters, onyxData);
}

function updateQuickbooksOnlineSyncClasses(policyID: string, settingValue: IntegrationEntityMap) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES, settingValue);
    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_CLASSES),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CLASSES, parameters, onyxData);
}

function updateQuickbooksOnlineNonReimbursableBillDefaultVendor(policyID: string, settingValue: string) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, parameters, onyxData);
}

function updateQuickbooksOnlineSyncTax(policyID: string, settingValue: boolean) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST.QUICK_BOOKS_CONFIG.SYNC_TAX, settingValue);

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.SYNC_TAX),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_TAX, parameters, onyxData);
}

function updateQuickbooksOnlineReimbursementAccountID(policyID: string, currentValue: string | undefined, settingValue: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: currentValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: settingValue ?? null,
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: null,
                            },
                            errorFields: {
                                [CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue,
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSEMENT_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
}

function updateQuickbooksOnlinePreferredExporter(policyID: string, currentValue: string | undefined, settingValue: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            export: {
                                exporter: settingValue ?? null,
                            },
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.EXPORT]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                exporter: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            export: {
                                exporter: currentValue ?? null,
                            },
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.EXPORT]: null,
                            },
                            errorFields: {
                                exporter: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {
                            export: {
                                exporter: settingValue ?? null,
                            },
                            pendingFields: {
                                [CONST.QUICK_BOOKS_CONFIG.EXPORT]: null,
                            },
                            errorFields: {
                                exporter: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateQuickbooksOnlineGenericTypeParams = {
        policyID,
        settingValue: JSON.stringify({exporter: settingValue}),
        idempotencyKey: String(CONST.QUICK_BOOKS_CONFIG.EXPORT),
    };
    API.write(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT, parameters, {optimisticData, failureData, successData});
}

export {
    getQuickbooksOnlineSetupLink,
    updateQuickbooksOnlineEnableNewCategories,
    updateQuickbooksOnlineAutoCreateVendor,
    updateQuickbooksOnlineReimbursableExpensesAccount,
    updateQuickbooksOnlineAutoSync,
    updateQuickbooksOnlineSyncPeople,
    updateQuickbooksOnlineReimbursementAccountID,
    updateQuickbooksOnlinePreferredExporter,
    updateQuickbooksOnlineNonReimbursableBillDefaultVendor,
    updateQuickbooksOnlineSyncTax,
    updateQuickbooksOnlineSyncClasses,
    updateQuickbooksOnlineSyncLocations,
    updateQuickbooksOnlineSyncCustomers,
};

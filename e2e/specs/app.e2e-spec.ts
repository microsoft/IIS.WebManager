import { Settings, TestManager, Utils } from '@microsoft/windows-admin-center-sdk/e2e';
import { EventViewer } from '../ui/eventViewer';

TestManager.doTest<EventViewer>(new EventViewer('Tool'), (testManager, testSuite) => {
    let strings = require('../../assets/strings/strings.json');

    testSuite.describe(
        'Events',
        () => {

            testSuite.beforeEach(async () => {
                await testManager.goToConnectionAndToolAsync(
                    Settings.connection, strings.Strings.MsftSmeEventViewer.title); // TODO: make it configurable.
            });

            testSuite.it('Should be able to select a root node and show "No log channel selected"', async () => {
                await testManager.tool.treeTable.GoToNodeByPathAsync(strings.Strings.MsftSmeEventViewer.windowsLogs);
                await testManager.tool.findElementAsync('sme-event-event-list > h3');
                const result = await testManager.tool.getTextAsync();
                expect(result.indexOf('No log channel selected.')).not.toEqual(-1);
            });

            testSuite.it('Should be able to select a default channel (Administrative Logs) and show proper actions', async () => {
                await testManager.tool.treeTable.GoToNodeByPathAsync(strings.Strings.MsftSmeEventViewer.administrativeLogs);
                await testManager.tool.dataTable.selectItemByIndexAsync(0);
                await testManager.tool.dataTable.waitForDataLoadedAsync();
                await testManager.tool.navigationTabs.clickByTextAsync(strings.Strings.MsftSmeEventViewer.eventDetails);
                await testManager.tool.detailPane.waitForVisibleAsync();
                const result = await testManager.tool.detailPane.propertyGrid.getValueByLabelAsync(
                    strings.Strings.MsftSmeEventViewer.logName + ':');
                expect(result).toContain('Admin');
            });

            testSuite.it(
                'Should be able to select a default channel(Administrative Logs) and search by key word(information)',
                async () => {
                    await testManager.tool.treeTable.GoToNodeByPathAsync(strings.Strings.MsftSmeEventViewer.administrativeLogs);
                    await testManager.tool.searchAsync(strings.Strings.MsftSmeEventViewer.information);
                    await testManager.tool.dataTable.selectItemByIndexAsync(0);
                    await testManager.tool.dataTable.waitForDataLoadedAsync();
                    await testManager.tool.navigationTabs.clickByTextAsync(strings.Strings.MsftSmeEventViewer.eventDetails);
                    await testManager.tool.detailPane.waitForVisibleAsync();
                    const result = await testManager.tool.detailPane.propertyGrid.getValueByLabelAsync(
                        strings.Strings.MsftSmeEventViewer.level + ':');
                    expect(result).toContain(strings.Strings.MsftSmeEventViewer.information);
                });

            testSuite.it('should be able to select a default channel (Application), an event and show its detail', async () => {
                await testManager.tool.treeTable.GoToNodeByPathAsync('Application');
                await testManager.tool.dataTable.selectItemByIndexAsync(0);
                await testManager.tool.dataTable.waitForDataLoadedAsync();
                await testManager.tool.navigationTabs.clickByTextAsync(strings.Strings.MsftSmeEventViewer.eventDetails);
                await testManager.tool.detailPane.waitForVisibleAsync();
                const result = await testManager.tool.detailPane.propertyGrid.getValueByLabelAsync(
                    strings.Strings.MsftSmeEventViewer.logName + ':');
                expect(result).toBe('Application');
            });

            testSuite.it('Should be able to select a default channel (Application) and show proper actions', async () => {
                await testManager.tool.treeTable.GoToNodeByPathAsync('Application');

                const actionBarDropDown = testManager.tool.actionBar.getChildUIObject(
                    { name: 'action bar dropdown', selector: 'sme-dropdown' });
                if (await actionBarDropDown.isVisibleAsync()) {
                    await actionBarDropDown.clickAsync();
                }

                const buttons = await testManager.tool.actionBar.findElementsAsync('button.sme-button-align-left');
                const button1Text = await Utils.getTextAsync(buttons[0]);
                const button2Text = await Utils.getTextAsync(buttons[1]);
                expect(button1Text).toBe(strings.Strings.MsftSmeEventViewer.clear);
                expect(button2Text).toBe(strings.Strings.MsftSmeEventViewer.export);
            });

            testSuite.it('Should be able to select a default channel (Setup) and show proper actions', async () => {
                await testManager.tool.treeTable.GoToNodeByPathAsync('Setup');
                let result = await testManager.tool.actionBar.moreButton.getTextAsync();
                if (result.length > 0) {
                    await testManager.tool.actionBar.moreButton.clickAsync();
                }
                result = await testManager.tool.actionBar.getTextAsync();
                expect(result).toContain('Log');
            });

            testSuite.it('Should be able to sort by date and time', async () => {
                await testManager.tool.treeTable.GoToNodeByPathAsync('Application');
                await testManager.tool.dataTable.selectItemByIndexAsync(0);
                if (Settings.browser !== 'MicrosoftEdge') {
                    const date1 = new Date(await testManager.tool.dataTable.getCellTextInSelectedItemAsync(
                        strings.Strings.MsftSmeEventViewer.dateAndTime));
                    await testManager.tool.dataTable.clickByTextAsync(strings.Strings.MsftSmeEventViewer.dateAndTime);
                    await testManager.tool.dataTable.selectItemByIndexAsync(0);
                    const date2 = new Date(await testManager.tool.dataTable.getCellTextInSelectedItemAsync(
                        strings.Strings.MsftSmeEventViewer.dateAndTime));
                    expect(date1.getTime()).toBeGreaterThan(date2.getTime());
                } else {
                    const date1 = await testManager.tool.dataTable.getCellTextInSelectedItemAsync(
                        strings.Strings.MsftSmeEventViewer.dateAndTime);
                    await testManager.tool.dataTable.clickByTextAsync(strings.Strings.MsftSmeEventViewer.dateAndTime);
                    await testManager.tool.dataTable.selectItemByIndexAsync(0);
                    const date2 = await testManager.tool.dataTable.getCellTextInSelectedItemAsync(
                        strings.Strings.MsftSmeEventViewer.dateAndTime);
                    expect(date1).not.toEqual(date2);
                }
            });

            testSuite.it('Should be able to Clear channel and show inactive buttons', async () => {
                await testManager.tool.treeTable.GoToNodeByPathAsync('Windows PowerShell');
                await testManager.tool.actionBar.clickActionButtonAsync(strings.Strings.MsftSmeEventViewer.clear);
                await TestManager.shell.switchToTopFrameAsync()
                await TestManager.shell.confirmationDialog.noButton.clickAsync();
                await TestManager.shell.switchToToolIFrameAsync()
                await testManager.tool.actionBar.clickActionButtonAsync(strings.Strings.MsftSmeEventViewer.clear);
                await TestManager.shell.switchToTopFrameAsync()
                await TestManager.shell.confirmationDialog.yesButton.clickAsync();
                await TestManager.shell.switchToToolIFrameAsync()

                await Utils.waitAsync(
                    async () => {
                        let itemElement = await testManager.tool.dataTable.getTextAsync();
                        return itemElement.lastIndexOf('No records found') !== -1;
                    },
                    'Wait for the channel to be empty.');

                await testManager.tool.actionBar.moreButton.clickAsync();
                const button1 = await testManager.tool.actionBar.findElementAsync('button', strings.Strings.MsftSmeEventViewer.clear);
                const isButton1Disabled = await Utils.isDisabledAsync(button1);
                const button2 = await testManager.tool.actionBar.findElementAsync('button', strings.Strings.MsftSmeEventViewer.export);
                const isButton2Disabled = await Utils.isDisabledAsync(button2);
                expect(isButton1Disabled && isButton2Disabled).toBeTruthy();
            });

            // NOTE: this test requires the edge's property: "Ask me what to do with each download" is "Off"
            testSuite.it('Should be able to Export channel', async () => {
                await testManager.tool.treeTable.GoToNodeByPathAsync('Setup');
                await testManager.tool.actionBar.clickActionButtonAsync(strings.Strings.MsftSmeEventViewer.export);
                await TestManager.shell.switchToTopFrameAsync();
                await TestManager.shell.alertBar.waitForAlertByTextAsync('Successfully downloaded \'Setup\'');
                await TestManager.shell.switchToToolIFrameAsync();
            });

            testSuite.it('Should be able to swap enable/disable a channel', async () => {
                const disableAction = async () => {
                    await testManager.tool.actionBar.clickActionButtonAsync(strings.Strings.MsftSmeEventViewer.disableLog);
                    await TestManager.shell.switchToTopFrameAsync();
                    await testManager.tool.alertBar.waitForAlertByTextAsync('Successfully disabled \'Setup\'');
                    await TestManager.shell.switchToToolIFrameAsync();
                }
                const enableAction = async () => {
                    await testManager.tool.actionBar.clickActionButtonAsync(strings.Strings.MsftSmeEventViewer.enableLog);
                    await TestManager.shell.switchToTopFrameAsync();
                    await testManager.tool.alertBar.waitForAlertByTextAsync('Successfully enabled \'Setup\'');
                    await TestManager.shell.switchToToolIFrameAsync();
                }
                await testManager.tool.treeTable.GoToNodeByPathAsync('Setup');
                await testManager.tool.actionBar.moreButton.clickAsync();
                const enableButton = await testManager.tool.actionBar.findElementAsync(
                    'button',
                    strings.Strings.MsftSmeEventViewer.enableLog);
                if (enableButton) {  // channel is disabled, enable it first
                    await enableAction();
                    await disableAction();
                } else {
                    await disableAction();
                    await enableAction();
                }
            });

            testSuite.it(
                'Should be able to select a default channel(Administrative Logs) and filter by Event Levels(information).',
                async () => {
                    await testManager.tool.treeTable.GoToNodeByPathAsync(
                        strings.Strings.MsftSmeEventViewer.administrativeLogs);
                    const filterButton = testManager.tool.getChildUIObject(
                        { name: 'Filter Button', selector: 'sme-master-view .sme-icon-filter' });
                    await filterButton.clickAsync();
                    const criticalCheckBox = testManager.tool.actionPane.getChildUIObject({
                        name: 'Critical checkBox',
                        selector: '#component-2-checkbox0'
                    });
                    await criticalCheckBox.clickAsync();
                    const infoCheckBox = testManager.tool.actionPane.getChildUIObject({
                        name: 'Error checkBox',
                        selector: '#component-2-checkbox1'
                    });
                    await infoCheckBox.clickAsync();
                    const warningCheckBox = testManager.tool.actionPane.getChildUIObject({
                        name: 'Warning checkBox',
                        selector: '#component-2-checkbox2'
                    });
                    await warningCheckBox.clickAsync();
                    const verboseCheckBox = testManager.tool.actionPane.getChildUIObject({
                        name: 'Verbose checkBox',
                        selector: '#component-2-checkbox4'
                    });
                    await verboseCheckBox.clickAsync();
                    await testManager.tool.actionPane.primaryButton.clickAsync();

                    await testManager.tool.treeTable.GoToNodeByPathAsync(strings.Strings.MsftSmeEventViewer.administrativeLogs);
                    await testManager.tool.dataTable.selectItemByIndexAsync(0);
                    await testManager.tool.dataTable.waitForDataLoadedAsync();
                    await testManager.tool.navigationTabs.clickByTextAsync(strings.Strings.MsftSmeEventViewer.eventDetails);
                    await testManager.tool.detailPane.waitForVisibleAsync();
                    const result = await testManager.tool.detailPane.propertyGrid.getValueByLabelAsync(
                        strings.Strings.MsftSmeEventViewer.level + ':');
                    expect(result).toContain(strings.Strings.MsftSmeEventViewer.information);
                });
        },
        ['servers']);
});
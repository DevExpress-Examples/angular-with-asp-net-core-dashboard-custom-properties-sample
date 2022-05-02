import { DashboardControl, ItemWidgetOptionEventArgs, ViewerApiExtension } from  'devexpress-dashboard';
import { CustomizeSectionsEventArgs, FormItemTemplates, OptionsPanelExtension } from 'devexpress-dashboard/designer';
import { CustomPropertyMetadata, GridItem, registerCustomProperty } from 'devexpress-dashboard/model';

const enabledHeaderFilterProperty = <CustomPropertyMetadata>{
    ownerType: GridItem,
    propertyName: 'headerFilterEnabled',
    defaultValue: false,
    valueType: 'boolean',
};

registerCustomProperty(enabledHeaderFilterProperty);

export class GridHeaderFilterExtension {
    name = 'GridHeaderFilter';

    private _dashboardControl: DashboardControl;

    constructor(dashboardControl: DashboardControl) {
        this._dashboardControl = dashboardControl;

    }
    start() {
        let viewerApiExtension = <ViewerApiExtension> this._dashboardControl.findExtension('viewer-api');
        if(viewerApiExtension) {
            viewerApiExtension.on('itemWidgetOptionsPrepared', this._onItemWidgetOptionsPrepared);
        }
        let optionsPanelExtension = <OptionsPanelExtension> this._dashboardControl.findExtension('item-options-panel');
        if(optionsPanelExtension) {
            optionsPanelExtension.on('customizeSections', this._onCustomizeSections);
        }
    }
    stop() {
        let viewerApiExtension = <ViewerApiExtension> this._dashboardControl.findExtension('viewer-api');
        if(viewerApiExtension) {
            viewerApiExtension.off('itemWidgetOptionsPrepared', this._onItemWidgetOptionsPrepared);
        }
        let optionsPanelExtension = <OptionsPanelExtension> this._dashboardControl.findExtension('item-options-panel');
        if(optionsPanelExtension) {
            optionsPanelExtension.off('customizeSections', this._onCustomizeSections);
        }
    }

    _onItemWidgetOptionsPrepared = (args: ItemWidgetOptionEventArgs) => {
        if(args.dashboardItem instanceof GridItem) {
            args.options['headerFilter'] = {
                visible: args.dashboardItem.customProperties.getValue(enabledHeaderFilterProperty.propertyName)
            };
        }
    }
    _onCustomizeSections = (args: CustomizeSectionsEventArgs) => {
        args.addSection({
            title: 'Header Filter (Custom)',

            items: [{
                dataField: enabledHeaderFilterProperty.propertyName,
                label: {
                    text: 'Header Filter'
                },
                template: FormItemTemplates.buttonGroup,
                editorOptions: {
                    keyExpr: 'value',
                    items: [{
                        value: true,
                        text: 'On'
                    }, {
                        value: false,
                        text: 'Off'
                    }]
                }
            }]
        });
    }
}

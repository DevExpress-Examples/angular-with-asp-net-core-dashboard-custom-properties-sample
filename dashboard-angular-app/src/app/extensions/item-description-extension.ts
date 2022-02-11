import * as Dashboard from 'devexpress-dashboard';
import * as Model from 'devexpress-dashboard/model';
import * as Designer from 'devexpress-dashboard/designer';

var svgIcon = '<svg version="1.1" id="iconDescription" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">.dx-dashboard-icon {fill:currentColor;}</style><path class="dx-dashboard-icon" d="M12,3c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S17,3,12,3z M12,19c-3.9,0-7-3.1-7-7s3.1-7,7-7s7,3.1,7,7S15.9,19,12,19z M12,17L12,17c-0.6,0-1-0.4-1-1v-5c0-0.6,0.4-1,1-1l0,0c0.6,0,1,0.4,1,1v5C13,16.6,12.6,17,12,17zM12,9L12,9c-0.6,0-1-0.4-1-1l0,0c0-0.6,0.4-1,1-1l0,0c0.6,0,1,0.4,1,1l0,0C13,8.6,12.6,9,12,9z"/></svg>';
Dashboard.ResourceManager.registerIcon(svgIcon);

// 1. Model
var enabledProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.DashboardItem,
    propertyName: "descriptionEnabled",
    defaultValue: false,
    valueType: 'boolean'
};
var textProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.DashboardItem,
    propertyName: "description",
    defaultValue: "",
    valueType: 'string'
};
var displayModeProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.DashboardItem,
    propertyName: "descriptionDisplayMode",
    defaultValue: 'Always',
    valueType: 'string'
};

Model.registerCustomProperty(enabledProperty);
Model.registerCustomProperty(displayModeProperty);
Model.registerCustomProperty(textProperty);

// 2. Viewer
function onItemCaptionToolbarUpdated(args) {
    var descriptionVisible = args.dashboardItem.customProperties.getValue(enabledProperty.propertyName);
    if (descriptionVisible) {
        var description = args.dashboardItem.customProperties.getValue(textProperty.propertyName);
        var displayMode = args.dashboardItem.customProperties.getValue(displayModeProperty.propertyName);
        var array = displayMode === 'OnHover' ? args.options.actionItems : args.options.stateItems;
        array.push({
            type: "button",
            icon: "iconDescription",
            tooltip: !!description ? description.toString() : undefined
        });
    }
};

// 3. Designer
function isDescriptionDisabled(dashboardItem) {
    return !dashboardItem.customProperties.getValue(enabledProperty.propertyName);
}
function changeDisabledState(dxForm, fieldName, isDisabled) {
    let itemOptions = dxForm.itemOption(fieldName)
    if(itemOptions) {
        let editorOptions = itemOptions.editorOptions || {}
        editorOptions.disabled = isDisabled
        dxForm.itemOption(fieldName, "editorOptions", editorOptions)
    }
}

function onCustomizeSections(args) {
    args.addSection({
        title: "Description (Custom)",
        onFieldDataChanged: function (e) { 
            e.component.beginUpdate();
            changeDisabledState(e.component, textProperty.propertyName, isDescriptionDisabled(args.dashboardItem));
            changeDisabledState(e.component, displayModeProperty.propertyName, isDescriptionDisabled(args.dashboardItem));
            e.component.endUpdate();
        },
        items: [
            {
                dataField: enabledProperty.propertyName,
                label: {
                    text: "Visible"
                },
                template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    keyExpr: "value",
                    items: [{
                        value: true,
                        text: "Visible"
                    }, {
                        value: false,
                        text: "Hidden"
                    }]
                }
            },
            {
                dataField: displayModeProperty.propertyName,
                label: {
                    text: "Display Mode"
                },
                template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    keyExpr: "value",
                    items: [{
                        value: "OnHover",
                        text: "On hover"
                    }, {
                        value: "Always",
                        text: "Always"
                    }],
                    disabled: isDescriptionDisabled(args.dashboardItem)
                }
            },
            {
                dataField: textProperty.propertyName,
                editorType: "dxTextArea",
                label: {
                    text: "Description"
                },
                editorOptions: {
                    height: 90,
                    disabled: isDescriptionDisabled(args.dashboardItem)
                }
            }
        ]
    });
};

// 4. Event Subscription
export class ItemDescriptionExtension {
    name = "ItemDescription";

    constructor(private dashboardControl: Dashboard.DashboardControl) {

    }

    start() {
        var viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.on('itemCaptionToolbarUpdated', onItemCaptionToolbarUpdated);
        }
        var optionsPanelExtension = <Designer.OptionsPanelExtension>this.dashboardControl.findExtension("item-options-panel");
        if (optionsPanelExtension) {
            optionsPanelExtension.on('customizeSections', onCustomizeSections);
        }
    };
    stop() {
        var viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.off('itemCaptionToolbarUpdated', onItemCaptionToolbarUpdated);
        }
        var optionsPanelExtension = <Designer.OptionsPanelExtension>this.dashboardControl.findExtension("item-options-panel");
        if (optionsPanelExtension) {
            optionsPanelExtension.off('customizeSections', onCustomizeSections);
        }
    };
}
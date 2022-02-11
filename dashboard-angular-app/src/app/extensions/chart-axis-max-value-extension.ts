import * as Dashboard from 'devexpress-dashboard';
import * as Model from 'devexpress-dashboard/model';
import * as Designer from 'devexpress-dashboard/designer';

// 1. Model
const axisMaxValueEnabledProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.ChartItem,
    propertyName: "AxisMaxValueEnabled",
    defaultValue: false,
    valueType: 'boolean'
};

const axisMaxValueIsBoundProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.ChartItem,
    propertyName: "AxisMaxValueIsBound",
    defaultValue: false,
    valueType: 'boolean'
};

const axisMaxValueConstantProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.ChartItem,
    propertyName: "AxisMaxValueConstant",
    defaultValue: 100,
    valueType: 'number'
};

const axisMaxValueDataItemProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.ChartItem,
    propertyName: "AxisMaxValueDataItem",
    defaultValue: '',
    valueType: 'string'
};
Model.registerCustomProperty(axisMaxValueEnabledProperty);
Model.registerCustomProperty(axisMaxValueIsBoundProperty);
Model.registerCustomProperty(axisMaxValueConstantProperty);
Model.registerCustomProperty(axisMaxValueDataItemProperty);

// 2. Viewer
function onItemWidgetOptionsPrepared(args) {
    if(args.dashboardItem.customProperties.getValue(axisMaxValueEnabledProperty.propertyName)) {
        var value = args.dashboardItem.customProperties.getValue(axisMaxValueConstantProperty.propertyName)
        if(args.dashboardItem.customProperties.getValue(axisMaxValueIsBoundProperty.propertyName)) {
            var measureId = args.dashboardItem.customProperties.getValue(axisMaxValueDataItemProperty.propertyName)
            value = args.itemData.getMeasureValue(measureId).getValue()
        }
        args.options.valueAxis[0].visualRange = [null, value]
    }   
}

// 3. Designer
function isAxisMaxValueDisabled(dashboardItem) {
    return !dashboardItem.customProperties.getValue(axisMaxValueEnabledProperty.propertyName);
}
function isBoundMode(dashboardItem) {
    return dashboardItem.customProperties.getValue(axisMaxValueIsBoundProperty.propertyName);
}
function changeDisabledState(dxForm, fieldName, isDisabled) {
    let itemOptions = dxForm.itemOption(fieldName)
    if(itemOptions) {
        let editorOptions = itemOptions.editorOptions || {}
        editorOptions.disabled = isDisabled
        dxForm.itemOption(fieldName, "editorOptions", editorOptions)
    }
}
function changeVisibleState(dxForm, fieldName, isVisible) {
    let itemOptions = dxForm.itemOption(fieldName, "visible", isVisible)
}

function updateFormState(dxForm, dashboardItem) {
    dxForm.beginUpdate();
    changeDisabledState(dxForm, axisMaxValueIsBoundProperty.propertyName, isAxisMaxValueDisabled(dashboardItem))
    changeDisabledState(dxForm, axisMaxValueConstantProperty.propertyName, isAxisMaxValueDisabled(dashboardItem))
    changeDisabledState(dxForm, axisMaxValueDataItemProperty.propertyName, isAxisMaxValueDisabled(dashboardItem))

    changeVisibleState(dxForm, axisMaxValueConstantProperty.propertyName, !isBoundMode(dashboardItem))
    changeVisibleState(dxForm, axisMaxValueDataItemProperty.propertyName, isBoundMode(dashboardItem))

    dxForm.endUpdate();
}

function onCustomizeSections(args) {
    if (args.dashboardItem instanceof Model.ChartItem) {
        args.addSection({
            title: "Primary Axis Max Value (Custom)",
            onFieldDataChanged: (e) => {
                updateFormState(e.component, args.dashboardItem);
            },
            onInitialized: (e) => {
                updateFormState(e.component, args.dashboardItem);
            },
            items: [
                {
                    dataField: axisMaxValueEnabledProperty.propertyName,
                    editorType: "dxCheckBox",
                    label: { visible: false },
                    editorOptions: {
                        text: "Enabled",
                    }
                },
                {
                    dataField: axisMaxValueIsBoundProperty.propertyName,
                    label: {
                        text: "Mode"
                    },
                    template: Designer.FormItemTemplates.buttonGroup,
                    editorOptions: {
                        keyExpr: "value",
                        items: [{
                            value: true,
                            text: "Bound"
                        }, {
                            value: false,
                            text: "Value"
                        }]
                    }
                },
                {
                    dataField: axisMaxValueConstantProperty.propertyName,
                    editorType: "dxTextBox",
                    label: {
                        text: "Value",
                    }
                },
                {
                    dataField: axisMaxValueDataItemProperty.propertyName,
                    editorType: "dxSelectBox",
                    label: {
                        text: "DataItem",
                    },
                    editorOptions: {
                        displayExpr: "text",
                        valueExpr: "value",
                        items: args.dashboardItem.hiddenMeasures().map(measure => ({
                            text: measure.name() || measure.dataMember(),
                            value: measure.uniqueName()
                        })),
                    }
                }
            ]
        })
    }
}

// 4. Event Subscription
export class  ChartAxisMaxValueExtension {
    name = "ChartAxisMaxValueExtension";

    constructor(private dashboardControl: Dashboard.DashboardControl) {
    }

    start() {
        let viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.on('itemWidgetOptionsPrepared', onItemWidgetOptionsPrepared);
        }
        let bindingPanelExtension = <Designer.OptionsPanelExtension>this.dashboardControl.findExtension("item-options-panel");
        if (bindingPanelExtension) {
            bindingPanelExtension.on('customizeSections', onCustomizeSections);
        }
    }
    stop() {
        let viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if (viewerApiExtension) {
            viewerApiExtension.off('itemWidgetOptionsPrepared', onItemWidgetOptionsPrepared);
        }
        let bindingPanelExtension = <Designer.OptionsPanelExtension>this.dashboardControl.findExtension("item-options-panel");
        if (bindingPanelExtension) {
            bindingPanelExtension.off('customizeSections', onCustomizeSections);
        }
    }
}
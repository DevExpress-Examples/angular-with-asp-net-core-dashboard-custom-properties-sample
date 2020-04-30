import * as Dashboard from 'devexpress-dashboard'
import * as Model from 'devexpress-dashboard/model'
import * as Designer from 'devexpress-dashboard/designer'
import dxForm, { dxFormOptions } from 'devextreme/ui/form';
import dxPopup from 'devextreme/ui/popup';
import dxButton from 'devextreme/ui/button';
import dxToolbar from 'devextreme/ui/toolbar';
import DataSource from 'devextreme/data/data_source';
import dxList, { dxListOptions } from 'devextreme/ui/list';


// 1. Model
var chartConstantLinesProperty: Model.CustomPropertyMetadata = {
    ownerType: Model.ChartItem,
    propertyName: 'ConstantLineSettings',
    defaultValue: "[]",
    valueType: 'string'
};

Model.registerCustomProperty(chartConstantLinesProperty);

// 2. Viewer
function onItemWidgetOptionsPrepared(args)  {
    if(args.dashboardItem instanceof Model.ChartItem) {
        var serializedConstantLines = args.dashboardItem.customProperties.getValue(chartConstantLinesProperty.propertyName);
        var constantLines = JSON.parse(serializedConstantLines);
        
        var valueAxisOptions = args.options["valueAxis"] || [];              
        constantLines.forEach(function(line) {
            var axisOptions = valueAxisOptions[0];
            if(axisOptions) {
                var value = line.value
                if(line.isBound) {
                    value = args.itemData.getMeasureValue(line.measureId).getValue()
                }
                axisOptions.constantLines = axisOptions.constantLines || [];
                axisOptions.constantLines.push({
                    value: value, 
                    color: line.color, 
                    dashStyle: 'longDash', 
                    width: 2, 
                    label: { 
                        text: line.labelText
                    }
                });
            }
        });
    }
}

// 3. Designer
function onCustomizeSections(args) {
    var chartItem = args.dashboardItem;
    if(chartItem instanceof Model.ChartItem) {
        args.addSection({
            title: "Constant Lines (custom)",
            items: [
                {
                    dataField: chartConstantLinesProperty.propertyName,
                    template: function(args, element) { 
                        var buttonContainer = document.createElement('div');
                        new dxButton(buttonContainer, {
                            text: 'Edit',
                            onClick: function() {
                                showPopup(chartItem)
                            }
                        })
                        return buttonContainer;
                    },
                    label: {
                        visible: false,
                    }
                }
            ]
        });
    }
}
function showPopup(chartItem) {
    var popupContainer = document.createElement('div');
    document.body.appendChild(popupContainer);
    var popupOptions = { 
        width : '800px',
        height : 'auto',
        closeOnOutsideClick: false,
        contentTemplate: function(contentContainer) {
            var formContainer = document.createElement('div');
            var formOptions = getFormOptions(chartItem);
            this._form = new dxForm(formContainer, formOptions);
            return formContainer;
        },
        onHidden: function() {
            document.body.removeChild(popupContainer)
        },
        title: 'Constant Lines',
    };
    var popup = new dxPopup(popupContainer, popupOptions);
    popup.show();
}

function getValue(chartItem) {
    return JSON.parse(chartItem.customProperties.getValue(chartConstantLinesProperty.propertyName))
}
function setValue(chartItem, value) {
    return chartItem.customProperties.setValue(chartConstantLinesProperty.propertyName, JSON.stringify(value))
}

function createListAndToolbar(form, chartItem) {
    var element = document.createElement('div');
    var toolbarContainer = document.createElement('div');
    element.appendChild(toolbarContainer);
    var editButton = null;
    var removeButton = null;
    var list = null;
    
    var toolbarOptions = {
        items: [{
            location: 'before',
            widget: 'dxButton',
            options: {
                icon: 'add',
                stylingMode: 'text',
                onClick: function (e) {
                    var constantLines = getValue(chartItem);
                    var key = constantLines.reduce(function(acc, item) { return acc < item.key ? item.key : acc }, 0) + 1
                    var newConstLine = {
                        key: key,
                        name: 'Constant Line' + key,
                        isBound: false,
                        measureId: '',
                        value: 0,
                        color: '#000000',
                        labelText: ''
                    };
                    form.option('formData', newConstLine);

                    var itemInDataSource = constantLines.filter(function(item) { return item.key === newConstLine.key} )[0];
                    if(!itemInDataSource) {
                        constantLines.push(newConstLine);
                    } else {
                        var index = constantLines.indexOf(itemInDataSource);
                        constantLines[index] = newConstLine;
                    }

                    setValue(chartItem, constantLines);  
                    list.reload();
                    list.option('selectedItem', constantLines[constantLines.length - 1]);
                    
                },
            }
        },
        {
            location: 'before',
            widget: 'dxButton',
            options: {
                icon: 'remove',
                stylingMode: 'text',
                onInitialized: function (e) { removeButton = e.component },
                onClick: function() {
                    var constantLines = getValue(chartItem);
                    var selectedKey = list.option('selectedItem').key;
                    var index = constantLines.indexOf(constantLines.filter(function(line) { return line.key === selectedKey })[0]);
                    if(index >= 0) {
                        constantLines.splice(index, 1);
                        setValue(chartItem, constantLines);
                        list.reload();
                        list.option('selectedItem', constantLines[constantLines.length - 1]);
                    }
                },
            }
        }]
    };

    var updateToolbarState = function (hasSelectedItem) {
        editButton && editButton.option('disabled', !hasSelectedItem);
        removeButton && removeButton.option('disabled', !hasSelectedItem);
    }
    
    var toolbar = new dxToolbar(toolbarContainer, toolbarOptions);

    var listOptions = <dxListOptions>{
        dataSource: new DataSource({ load: function() { return getValue(chartItem)} }),
        displayExpr: 'name',
        height: '200px',
        keyExpr: 'key',
        noDataText: 'Add a Constant Line',
        selectionMode: 'single',
        onContentReady: function (e) { updateToolbarState(!!e.component.option('selectedItem')) },
        onSelectionChanged: function (e) {
            updateToolbarState(!!e.component.option('selectedItem'));
            form.option('formData', e.component.option('selectedItem'));    
        } 
    };

    var listContainer = document.createElement('div');
    element.appendChild(listContainer);

    list = new dxList(listContainer, listOptions);

    return element;
}

function getFormOptions(chartItem) {
    var updateFormState = function (form) {
        var isBound = form.option('formData')['isBound'];
        var valueEditor = form.getEditor('value');
        valueEditor && valueEditor.option('disabled', isBound);
        var measureIdEditor = form.getEditor('measureId');
        measureIdEditor && measureIdEditor.option('disabled', !isBound);
    };
    return <dxFormOptions>{
        formData: getValue(chartItem)[0] || null,
        colCount: 2,
        items: [
            {
                itemType: 'group',
                template : function (args, element) { return createListAndToolbar(args.component, chartItem) },
            }, 
            {
                itemType: 'group',
                items : [
                    {
                        dataField: 'name',
                        editorType: 'dxTextBox',
                    }, 
                    {
                        dataField: 'isBound',
                        editorType: "dxCheckBox",
                        label: {
                            text: 'IsBound',
                        },
                    }, 
                    {
                        dataField: 'value',
                        editorType: 'dxNumberBox',
                        label: {
                            text: 'Value',
                        },
                        editorOptions: {
                            showSpinButtons: true,
                        }
                    },
                    {
                        dataField: 'measureId',
                        editorType: 'dxSelectBox',
                        label: {
                            text: 'Hidden measures',
                        },
                        editorOptions: {
                            displayExpr: 'text',
                            valueExpr: 'value',
                            items:  chartItem.hiddenMeasures().map(function(measure) { 
                                return {
                                    text: measure.name() || measure.dataMember(),
                                    value: measure.uniqueName()
                                }
                            }),
                        }
                    },
                    {
                        dataField: 'color',
                        editorType: 'dxColorBox',
                        label: {
                            text: 'Color',
                        }
                    },
                    {
                        dataField: 'labelText',
                        editorType: 'dxTextBox',
                    }
                ]
            }
        ],
        onContentReady: function(e) { updateFormState(e.component) },
        onFieldDataChanged: function(e) {
            var formData = e.component.option("formData");
            var constantLines = getValue(chartItem);
            var editedConstantLine = constantLines.filter(function(line) { return line.key === formData.key })[0];
            constantLines[constantLines.indexOf(editedConstantLine)] = formData;
            setValue(chartItem, constantLines);  
            updateFormState(e.component) 
        },
    };
}

// 4. Event Subscription
export class ChartConstantLinesExtension {
    name = 'ChartConstantLines';

    constructor(private dashboardControl: Dashboard.DashboardControl) {
    }

    start() {
        var viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if(viewerApiExtension) {
            viewerApiExtension.on('itemWidgetOptionsPrepared', onItemWidgetOptionsPrepared)
        }
        var optionsPanelExtension = <Designer.OptionsPanelExtension>this.dashboardControl.findExtension("item-options-panel")
        if(optionsPanelExtension) {
            optionsPanelExtension.on('customizeSections', onCustomizeSections)
        }
    }
    stop() {
        var viewerApiExtension = <Dashboard.ViewerApiExtension>this.dashboardControl.findExtension('viewer-api');
        if(viewerApiExtension) {
            viewerApiExtension.off('itemWidgetOptionsPrepared', onItemWidgetOptionsPrepared)
        }
        var optionsPanelExtension = <Designer.OptionsPanelExtension>this.dashboardControl.findExtension("item-options-panel")
        if(optionsPanelExtension) {
            optionsPanelExtension.off('customizeSections', onCustomizeSections)
        }
    }
}
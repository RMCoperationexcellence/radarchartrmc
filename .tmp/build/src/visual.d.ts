import powerbi from "powerbi-visuals-api";
import './../src/style.css';
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private formattingSettings;
    private formattingSettingsService;
    private chart;
    private updateCount;
    private textNode;
    constructor(options: VisualConstructorOptions);
    consoleupdatecount: number;
    update(options: VisualUpdateOptions): void;
    convertDataView(dataView: powerbi.DataView, options: VisualUpdateOptions): any[];
    getFormattingModel(): powerbi.visuals.FormattingModel;
}

import powerbi from "powerbi-visuals-api";
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
    update(options: VisualUpdateOptions): void;
    private convertDataView;
    getFormattingModel(): powerbi.visuals.FormattingModel;
}

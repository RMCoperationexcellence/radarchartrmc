"use strict";
import Chart from 'chart.js/auto';
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private chart : Chart;
    private updateCount: number;
    private textNode: Text;


    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.updateCount = 0;
        if (document) {
            const new_p: HTMLElement = document.createElement("p");
            new_p.appendChild(document.createTextNode("Update count:"));
            const new_em: HTMLElement = document.createElement("em");
            this.textNode = document.createTextNode(this.updateCount.toString());
            new_em.appendChild(this.textNode);
            new_p.appendChild(new_em);
            this.target.appendChild(new_p);
        }
    }
    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
        if (this.textNode) {
            this.textNode.textContent = (this.updateCount++).toString();
        }
        this.target.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.width = options.viewport.width;
        canvas.height = options.viewport.height;
        this.target.appendChild(canvas);
        
        const dataView: powerbi.DataView = options.dataViews[0];
        const data: any[] = this.convertDataView(dataView, options);
        console.log("Converted",data)

        const ctx = canvas.getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.map(d => d.category), // Replace with your category field
                datasets: [
                    {
                        label: 'เกณฑ์', // Replace with your label
                        data: data.map(d => d.reqscore), // Replace with your value field
                        backgroundColor: 'rgba(75, 192, 192, 0)', // Replace with desired colors
                        borderColor: 'rgba(255, 234, 32, 1)',
                        borderWidth: 3
                    },
                    {
                    label: 'คะแนนสอบ', // Replace with your label
                    data: data.map(d => d.score), // Replace with your value field
                    backgroundColor: 'rgba(141, 203, 230, 0.5)', // Replace with desired colors
                    borderColor: 'rgba(141, 203, 230, 1)',
                    borderWidth: 2
                },
                {
                    label: 'เต็ม', // Replace with your label
                    data: data.map(d => d.fullscore), // Replace with your value field
                    backgroundColor: 'rgba(75, 192, 192, 0)', // Replace with desired colors
                    borderColor: 'rgba(20, 20, 20, 1)',
                    borderWidth: 3
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true
                    }
                },
                elements: {
                    line: {
                      borderWidth: 10
                    }
                  }
            },
            plugins:[]

        });
    }
    private convertDataView(dataView: powerbi.DataView, options: VisualUpdateOptions): any[] {

        const categoryValues = dataView.categorical.categories[0].values;
        const scoreValues = dataView.categorical.values[0].values;
        const reqscoreValues = dataView.categorical.values[1].values;
        const fullscoreValues = dataView.categorical.values[2].values;
        // const selectedOptions = options.dataViews[0].metadata.segment;
        const data: any[] = [];
        for (let i = 0; i < categoryValues.length; i++) {
            data.push({
                category: categoryValues[i],
                score: scoreValues[i],
                reqscore: reqscoreValues[i],
                fullscore: fullscoreValues[i]

            });
        }
        return data;

    }
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
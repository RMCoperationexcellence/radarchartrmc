"use strict";
import Chart, { ChartConfiguration } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
        this.target.style.display = 'flex';
        this.target.style.justifyContent = 'right';
        this.target.style.alignItems = 'center';
        const canvas = document.createElement('canvas');
        canvas.width = options.viewport.width;
        canvas.height = options.viewport.height;
        this.target.appendChild(canvas);
        
        const dataView: powerbi.DataView = options.dataViews[0];
        const data: any[] = this.convertDataView(dataView, options);
        console.log("data converted",data)

        const ctx = canvas.getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }
        Chart.register(ChartDataLabels);
        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.map(d => d.category), // Replace with your category field
                datasets: [
                    {
                        label: 'คะแนนสอบ', // Replace with your label
                        data: data.map(d => d.score), // Replace with your value field
                        backgroundColor: 'rgba(57, 245, 22, 0.3)', // Replace with desired colors
                        borderColor: 'rgba(0, 81, 13, 1)',
                        borderWidth: 2,
                        pointBackgroundColor:'black',
                        datalabels:{
                            color: 'white',
                            font:{
                                size: 12,
                                weight: 'bold'
                            },
                            offset: 8,
                            align: 'center'
                        }
                    },
                    {
                        label: 'คะแนนเต็ม', // Replace with your label
                        data: data.map(d => d.fullscore), // Replace with your value field
                        backgroundColor: 'rgba(75, 192, 192, 0)', // Replace with desired colors
                        borderColor: 'rgba(0, 160, 199, 0.52)',
                        borderWidth: 1,
                        pointBackgroundColor:'rgba(0, 160, 199, 1)',
                        datalabels:{
                            color: 'white',
                            align: 'center'
                        }
                    },
                    {
                        label: 'คะแนนเกณฑ์', // Replace with your label
                        data: data.map(d => d.reqscore), // Replace with your value field
                        backgroundColor: 'rgba(255, 242, 4, 0.8)', // Replace with desired colors
                        borderColor: 'rgba(66, 66, 66, 0.8)',
                        borderWidth: 1,
                        pointBackgroundColor:'rgba(66, 66, 66, 0.8)',
                        datalabels:{
                            color: 'white'
                        },
                        pointRadius:8
                    }]
            },
            options: {
                color:'black',
                scales: {
                    r: {
                        min: 10,
                        max: 20,
                        pointLabels: {
                            color: (context) => {
                                // Use 'context.index' to access the index of the data point
                                const colorvalue = data[context.index].colorvalue;
                                return colorvalue === 'green' ? 'green' : 'black';
                            },
                            font:{
                                weight:'bold',
                                size: 13
                            }
                        },
                        ticks:{
                            backdropColor:'rgba(75, 192, 192, 0)'
                        }
                }},
                plugins: {
                    legend:{
                        display: true,
                        position: 'right',
                        labels: {
                            usePointStyle: true // This makes the legend labels use the same point style as data points
                        }
                    },
                    datalabels: {

                    }
                },
                aspectRatio: 21 / 9,
                elements: {
                    point: {
                        hoverRadius: 7,
                        radius: 10
                    },
                    line: {
                        tension: 0.2
                      }
              
                },
            }
        });
    }
    private convertDataView(dataView: powerbi.DataView, options: VisualUpdateOptions): any[] {
        // console.log("Check converted",dataView)
        const categoryValues = dataView.categorical.categories[0].values;
        const scoreValues = dataView.categorical.values[0].values;
        const reqscoreValues = dataView.categorical.values[1].values;
        const fullscoreValues = dataView.categorical.values[2].values;
        const maincourse = dataView.categorical.values[3].values;
        const data: any[] = [];

        
    
        // สร้างอาร์เรย์ช่วยในการเก็บข้อมูลสำหรับการเรียงลำดับ
 const sortableData: { category: any, index: number }[] = [];
    for (let i = 0; i < categoryValues.length; i++) {
        sortableData.push({
            category: categoryValues[i],
            index: i
        });
    }   

            // หลัก
            const filteredSortableData = sortableData.filter(item => item.category.includes("C1")|| item.category.includes("C2"));

    
        // เรียงลำดับตาม categoryValues
        sortableData.sort((a, b) => {
            // ควรปรับเปลี่ยนเงื่อนไขในการเปรียบเทียบตามค่าของ categoryValues ตามต้องการ
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            return 0;
        });
    
        // สร้างอาร์เรย์ข้อมูลที่เรียงลำดับแล้ว
        for (const sortedDataItem of sortableData) {
            const i = sortedDataItem.index;
            const colorvalue = maincourse[i] === 'Y' ? 'green' : 'red';
            const score = scoreValues[i] > 30 ? null : scoreValues[i];
            const reqscore = scoreValues[i] > 30 ? null : reqscoreValues[i];
            const fullscore = fullscoreValues[i] > 30 ? null : fullscoreValues[i];
            data.push({
                category: categoryValues[i],
                score: score,
                reqscore: reqscore,
                fullscore: fullscore,
                main: maincourse[i],
                colorvalue: colorvalue
            });
        }
    
        return data;
    }
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    
}
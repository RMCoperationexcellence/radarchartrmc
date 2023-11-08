        "use strict";
import Chart, { ChartConfiguration } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import annotationPlugin from 'chartjs-plugin-annotation';
import './../src/style.css';
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
        // console.log('Visual constructor', options);
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



    

    consoleupdatecount = 0;
    public update(options: VisualUpdateOptions) {
        console.clear();
        console.log("%cUPDATED ACTIVATE",'background-color: yellow',this.consoleupdatecount++)
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);
        this.target.innerHTML = '';
        this.target.style.display = 'flex';
        this.target.style.justifyContent = 'left';
        this.target.style.alignItems = 'left';
        const canvas = document.createElement('canvas');
        canvas.width = options.viewport.width;
        canvas.height = options.viewport.height;
        this.target.appendChild(canvas);
        
        let dataView: powerbi.DataView = options.dataViews[0];


        const calldata = (this.convertDataView(dataView, options));

        if (!calldata) {
            console.log('Blank');
          }

        let datamain = calldata.filter(d => d.main == "Y");

        let dataplus = calldata.filter(d => d.main == "N" && d.score !== null);

        let cgm = datamain[0].coursegroupid;

        let filteredData = calldata.filter(d => cgm.includes(d.courseid));

        let combinedData = [...filteredData,...dataplus]

        console.log("%cfilted data",'background-color: cyan; font-weight: bold',filteredData)
        console.log("%cMAIN DATA",'background-color: cyan; font-weight: bold',datamain)
        console.log("%cPLUS DATA",'background-color: cyan; font-weight: bold',dataplus)
        

        let datachart = combinedData

        console.log("%cData Chart",'background-color: lime; font-weight: bold',datachart)

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// C H A R T /////////////////////// C H A R T //////////////// C H A R T //////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////       

        const ctx = canvas.getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }


        Chart.register(ChartDataLabels);
        Chart.register(annotationPlugin);

        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: datachart.map(d => d.category), // Replace with your category field
                datasets: [
                    {
                        label: 'คะแนนสอบ', // Replace with your label
                        data: datachart.map(d => d.score), // Replace with your value field
                        backgroundColor: 'rgba(57, 245, 22, 0.3)', // Replace with desired colors
                        borderColor: 'rgba(0, 81, 13, 1)',
                        borderWidth: 2,
                        pointBackgroundColor:'rgba(0, 233, 27, 0.8)',
                        datalabels:{
                            color: 'black',
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
                        data: datachart.map(d => d.fullscore), // Replace with your value field
                        backgroundColor: 'rgba(75, 192, 192, 0)', // Replace with desired colors
                        borderColor: 'rgba(0, 160, 199, 0.52)',
                        borderWidth: 1,
                        pointBackgroundColor:'rgba(0, 160, 199, 1)',
                        datalabels:{
                            color: 'white',
                            align: 'center',
                            font:{
                                size:8
                            }
                        }
                    },
                    {
                        label: 'คะแนนเกณฑ์', // Replace with your label
                        data: datachart.map(d => d.reqscore), // Replace with your value field
                        backgroundColor: 'rgba(255, 242, 4, 0.8)', // Replace with desired colors
                        borderColor: 'rgba(66, 66, 66, 0.8)',
                        borderWidth: 1,
                        pointBackgroundColor:'rgba(66, 66, 66, 0.8)',
                        datalabels:{
                            color: 'white',
                            font:{
                                size:8
                            }
                        },
                        pointRadius:8
                    }]
            },
            options: {
                maintainAspectRatio: false,
                color:'black',
                scales: {
                    r: {
                        min: 10,
                        max: 20,
                        pointLabels: {
                            color: (context) => {
                                // Use 'context.index' to access the index of the data point
                                const colorvalue = datachart[context.index].colorvalue;
                                return colorvalue === 'green' ? 'green' : 'black';
                            },
                            font:{
                                weight:'bold',
                                size: 13
                            }},
                        ticks:{
                            backdropColor:'rgba(75, 192, 192, 0)'
                        }
                }},
                plugins: {
                    annotation: {
                      },
                    legend:{
                        display: true,
                        position: 'right',
                        labels: {
                            usePointStyle: false
                        }
                    }
                },
                aspectRatio: 21 / 9,
                elements: {
                    point: {
                        hoverRadius: 7,
                        radius: 10
                    }
              
                },
            }
        });
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// C H A R T /////////////////////// C H A R T //////////////// C H A R T //////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////     



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////// C O N V E R T    F U N C T I O N ////////////////////// C O N V E R T    F U N C T I O N ////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

    convertDataView(dataView: powerbi.DataView, options: VisualUpdateOptions): any[] {
        try{
            
        var css = "text-shadow: -1px -1px 0px var(--background), 3px 3px 0px var(--background), 6px 6px 0px #00000055; font-size: 28px; font-weight: bold; color: blue;"
        console.log("%cConvert data view activated !",css,dataView,options)
        const categoryValues = dataView.categorical.categories[0].values;
        const scoreValues = dataView.categorical.values[0].values;
        const reqscoreValues = dataView.categorical.values[1].values;
        const fullscoreValues = dataView.categorical.values[2].values;
        const maincourse = dataView.categorical.values[3].values;
        const position = dataView.categorical.values[4].values;
        const courseid = dataView.categorical.values[5].values;
        const coursegroupid = dataView.categorical.values[6].values;
        const nonNullIndex = coursegroupid.findIndex(item => item !== null);
        let cleanString = JSON.parse(coursegroupid[nonNullIndex].toString());
        console.log(cleanString)
        let finaldata = [];
        var css = "text-shadow: -1px -1px 0px var(--background), 3px 3px 0px var(--background), 6px 6px 0px #00000055; font-size: 18px; font-weight: bold; color: white; background-color:black;"
        console.log("%cMain course here",css,cleanString,options)
        console.log("data",finaldata)
    
        // เรียงลำดับข้อตัวอักษร
 const sortableData: { category: any, index: number }[] = [];
    for (let i = 0; i < categoryValues.length; i++) {
        sortableData.push({
            category: categoryValues[i],
            index: i
        });
    }   
        // เรียงลำดับตาม categoryValues
        try{sortableData.sort((a, b) => {
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            return 0;
        })}catch{console.log("Sort data error")}
    
        // final array
        for (const sortedDataItem of sortableData) { 
            const i = sortedDataItem.index;
            const colorvalue = maincourse[i] === 'Y' ? 'green' : 'red';
            const score = Number(scoreValues[i]) > 30 ? null : scoreValues[i];
            const reqscore = Number(scoreValues[i]) > 30 ? null : reqscoreValues[i];
            const fullscore = Number(fullscoreValues[i]) > 30 ? null : fullscoreValues[i];
            const positionID = position[i];
            const courseID = courseid[i];
            let category = categoryValues[i];
            if (colorvalue === 'green') {
                category = `⭐ ${category}`;
            };
            try{finaldata.push({
                category: category,
                score: score,
                reqscore: reqscore,
                fullscore: fullscore,
                main: maincourse[i],
                colorvalue: colorvalue,
                position: positionID,
                courseid: courseID,
                coursegroupid: cleanString
            })}catch{
                console.log("data push error")
            }
        }
        return finaldata;
        } catch (error){
            console.log(error)
            throw error;
        }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////// C O N V E R T    F U N C T I O N ////////////////////// C O N V E R T    F U N C T I O N ////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}

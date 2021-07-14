import React, { Component } from 'react'
import './tool.css'
import { Line } from 'react-chartjs-2'

export class Tool extends Component {
    constructor(props) {
        const initialState = {
            kurstillvaxt: 0.07,
            direktavkastning: 0.00,
            aterinvesteras: true,
            schablonskatt: 0.0145,
            kapitalskatt: 0.3,
            maxYears: 30,
            initialtVarde: 100.0,
            fondskatt: 0.0012
        }
        super(props);
        this.state = initialState;

        this.handleChange = this.handleChange.bind(this);
        this.handleAterinvesteras = this.handleAterinvesteras.bind(this);
    }

    generateChartData(values) {
        let labels = [];
        for (let year = 0; year < values.iskData.length; year++) {
            labels.push(year)
        }

        let datasets = [
            {
                label: "ISK",
                data: [...values.iskData],
                fill: true,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
            },/*
            {
                label: "Aktie & Fondkonto Brutto",
                data: [...values.afGrossData],
                fill: true,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
            },*/
            {
                label: "Aktie & Fondkonto Netto",
                data: [...values.afNetData],
                fill: true,
                backgroundColor: "rgba(0,255,0,0.2)",
                borderColor: "rgba(0,255,0,1)",
            }
        ]
        return { labels, datasets };
    }

    generateValues(initialValues) {
        let kurstillvaxt = parseFloat(initialValues.kurstillvaxt) + 1;
        let kurstillvaxtQ = Math.pow(kurstillvaxt, 1 / 4);
        let direktavkastning = parseFloat(initialValues.direktavkastning);
        let aterinvesteras = initialValues.aterinvesteras;
        let schablonskatt = parseFloat(initialValues.schablonskatt);
        let kapitalskatt = parseFloat(initialValues.kapitalskatt);
        let maxYears = parseFloat(initialValues.maxYears);
        let initialtVarde = parseFloat(initialValues.initialtVarde);
        let fondskatt = parseFloat(initialValues.fondskatt)


        let iskData = [initialtVarde];
        let afGrossData = [initialtVarde];
        let afNetData = [initialtVarde];

        //isk
        let iskVarde = initialtVarde;
        let iskUtdelning = 0;
        for (let year = 0; year < maxYears; year++) {
            //kurstillvaxt och basen för schablonskatt räknas ut
            let yearValue = 0;
            for (let quarter = 0; quarter < 4; quarter++) {
                yearValue += iskVarde / 4;
                iskVarde *= kurstillvaxtQ;
                
            }

            //nu kommer direktavkastning och schablonskatt
            if (aterinvesteras) {
                iskVarde += iskVarde*direktavkastning;
            } else {
                iskUtdelning += (iskVarde * direktavkastning);
            }
            iskVarde -= (schablonskatt * yearValue);
            iskData.push(iskVarde+iskUtdelning);
        }

        let afValue = initialtVarde;
        let afUtdelning = 0;
        for (let year = 0; year < maxYears; year++) {
            //afValue *=kurstillvaxt;
            for (let quarter = 0; quarter < 4; quarter++) {
                afValue *= kurstillvaxtQ;
            }


            if (aterinvesteras) {
                afValue = afValue + (afValue * (direktavkastning) * (1 - kapitalskatt));
            } else {
                afUtdelning = afUtdelning + (afValue * direktavkastning * (1 - kapitalskatt));
            }
            
            afValue = afValue * (1 - fondskatt);
            afGrossData.push(afValue);
            afNetData.push(initialtVarde + ((afValue - initialtVarde) * (1 - kapitalskatt) ) + afUtdelning);
        }



        if (!(iskData.length === afGrossData.length && iskData.length === afNetData.length)) {
            console.error("Data lengths do not match in 'generateValues()'.")
        }


        return {
            iskData,
            afGrossData,
            afNetData
        }
    }

    generateChartOptions(data) {

        return {
            scales: {
                xAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        stepSize:100,
                        maxTicksLimit: 200,
                    }
                }],
                
                yAxes: [{
                    ticks: {
                        //suggestedMin: 0,
                        //suggestedMax: suggestedMax
                        //max: 150
                    }
                }]
            }
        }

    }

    handleChange(e, nameOfVariable) {
        let asd = {}
        asd[nameOfVariable] = e.target.value;
        this.setState(asd)
    }

    handleAterinvesteras(bol) {
        this.setState({
            aterinvesteras: bol
        })
    }

    render() {
        return (
            <>
                <div className="row" style={{
                    margin: 0
                }}>
                    <div className="col-sm-2" style={{}}></div>

                    <div className="col-sm-8" style={{ backgroundColor: "white" }}>
                        

                        <form className='tool-form' >
                            <h2>Jämförelse av ISK och AF-konto</h2>
                            <small id="slutsats" className="form-text text-muted">Vad jag vill visa med den här simulationen är att det kan vara lönsamt att spara i ett Aktie &#38; Fondkonto i vissa situationer, 
                            särskilt om du investerar långsiktigt, med låg eller ingen utdelning och inte säljer dina värdepapper förens tidsperioden är över (för då måste du ju betala skatt). Ett realistiskt exempel på detta skulle kunna vara ifall du pensionssparar i fonder.  </small>
                            <div className="form-group">
                                <label htmlFor="kurstillvaxt">Årlig kurstillväxt</label>
                                <input type="number" step="0.0001" className="form-control" id="kurstillvaxt" aria-describedby="kurstillvaxtHelp"  onChange={(e) => this.handleChange(e, 'kurstillvaxt')} value={this.state.kurstillvaxt} />
                                <small id="kurstillvaxtHelp" className="form-text text-muted">
                                    Årlig värdeökning på en aktie exklusive utdelning. Ibland kallas denna siffra även för avkastning, men då är det lite oklart på vilket sätt utdelningar inkluderas. Kurstillväxten på Stockholmsbörsen varierar alltid.
                                    I perioden 1870 - 2019 låg den totala avkastningen (kurstillväxt + återinvestering av avkastning) på i snitt 9.24%. Från 1990 till 2019 låg avkastningen (exklusive utdelningar? OMX30, <a href="https://rikatillsammans.se/stockholmsborsens-arliga-avkastning/">källa</a>) på 12.49%,
                                    och 2009 - 2019 låg den på 10.51%. Det är vanligt att man räknar med en avkastning på 7%, eller 9% för de mer optimistiska, men dessa siffror brukar inkludera direktavkastning.
                                    Om du bara har värdepapper som inte ger utdelning (tex fonder) kan du bara ange den totala avkastningen här, men annars är det viktigt att det är just kurstillväxten du anger.
                                    </small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="direktavkastning">Direktavkastning</label>
                                <input type="number" step="0.0001" className="form-control" id="direktavkastning" aria-describedby="kurstillvaxtHelp" onChange={(e) => this.handleChange(e, 'direktavkastning')} value={this.state.direktavkastning}/>
                                <small id="direktavkastningHelp" className="form-text text-muted">Procentandel av värdet på en aktie som ges tillbaka som utdelning. För en fond är detta värdet 0. I skrivande stund ligger medeln på Stockholmsbörsen på 3.4%.</small>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input id='aterinvesteras' type="checkbox" onChange={e => this.handleAterinvesteras(e.target.checked)} checked={this.state.aterinvesteras} /> <small className="text-muted">Direktavkastning återinvesteras</small>
                                </label>
                            </div>
                            <div className="form-group">
                                <label htmlFor="schablonskatt">Schablonskatt</label>
                                <input type="number" step="0.0001" className="form-control" id="schablonskatt" aria-describedby="schablonskattHelp" onChange={(e) => this.handleChange(e, 'schablonskatt')} value={this.state.schablonskatt}/>
                                <small id="schablonskattHelp" className="form-text text-muted">Schablonskatten har historiskt sett legat mellan 0.90% och 2.09%, medelvärdet är 1.45%. <a href="https://sv.wikipedia.org/wiki/Investeringssparkonto">Källa</a>.</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="kapitalskatt">Kapitalskatt</label>
                                <input type="number" step="0.001" className="form-control" id="kapitalskatt" aria-describedby="kapitalskattHelp" onChange={(e) => this.handleChange(e, 'kapitalskatt')} value={this.state.kapitalskatt}/>
                                <small id="kapitalskattHelp" className="form-text text-muted">Kapitalskatten har legat på 30% i över 30 år.</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="fondskatt">Fondskatt</label>
                                <input type="number" step="0.001" className="form-control" id="fondskatt" aria-describedby="fondskattHelp" onChange={(e) => this.handleChange(e, 'fondskatt')} value={this.state.fondskatt} />
                                <small id="fondskattHelp" className="form-text text-muted">Fondskatten har legat på 0.12% sedan den infördes 2012.</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="kapitalskatt">Startkapital</label>
                                <input type="number" step="1" className="form-control" id="kapitalskatt" aria-describedby="kapitalskattHelp" onChange={(e) => this.handleChange(e, 'initialtVarde')} value={this.state.initialtVarde}/>
                                <small id="kapitalskattHelp" className="form-text text-muted">Mängden pengar på kontot från början.</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="kapitalskatt">Antal år</label>
                                <input type="number" step="1" className="form-control" id="kapitalskatt" aria-describedby="kapitalskattHelp" onChange={(e) => this.handleChange(e, 'maxYears')} value={this.state.maxYears}/>
                                <small id="kapitalskattHelp" className="form-text text-muted">Antal år som simulationen ska köras.</small>
                            </div>
                        </form>

                        {/*   
                            todo: optimise. I call the simulationg functions like 3 times
                        */}
                        <Line data={this.generateChartData(this.generateValues(this.state))} options={this.generateChartOptions(this.generateValues(this.state))} />
                        <small id="slutsats" className="form-text text-muted">Slutsumman blev 
                        {" " + Math.round(this.generateChartData(this.generateValues(this.state)).datasets[0].data[this.state.maxYears])} för ISK och 
                        {" " + Math.round(this.generateChartData(this.generateValues(this.state)).datasets[1].data[this.state.maxYears])} för AF-konto.</small>
                        <h5 id="how">Hur kan detta vara möjligt?</h5>
                        <small id="forklaring" className="form-text text-muted">Jo! På ett AF-konto skattar du inte på kurstillväxt förens du säljer, och ränta-på-ränta-effekten gör därför att den går om ISK i det långa loppet för värdepapper med låg eller ingen utdelning.</small>
                    </div>

                    <div className="col-sm-2"></div>
                </div>
            </>
        )
    }
}

export default Tool

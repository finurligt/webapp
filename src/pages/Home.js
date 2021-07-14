import React, { Component } from 'react'
import './Home.css'

export class Home extends Component {
    render() {
        return (
            <>
                <div className="row" style={{
                    margin: 0,
                }}>
                    <div className="col-sm-2" style={{}}></div>

                    <div className="col-sm-8" style={{ backgroundColor: "white", textAlign: "center" }}>
                        <header class="masthead text-center">
                            <h1 class="masthead-heading mb-0">Tja</h1>

                            <p class="masthead-subheading font-weight-light mb-0">Jag heter Fabian.</p>
                            <p class="masthead-subheading font-weight-light mb-0">Jag läser till civilingenjör i datateknik.</p>
                            <p class="masthead-subheading font-weight-light mb-0">Ibland gör jag lite dumma projekt och lägger upp dem här.</p>

                        </header>

                    </div>

                    <div className="col-sm-2"></div>
                </div>
            </>
        )
    }
}

export default Home

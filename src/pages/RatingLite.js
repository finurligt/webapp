import React, { Component } from 'react'
import './RatingLite.css'
import firebase from "firebase/app";
import 'firebase/database';


firebase.initializeApp({
    apiKey: "AIzaSyB2p-Nt_ALgVRPN6OMnpQMScns7KubTvzQ",
    authDomain: "finurligt-cfc45.firebaseapp.com",
    databaseURL: "https://finurligt-cfc45-default-rtdb.firebaseio.com",
    projectId: "finurligt-cfc45",
    storageBucket: "finurligt-cfc45.appspot.com",
    messagingSenderId: "831486484058",
    appId: "1:831486484058:web:29fc9f6f632e12845b8263",
    measurementId: "G-DY95FM51QH"
})
const db = firebase.database();


//const database = firebase.database().ref().child("ratingLite")

export class RatingLite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            league: undefined,
            winner: undefined,
            loser: undefined,
            games: []
        }

        this.submitGame = this.submitGame.bind(this);
        this.updateWinner = this.updateWinner.bind(this);
        this.updateLoser = this.updateLoser.bind(this);

    }

    submitGame(e) {
        e.preventDefault();

        firebase.database().ref('ratingLite/'+this.state.league).push({
            winner: this.state.winner,
            loser: this.state.loser,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            valid: true
        });
    }

    updateWinner(e) {
        this.setState({
            winner: e.target.value
        })
    }

    updateLoser(e) {
        this.setState({
            loser: e.target.value
        })
    }

    componentDidMount() {
        var dbRef = db.ref('ratingLite');
        dbRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log(data)
            
            
            this.setState({
                games: Object.values(data)
            })
        });
    }

    render() {
        let games = this.state.games;

        let map = {}
        games.forEach((game) => {
            let winnerElo = map[game.winner] ? map[game.winner] : 1200;
            let loserElo = map[game.loser] ? map[game.loser] : 1200;

            var expectedA = 1 / (1 + Math.pow(10,(loserElo-winnerElo)/400));

            var kValue = 40;
            var ratingChange = Math.round(kValue*(1-expectedA));

            map[game.winner]=winnerElo+ratingChange;
            map[game.loser]=loserElo-ratingChange;
        })
        let players = Object.entries(map).sort((a,b) => b[1]-a[1]);

        

        return (
            <>
                <div className="row" style={{
                    margin: 0
                }}>
                    <div className="col-sm-3" style={{}}></div>

                    <div className="col-sm-6" style={{ textAlign: "left", backgroundColor: "white" }}>
                        <select class="form-select" aria-label="Default select example" style={{marginTop:"20px"}}>
                            <option selected>Open this select menu</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </select>
                        <form className="gameForm" onSubmit={this.submitGame}>
                            <div className="form-group">
                                <label htmlFor="inputWinner">Winner</label>
                                <input required type="text" className="form-control" id="inputWinner" placeholder="Winner"
                                    value={this.state.winner} onChange={this.updateWinner} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputLoser">Loser</label>
                                <input required type="text" className="form-control" id="inputLoser" placeholder="Loser"
                                    value={this.state.loser} onChange={this.updateLoser} />
                            </div>

                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>
                        
                        <div className="gameList" style={{ textAlign: "center"}}>
                            <h2 >Players</h2>
                            {players.map(player => (
                                <div >
                                    <div>
                                        <div className="row">

                                            <div className="col-6" style={{textAlign:"left"}} >{player[0]}</div>
                                            <div className="col-6" style={{textAlign:"right"}} >{player[1]}</div>


                                        </div>
                                        <hr />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="gameList" style={{ textAlign: "center"}}>
                            <h2 >Game History</h2>
                            {games.map(game => (
                                <div >
                                    <div>
                                        <div className="row">

                                            <div className="col-6" style={{textAlign:"left"}} >{game.winner}</div>
                                            <div className="col-6" style={{textAlign:"right"}} >{game.loser}</div>


                                        </div>
                                        <hr />
                                    </div>
                                </div>
                            ))}
                        </div>



                    </div>

                    <div className="col-sm-3"></div>
                </div>
            </>
        )
    }
}

export default RatingLite
